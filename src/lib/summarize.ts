import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAIChat } from 'langchain/llms/openai';
import chalk from 'chalk';
import { options } from '../index.js';

var chalkAnimation: { rainbow: (text: string) => void; } = { rainbow: (str) => { console.log(str) } };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();


async function summarizeDiff(openAiApiKey: string, diff: string): Promise<string> {
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: "gpt-3.5-turbo-16k",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["diff"],
    template: "Create a multi-line summary of the follwing diff. You may have a 50 word summary on line 1, followed by more details on up to 5 lines below:\n\n{diff}\n\nSummary:",
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });

  const summary = await chain.call({ diff });
  process.stdout.write(".");
  return summary.text;
}

export async function summarizeDiffs(openAiApiKey: string, diffs: string[]) {
  const filtered = diffs.filter(d => !d.startsWith("diff --git") && d.trim().length > 0);
  console.log(`Summarizing ${chalk.bold(chalk.yellow(filtered.length))} diffs`);
  const summaryPromises = filtered.map(diff => summarizeDiff(openAiApiKey, diff));
  const summaries = await Promise.all(summaryPromises);
  console.log();
  return summaries;
}

export async function summarizeSummaries(openAiApiKey: string, summaries: string[]): Promise<string[]> {
  const maxLen = options.length ?? 150;
  chalkAnimation.rainbow(`The Magic is happening...`);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: "gpt-4",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: `These are summaries of ${summaries.length} diffs. 
      -- instructions -- 
      
      Create 5 multi-line commit message options. The first line with have ${maxLen} characters or less for them, and no more than 5 bulleted lines will follow.
      Do not omit any important information.
      
      Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
      Don't include messages about adding imports.
      Output each summary separated by "\n\n---\n\n"

      -- input content --
      {summaries}
      
      -- example output --
      Summary
      - additional info line 1
      - additional info line 2
      - additional info line 3
      - additional info line 4
      - additional info line 5
      -- output --      
      Output:
      `
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });
  const mappedSummaries = summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n");
  const summary = await chain.call({ summaries: mappedSummaries }) as { text: string; };
  const lines = summary.text.split("---").map(s => s.trim()).filter(s => s.length > 0);
  return lines;
}
