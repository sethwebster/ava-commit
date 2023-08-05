import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAIChat } from 'langchain/llms/openai';
import chalk from 'chalk';
import { Animation } from 'chalk-animation';
import MessagesForCurrentLanguage from './messages.js';
import { countWords } from 'alfaaz';
import { ChainValues } from 'langchain/schema';
import promptTemplates from './promptTemplates.js';
import { loadConfig } from './configure.js';

const MODELS = {
  "gpt35": "gpt-3.5-turbo-16k",
  "gpt4": "gpt-4",
}

var chalkAnimation: { rainbow: (text: string) => Animation; };
(async function () {
  chalkAnimation = (await import("chalk-animation")).default;
})();

async function summarizeDiff(openAiApiKey: string, diff: string, verbose?: boolean): Promise<string> {
  const config = loadConfig();
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: config.summarizeDiffModel,
    maxTokens: -1,
  });

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.summarizeDiff,
    verbose: verbose,
  });

  let interval: NodeJS.Timeout | null = null;
  try {
    const summary = await new Promise<ChainValues>(async (resolve, reject) => {
      interval = setTimeout(() => {
        reject("Promise timed out");
      }, 10000);
      const result = await chain.call({ diff });
      resolve(result);
    });
    process.stdout.write(".");
    return summary.text;
  } catch (e) {
    return "Unable to summarize this one diff";
  } finally {
    if (interval) {
      clearTimeout(interval);
    }
  }
}

export async function summarizeDiffs(openAiApiKey: string, diffs: string[], verbose?: boolean) {
  const filtered = diffs.filter(d => !d.startsWith("diff --git") && d.trim().length > 0);
  process.stdout.write(`${MessagesForCurrentLanguage.messages.summarizing} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  const summaryPromises = filtered.map(diff => summarizeDiff(openAiApiKey, diff, verbose));
  const summaries = await Promise.all(summaryPromises);
  (process.stdout.cursorTo && process.stdout.cursorTo(0));
  (process.stdout.clearLine && process.stdout.clearLine(0));
  console.log(`${MessagesForCurrentLanguage.messages.summarized} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  return summaries;
}

export async function resummarizeDiff(openAiApiKey: string, diff: string, summary: string, verbose?: boolean) {
  // based on summarizeDiff but passes to the model the previous summary to refine it
  const config = loadConfig();
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: config.summarizeDiffModel,
    maxTokens: -1,
  });

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.reSummarizeDiff,
    verbose: verbose,
  });

  let interval: NodeJS.Timeout | null = null;
  try {
    const newSummary = await new Promise<ChainValues>(async (resolve, reject) => {
      interval = setTimeout(() => {
        reject("Promise timed out");
      }, 10000);
      const result = await chain.call({ diff, summary });
      resolve(result);
    });
    process.stdout.write(".");
    return newSummary.text;
  }
  catch (e) {
    return "Unable to summarize this one diff";
  }
}

export async function resummarizeDiffs(openAiApiKey: string, diffs: string[], summaries: string[], verbose?: boolean) {
  // based on `summarize diffs` but calls resummarizeDiff
  const filtered = diffs.filter(d => !d.startsWith("diff --git") && d.trim().length > 0);
  process.stdout.write(`${MessagesForCurrentLanguage.messages.summarizing} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  const summaryPromises = filtered.map((diff, i) => resummarizeDiff(openAiApiKey, diff, summaries[i], verbose));
  const newSummaries = await Promise.all(summaryPromises);
  (process.stdout.cursorTo && process.stdout.cursorTo(0));
  (process.stdout.clearLine && process.stdout.clearLine(0));
  console.log(`${MessagesForCurrentLanguage.messages.summarized} ${chalk.bold(chalk.yellow(filtered.length))} ${MessagesForCurrentLanguage.messages.diffs}`);
  return newSummaries;
}

export async function reSummarizeSummaries(openAiApiKey: string, diffSummaries: string[], previousSummaries: string[], maxLength: number, verbose?: boolean) {
  const config = loadConfig();
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: config.summarizeSummariesModel,
    maxTokens: -1,
    streaming: true,
  });

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.reSummarizeSummaries,
    verbose: verbose,
  });
  const mappedSummaries = diffSummaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n");
  let summaryText = "";
  const summary = await chain.call({ summaries: mappedSummaries, numberOfDiffs: diffSummaries.length, previousSummaries, maxLength }, [
    {
      handleLLMNewToken: (token) => {
        summaryText += token;
        const wordCount = countWords(summaryText);
        (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-working']} ${wordCount} ${MessagesForCurrentLanguage.messages['words']}`);
      }
    }
  ]) as { text: string; };
  const lines = summary.text.split("---").map(s => s.trim()).filter(s => s.length > 0);
  return lines;
}

export async function summarizeSummaries(openAiApiKey: string, summaries: string[], maxLength: number, verbose?: boolean): Promise<string[]> {
  const config = loadConfig();
  const rainbow = chalkAnimation.rainbow(MessagesForCurrentLanguage.messages['ava-is-working']);
  // console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: config.summarizeSummariesModel,
    maxTokens: -1,
    streaming: true,
  });

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.summarizeSummaries,
    verbose: verbose,
  });
  const mappedSummaries = summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n");
  let summaryText = "";
  const summary = await chain.call({ summaries: mappedSummaries, numberOfDiffs: summaries.length, maxLength }, [
    {
      handleLLMNewToken: (token) => {
        summaryText += token;
        const wordCount = countWords(summaryText);
        (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-working']} ${wordCount} ${MessagesForCurrentLanguage.messages['words']}`);
      }
    }
  ]) as { text: string; };
  const lines = summary.text.split("---").map(s => s.trim()).filter(s => s.length > 0);
  return lines;
}

/**
 * Summarizes a set of summaries into a single summary
 * @param openAiApiKey The OpenAI API key
 * @param summaries The summaries to combine
 * @returns A string combined from the LLM
 */
export async function combineSummaries(openAiApiKey: string, summaries: string[]): Promise<string> {
  const config = loadConfig();
  const rainbow = chalkAnimation.rainbow(`${MessagesForCurrentLanguage.messages['ava-is-combining-summaries'].replace("{summaryCount}", summaries.length.toString())} 0 characters`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: config.summarizeSummariesModel,
    maxTokens: -1,
    streaming: true,
  });


  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplates.combineSummaries,
    verbose: false,
  });

  let summaryText = "";

  const summary = await chain.call({ summaries: summaries.join("\n\n---\n\n") }, [{
    handleLLMNewToken: (token) => {
      summaryText += token;
      const wordCount = countWords(summaryText);
      (rainbow as Animation).replace(`${MessagesForCurrentLanguage.messages['ava-is-combining-summaries'].replace("{summaryCount}", summaries.length.toString())} ${wordCount} ${MessagesForCurrentLanguage.messages['words']}`);
    }
  }]);
  console.log();
  return summary.text;
}
