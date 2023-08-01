import { OpenAIChat } from "langchain/llms/openai";
import { configure, loadConfig } from "./configure.js";
import git from "./git.js";
import MessagesForCurrentLanguage from "./messages.js";
import { summarizeDiffs } from "./summarize.js";
import { Animation } from 'chalk-animation';
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

var chalkAnimation: { rainbow: (text: string) => Animation; };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();

const MODELS = {
  "gpt35": "gpt-3.5-turbo-16k",
  "gpt4": "gpt-4",
}


export async function createReleaseNotes({ verbose }: { verbose?: boolean } = { verbose: false }) {
  const config = loadConfig();
  if (!config.openAIApiKey) {
    await configure({});
    createReleaseNotes({});
    return;
  }
  await git.fetch({ all: true });
  const tags = (await git.tags()).reverse();
  const latest = tags.shift();
  console.log("+++ " + latest);
  const diffs = await git.diff({ baseCompare: latest, compare: "HEAD" });
  const summaries = await summarizeDiffs(config.openAIApiKey, diffs, verbose);
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: config.openAIApiKey,
    modelName: MODELS.gpt4,
    maxTokens: -1,
    streaming: true,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: `These are summaries of ${summaries.length} diffs between product releases. 
      -- instructions -- 
      
      Purpose: 
      Create awesome, exciting release notes of the change between the last release (${latest}) and now. Use GitHub flavored markdown.
      
      Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header on the options: [CHECK PACKAGE VERSION]

      -- input content --
      {summaries}
      
      -- example output --
      Summary
      - additional info line 1
      - additional info line 2
      - additional info line 3
      - additional info line 4
      - additional info line 5
      ...
      -- output --      
      Output:
      `
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: verbose,
  });
  const mappedSummaries = summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n");
  let summaryText = "";
  const summary = await chain.call({ summaries: mappedSummaries }, [
    {
      handleLLMNewToken: (token) => {
        summaryText += token;
        (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-working']} ${summaryText.length} ${MessagesForCurrentLanguage.messages['characters']}`);
      }
    }
  ]) as { text: string; };
  console.log(summary.text);
}