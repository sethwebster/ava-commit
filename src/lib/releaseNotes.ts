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

var chalkAnimation: { rainbow: (text: string) => Animation; };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();

export async function createReleaseNotes({ verbose }: { verbose?: boolean } = { verbose: false }) {
  const config = loadConfig();
  if (!config.openAIApiKey) {
    await configure({});
    createReleaseNotes({});
    return;
  }
  var { baseCompare, latest } = await resolveComparisonVersions();
  const diffs = await git.diff({ baseCompare, compare: "HEAD" });
  const summaries = await summarizeDiffs(config.openAIApiKey, diffs, verbose);
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
  const summary = await chain.call({ summaries: mappedSummaries, numberOfDiffs: summaries.length, latest }, [
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

async function resolveComparisonVersions() {
  const latest = await getLatestTaggedGitVersion();
  if (latest) resolveLocalPackageUpdate(latest);
  const localPackageVersion = packageJson.packageVersion();
  let baseCompare = latest;
  if (localPackageVersion.replace("v", "") === latest?.replace("v", "")) {
    // Versions are equal so we should use the previous version for the head 
    // comparison
    let previous = await getPreviousTaggedGitVersion(latest ?? "");
    console.log(`Local version and latest tag are equal (${chalk.yellow(latest)}). Using previous version ${chalk.yellowBright(previous)} for comparison.`);
    baseCompare = previous;
  }
  return { baseCompare, latest };
}

async function resolveLocalPackageUpdate(latest: string) {
  const localPackageVersion = packageJson.packageVersion();
  if (compareVersions(latest!, localPackageVersion) >= 0) {
    
    // Versions match, we should prompt the user to update
    const npmVersion = await fetchLatestNpmVersion();
    // If the version on npm is less than the local or remote tagged version,
    // there is no reason to update so lets return
    if (compareVersions(npmVersion, localPackageVersion) <= 0) {
      return;
    }
    console.log(`Remote +++ ${latest} Local +++ ${localPackageVersion}`);
    console.warn(
      `⚠️  ${chalk.yellow(MessagesForCurrentLanguage.messages['update-package-version'])}`
    );

    const userAnswer = await input({
      message: MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"].text, default:
        MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"].answers?.yes
    });

    const answer = convertAnswerToDefault(MessagesForCurrentLanguage.prompts["offer-automatic-package-bump"], userAnswer, "y");
    if (answer === "y") {
      const answer = await select({
        message: MessagesForCurrentLanguage.messages["select-version-update-type"],
        choices: [
          { name: MessagesForCurrentLanguage.messages["patch"], value: "patch" },
          { name: MessagesForCurrentLanguage.messages["minor"], value: "minor" },
          { name: MessagesForCurrentLanguage.messages["major"], value: "major" },
        ]
      })
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
    }
  }
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
