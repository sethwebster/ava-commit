import { OpenAIChat } from "langchain/llms/openai";
import { configure, loadConfig } from "./configure.js";
import git from "./git.js";
import MessagesForCurrentLanguage from "./messages.js";
import { summarizeDiffs } from "./summarize.js";
import { Animation } from 'chalk-animation';
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { compareVersions } from 'compare-versions';
import { countWords } from "alfaaz";
import promptTemplates from "./promptTemplates.js";
import packageJson from "./packageJson.js";

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
  await git.fetch({ all: true });
  const latest = await getLatestTaggedVersion();
  const localPackageVersion = packageJson.packageVersion();
  console.log(`Remote +++ ${latest} Local +++ ${localPackageVersion}`);
  if (latest === localPackageVersion) {
    // Versions match, we should prompt the user to update
    console.log(MessagesForCurrentLanguage.messages['update-package-version']);
  }
  const diffs = await git.diff({ baseCompare: latest, compare: "HEAD" });
  const summaries = await summarizeDiffs(config.openAIApiKey, diffs, verbose);
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
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

async function getLatestTaggedVersion() {
  const tags = (await git.tags()).sort((a, b) => {
    return compareVersions(a, b);
  }).reverse();
  const latest = tags.shift();
  return latest;
}
