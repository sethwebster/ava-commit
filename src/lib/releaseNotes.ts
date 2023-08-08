import { OpenAIChat } from "langchain/llms/openai";
import { configure, loadConfig } from "./configure.js";
import git from "./git.js";
import MessagesForCurrentLanguage, { convertAnswerToDefault } from "./messages.js";
import { summarizeDiffs } from "./summarize.js";
import { Animation } from 'chalk-animation';
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { compareVersions } from 'compare-versions';
import { countWords } from "alfaaz";
import promptTemplates from "./promptTemplates.js";
import packageJson from "./packageJson.js";
import chalk from "chalk";
import { input, select } from "@inquirer/prompts";
import { exec } from "./spawn.js";
import { fetchLatestNpmVersion } from "./environment.js";
import Logger from "./logger.js";
import { VersionInfo } from "../types.js";
import { formatMessage } from "./formatMessage.js";

var chalkAnimation: { rainbow: (text: string) => Animation; };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();

type CreateReleaseNotesOptions = {
  verbose?: boolean;
}
type ComparisonVersions = {
  baseVersion: string;
  currentVersion: string;
}

function evaluateVersions(versions: VersionInfo): { [key: string]: boolean } {
  const { packageJsonVersion, latestTaggedGitVersion, latestNpmVersion } = versions;
  const npmPackageNotFound = latestNpmVersion === "-1.-1.-1";
  return {
    npmIsNewerThanLocal: npmPackageNotFound ? false : compareVersions(latestNpmVersion ?? "0.0.0", packageJsonVersion) > 0,
    localIsNewerThanNpm: compareVersions(packageJsonVersion, latestNpmVersion ?? "0.0.0") > 0,
    latestTaggedIsGreaterThanLocalButNpmIsNewer:
      compareVersions(latestTaggedGitVersion ?? "0.0.0", packageJsonVersion) > 0 &&
      npmPackageNotFound ? false : compareVersions(latestNpmVersion ?? "0.0.0", packageJsonVersion) > 0,
    packageBumpNecessary:
      compareVersions(packageJsonVersion, latestTaggedGitVersion ?? "0.0.0") <= 0 &&
      npmPackageNotFound ? false :compareVersions(packageJsonVersion, latestNpmVersion ?? "0.0.0") <= 0,
    allVersionsAreEqual:
      compareVersions(packageJsonVersion, latestTaggedGitVersion ?? "0.0.0") === 0 &&
      npmPackageNotFound ? false : compareVersions(packageJsonVersion, latestNpmVersion ?? "0.0.0") === 0,
  };
}

export async function createReleaseNotes({
  verbose,
}: CreateReleaseNotesOptions = { verbose: false }) {
  Logger.verbose("[createReleaseNotes] Creating release notes...");
  const config = loadConfig();
  if (!config.openAIApiKey) {
    await configure({});
    createReleaseNotes({});
    return;
  }

  Logger.verbose("[createReleaseNotes] Fetching versions...");
  const versions = await fetchVersions();
  const versionComparisons = evaluateVersions(versions);
  const comparisonVersions: ComparisonVersions = {
    baseVersion: '0.0.0',
    currentVersion: 'HEAD',
  };

  const {
    npmIsNewerThanLocal,
    latestTaggedIsGreaterThanLocalButNpmIsNewer,
    packageBumpNecessary,
    allVersionsAreEqual,
    localIsNewerThanNpm,
  } = versionComparisons;

  switch (true) {
    case latestTaggedIsGreaterThanLocalButNpmIsNewer:
      console.log(
        formatMessage(MessagesForCurrentLanguage.messages["latest-tagged-is-greater-than-local-but-npm-is-newer"], {
          latestTaggedGitVersion: chalk.yellow(versions.latestTaggedGitVersion ?? "0.0.0"),
          latestNpmVersion: chalk.yellow(versions.latestNpmVersion ?? "0.0.0"),
        })
      );
      console.log('Do you have the latest changes?');
      process.exit(1);
      break;
    case npmIsNewerThanLocal:
      console.log(
        formatMessage(MessagesForCurrentLanguage.messages["npm-is-newer-than-local"], {
          latestNpmVersion: chalk.yellow(versions.latestNpmVersion ?? "0.0.0"),
          packageJsonVersion: chalk.yellow(versions.packageJsonVersion),
        })
      );
      console.log('Do you have the latest changes?');
      process.exit(1);
      break;
    case packageBumpNecessary:
      if (
        await resolveLocalPackageUpdate({
          localPackageVersion: versions.packageJsonVersion,
          remotePackageVersion: versions.latestTaggedGitVersion ?? "0.0.0",
          npmPackageVersion: versions.latestNpmVersion ?? "0.0.0",
        })
      ) {
        const latestVersion = packageJson.packageVersionFromProject() ?? '0.0.0';
        if (compareVersions(versions.packageJsonVersion, latestVersion) > 0) {
          comparisonVersions.currentVersion = latestVersion.startsWith('v') ? latestVersion : `v${latestVersion}`;
        }
      }
    // fall-through intended
    case allVersionsAreEqual:
      comparisonVersions.baseVersion = versions.latestTaggedGitVersion ?? "0.0.0";
      break;
    case localIsNewerThanNpm:
      comparisonVersions.baseVersion = `v${versions.latestNpmVersion ?? "0.0.0"}`;
      break;
    default:
      // Compare to latest version
      comparisonVersions.baseVersion = versions.latestTaggedGitVersion ?? "0.0.0";
      break;
  }
  await doCreateReleaseNotes({ verbose, ...comparisonVersions });
}

async function fetchVersions(): Promise<VersionInfo> {
  const packageJsonVersion = packageJson.packageVersionFromProject() ?? "0.0.0";
  const latestTaggedGitVersion = await getLatestTaggedGitVersion() ?? "0.0.0"
  const latestNpmVersion = await fetchLatestNpmVersion();
  const previousTaggedGitVersion = await getPreviousTaggedGitVersion(latestTaggedGitVersion ?? "");
  return { packageJsonVersion, latestTaggedGitVersion, latestNpmVersion, previousTaggedGitVersion };
}

export async function doCreateReleaseNotes({ verbose, baseVersion, currentVersion }: CreateReleaseNotesOptions & ComparisonVersions = { verbose: false, baseVersion: '0.0.0', currentVersion: 'HEAD' }) {
  const config = loadConfig();
  if (!config.openAIApiKey) {
    await configure({});
    createReleaseNotes({});
    return;
  }

  Logger.log(`Generating release notes between ${chalk.yellow(baseVersion)} and ${chalk.yellow(currentVersion)}...`)

  const diffs = await git.diff({ baseCompare: baseVersion, compare: currentVersion });
  const previousCommitMessages = await git.log({ baseCompare: baseVersion, compare: currentVersion });
  const summaries = await summarizeDiffs({ openAIApiKey: config.openAIApiKey, diffs, verbose });
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: config.openAIApiKey,
    modelName: config.summarizeSummariesModel,
    maxTokens: -1,
    streaming: true,
  });


  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.releaseNotes,
    verbose: verbose,
  });
  const mappedSummaries = summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n");
  let summaryText = "";
  const summary = await chain.call({ summaries: mappedSummaries, previousCommitMessages, numberOfDiffs: summaries.length, previous: baseVersion, latest: currentVersion }, [
    {
      handleLLMNewToken: (token) => {
        summaryText += token;
        const wordCount = countWords(summaryText);
        (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-working']} ${wordCount} ${MessagesForCurrentLanguage.messages['words']}`);
      }
    }
  ]) as { text: string; };
  console.log(summary.text);
}

async function resolveLocalPackageUpdate({ localPackageVersion, remotePackageVersion, npmPackageVersion }: { npmPackageVersion: string; localPackageVersion: string; remotePackageVersion: string }) {
  // If the version on npm is less than the local or remote tagged version,
  // there is no reason to update so lets return
  console.log(`+++ NPM ${npmPackageVersion} +++ Local ${localPackageVersion} +++ Remote ${remotePackageVersion}`);

  console.warn(
    `⚠️  ${chalk.yellow(MessagesForCurrentLanguage.messages['update-package-version'])}`
  );

  const userAnswer = await input({
    message: MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"].text, default:
      MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"].answers?.yes
  });

  const answer = convertAnswerToDefault(MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"], userAnswer, "y");
  if (answer === "y") {
    const answer = await getPatchMinorMajor()
    await executePatchMinorMajor(answer);
    return true;
  }
  return false;
}

async function executePatchMinorMajor(answer: string) {
  try {
    switch (answer) {
      case "patch":
        await exec("npm version patch -m 'chore: Bump package version %s'");
        break;
      case "minor":
        await exec("npm version minor -m 'chore: Bump package version %s'");
        break;
      case "major":
        await exec("npm version major -m 'chore: Bump package version %s'");
        break;
    }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("Git working directory not clean")) {
        console.log(`Git working directory not clean. Aborting package version bump. Run \`ava-commit generate\` to generate a commit and try again.`);
        process.exit(1);
      }
    }
    throw e;
  }
}

async function getPatchMinorMajor() {
  return await select({
    message: MessagesForCurrentLanguage.messages["select-version-update-type"],
    choices: [
      { name: MessagesForCurrentLanguage.messages["patch"], value: "patch" },
      { name: MessagesForCurrentLanguage.messages["minor"], value: "minor" },
      { name: MessagesForCurrentLanguage.messages["major"], value: "major" },
    ]
  });
}

async function getPreviousTaggedGitVersion(latest: string) {
  const tags = (await git.tags()).sort((a, b) => {
    return compareVersions(a, b);
  }).reverse();
  const latestIndex = tags.indexOf(latest);
  const previous = tags[latestIndex + 1];
  return previous;
}

async function getLatestTaggedGitVersion() {
  await git.fetch({ all: true });

  const tags = (await git.tags()).sort((a, b) => {
    return compareVersions(a, b);
  }).reverse();
  const latest = tags.shift();
  return latest;
}
