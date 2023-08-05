import chalk from "chalk";
import cache from "./cache.js";
import checkStagedCommits from "./checkStagedCommits.js";
import { configure, loadConfig } from "./configure.js";
import MessagesForCurrentLanguage, { convertAnswerToDefault } from "./messages.js";
import git from "./git.js";
import { combineSummaries, reSummarizeSummaries, resummarizeDiffs, summarizeDiffs, summarizeSummaries } from "./summarize.js";
import { Separator, checkbox, select } from "@inquirer/prompts";
import Logger from "./logger.js";
import { ChoicesType, GenerateOptions, GenerateStatusWithContext } from "../types.js";

export default async function generate(options: { all: boolean; verbose: boolean; length: number; releaseNotes: boolean; noCache?: boolean; push?: boolean }) {
  Logger.verbose("Generate is starting...")
  const { all, verbose, length, releaseNotes, noCache } = options;
  const existingConfig = loadConfig();
  const envOpenAiKey = process.env.OPENAI_API_KEY ?? undefined;
  let openAIApiKey = envOpenAiKey ?? existingConfig.openAIApiKey;
  const hasApiKey = existingConfig.openAIApiKey !== undefined || envOpenAiKey !== undefined;
  if (!hasApiKey) {
    configure(options).then(() => {
      generate(options);
    });
    return;
  }

  if (!hasApiKey || !openAIApiKey || openAIApiKey.length === 0) {
    console.error(MessagesForCurrentLanguage.messages["openai-key-required"]);
    return;
  }

  const context = await doGenerate({ ...options, openAIApiKey });

  if (context.status !== "error") {
    console.log(); // Ends the rainbow
    setTimeout(async () =>
      await getUserResponseToMessages(context, options), 100);
  }
}

export async function doGenerate(options: GenerateOptions & { openAIApiKey: string }): Promise<GenerateStatusWithContext> {
  const { openAIApiKey, verbose, length, releaseNotes, noCache } = options;

  try {
    let summaries: string[];
    let commitMessages: string[];
    await checkStagedCommits();
    const diffs = await git.diff();
    const previousSummaryRun = cache.getPreviousRun(diffs);

    if (previousSummaryRun && !noCache) {
      console.log(chalk.green(MessagesForCurrentLanguage.messages["using-cached-summaries"]));
      summaries = previousSummaryRun.summaries;
      commitMessages = previousSummaryRun.commitMessages;
    } else {
      summaries = await summarizeDiffs(openAIApiKey, diffs, options.verbose);
      commitMessages = await summarizeSummaries(openAIApiKey, summaries, options.length, options.verbose);
      cache.storePreviousRun(diffs, summaries, commitMessages);
    }

    return { status: "continue", diffs, summaries, commitMessages, openAIApiKey };

  } catch (e) {
    console.error(e);
    // Should probably log this using some telemetry
    return { status: "error", diffs: [], summaries: [], commitMessages: [], openAIApiKey };
  }
}

export async function doRegenerate(context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { diffs, summaries, commitMessages, openAIApiKey } = context;
  const { verbose, length, releaseNotes, noCache } = options;
  try {
    const newSummaries = await resummarizeDiffs(openAIApiKey, diffs, summaries, options.verbose);
    const newCommitMessages = await reSummarizeSummaries(
      openAIApiKey,
      newSummaries,
      context.summaries,
      options.length,
      options.verbose
    )
    cache.storePreviousRun(diffs, newSummaries, newCommitMessages);
    // await getUserResponseToMessages(openAiKey, commitMessages, diffs, options)
    console.log();
    return { status: "continue", diffs, summaries: newSummaries, commitMessages: newCommitMessages, openAIApiKey };

  } catch (e) {
    console.error(e);
    throw e;
  }
}

function generateChoices(commitMessages: string[]): ChoicesType<string>[] {
  const choices: ChoicesType<string>[] = commitMessages.map((s, i) => ({ name: `${i + 1}. ${s}`, value: `${i + 1}` }));
  if (choices.length > 1) {
    choices.push(new Separator());
    choices.push({ name: MessagesForCurrentLanguage.messages["combine-summaries"], value: "c" });
  }
  choices.push({ name: MessagesForCurrentLanguage.messages["regenerate-summaries"], value: "r" });
  return choices;
}

async function handleRegenerate(context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const newContext = await doRegenerate(context, { ...options, noCache: true });
  return { ...newContext, status: "continue" };
}

async function handleCombine(context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { commitMessages, diffs, openAIApiKey } = context;
  const choices = commitMessages.map((s, i) => ({ name: `${i + 1}. ${s}`, value: i + 1 }));
  let numbers: number[] = [];
  numbers = await checkbox<number>({
    message: MessagesForCurrentLanguage.prompts["combine-summaries-selection"].text,
    choices: [
      { name: "0. Back", value: 0 },
      ...choices,
    ],
    pageSize: 20
  });
  if (numbers.length === 0 || numbers[0] === 0) {
    return { ...context, status: "continue" };
  }
  const combined = numbers.map(n => commitMessages[n - 1]);
  const resummarized = await combineSummaries(openAIApiKey!, combined);
  console.log(MessagesForCurrentLanguage.messages["summaries-combined-confirmation"] + "\n", resummarized);
  return await getUserResponseToMessages({ status: "continue", diffs, summaries: [resummarized], commitMessages: [resummarized], openAIApiKey }, options);
}

async function handleDefaultCase(answer: string, context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { commitMessages, diffs, openAIApiKey } = context;
  if (answer.length === 0) {
    console.log(chalk.red(MessagesForCurrentLanguage.messages["aborting-commit"]));
    return { ...context, status: "complete" };
  }

  const commitMessage = commitMessages[parseInt(answer) - 1];
  console.log(MessagesForCurrentLanguage.messages['selected-commit-message'], commitMessage);
  git.commit(commitMessage);
  if (options.push) {
    const res = await git.push();
    console.log(res);
  }
  cache.deletePreviousRun(diffs);
  return { ...context, status: "complete" };
}

async function summariesRouter(answer: string, context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  switch (answer) {
    case "r": return handleRegenerate(context, options)
    case "c": return handleCombine(context, options);
    case "n": console.log(chalk.red(MessagesForCurrentLanguage.messages["aborting-commit"])); return { ...context, status: "complete" };
    default: return handleDefaultCase(answer, { ...context, status: "continue" }, options);
  }
}

async function getUserResponseToMessages(statusWithContext: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { commitMessages, openAIApiKey, diffs } = statusWithContext;
  let status: GenerateStatusWithContext = { ...statusWithContext, status: "continue" }
  while (status.status === "continue") {
    const choices = await generateChoices(commitMessages);
    const key = choices.length > 1 ? "accept-summary-selection" : "accept-summary-single";
    const promptOptions = {
      message: MessagesForCurrentLanguage.prompts[key].text,
      choices: [
        { name: "<", value: "n" },
        ...choices,
      ],
      pageSize: 20,
    }
    const userAnswer = await select<string | number>(promptOptions);

    const answer = convertAnswerToDefault(
      MessagesForCurrentLanguage.prompts[key],
      userAnswer.toString().trim().toLocaleLowerCase(),
      userAnswer.toString().trim().toLocaleLowerCase()
    );

    status = await summariesRouter(answer, status, options);
  }
  return status;
}
