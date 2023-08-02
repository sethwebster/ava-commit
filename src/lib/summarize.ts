import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAIChat } from 'langchain/llms/openai';
import chalk from 'chalk';
import { Animation } from 'chalk-animation';
import MessagesForCurrentLanguage from './messages.js';

const MODELS = {
  "gpt35": "gpt-3.5-turbo-16k",
  "gpt4": "gpt-4",
}

var chalkAnimation: { rainbow: (text: string) => Animation; };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();

async function summarizeDiff(openAiApiKey: string, diff: string, verbose?: boolean): Promise<string> {
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: MODELS.gpt35,
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["diff"],
    template: `Create a multi-line summary of the follwing diff. 
    
    You may have a 50 word summary on line 1, followed by more details on up to 5 lines below.

    Note: lines that start with a + were added, lines that start with a - were removed.
    
    {diff}
    
    Summary:`,
  }); 

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: verbose,
  });

  const summary = await chain.call({ diff });
  process.stdout.write(".");
  return summary.text;
}

/**
 * Summarizes a set of summaries into a single summary
 * @param openAiApiKey The OpenAI API key
 * @param summaries The summaries to combine
 * @returns A string combined from the LLM
 */
export async function combineSummaries(openAiApiKey: string, summaries: string[]): Promise<string> {
  const rainbow = chalkAnimation.rainbow(`${MessagesForCurrentLanguage.messages['ava-is-combining-summaries'].replace("{summaryCount}", summaries.length.toString())} 0 characters`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: MODELS.gpt4,
    maxTokens: -1,
    streaming: true,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: "Combine the following summaries into a single summary. It should have a first line (no more than 100 chars) overall summary followed by bullets that expand on the summary. Do not remove any important information:\n\n{summaries}\n\nSummary:",
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });

  let summaryText = "";

  const summary = await chain.call({ summaries: summaries.join("\n\n---\n\n") }, [{
    handleLLMNewToken: (token) => {
      summaryText += token;
      (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-combining-summaries'].replace("{summaryCount}", summaries.length.toString())} ${summaryText.length} characters`);
    }
  }]);
  console.log();
  return summary.text;
}

export async function summarizeDiffs(openAiApiKey: string, diffs: string[], verbose?: boolean) {
  const filtered = diffs.filter(d => !d.startsWith("diff --git") && d.trim().length > 0);
  process.stdout.write(`${MessagesForCurrentLanguage.messages.summarizing} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  const summaryPromises = filtered.map(diff => summarizeDiff(openAiApiKey, diff, verbose));
  const summaries = await Promise.all(summaryPromises);
  process.stdout.cursorTo(0);
  process.stdout.clearLine(0);
  console.log(`${MessagesForCurrentLanguage.messages.summarized} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  return summaries;
}

export async function summarizeSummaries(openAiApiKey: string, summaries: string[], maxLength: number, verbose?: boolean): Promise<string[]> {
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: MODELS.gpt4,
    maxTokens: -1,
    streaming: true,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: `These are summaries of ${summaries.length} diffs. 
      -- instructions -- 
      
      Purpose: 
      Create 2 to 3 multi-line commit message options that combine the summaries provided. 
      
      Commit Message Format: 
      The first line with have ${maxLength} characters or less for them, and no more than 10 bulleted lines will follow. 
      Each message will stand on its own as a complete commit message. Options should NOT span multiple options, and should each include all
      important information.
      
      Guiding Principles:
      Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
      Don't include messages about adding imports.

      Output Format:
      - Output each summary separated by "\n\n---\n\n" and do NOT include a heading at all like "Option 1" or "Option 2".
      - Include ONLY the commit message and no headings.

      Special Note: If functionality has changed, but the version in the package.json hasn't changed, return a header above all of the options: [CHECK PACKAGE VERSION]

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
  const lines = summary.text.split("---").map(s => s.trim()).filter(s => s.length > 0);
  return lines;
}
