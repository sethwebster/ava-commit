import { combineSummaries, reSummarizeSummaries, resummarizeDiffs, summarizeDiffs, summarizeSummaries } from "./summarize.js";
import { configure, loadConfig } from "./configure.js";
import { Separator, checkbox, select, input } from "@inquirer/prompts";
import cache from "./cache.js";
import chalk from "chalk";
import checkStagedCommits from "./checkStagedCommits.js";
import git from "./git.js";
import Logger from "./logger.js";
import MessagesForCurrentLanguage, { convertAnswerToDefault } from "./messages.js";
import { ChoicesType, GenerateOptions, GenerateStatusWithContext } from "../types.js";
import { getConsoleSize } from "./consoleUtils.js";

export default async function generate(options: GenerateOptions) {
  Logger.verbose("Generate is starting...")
  let existingConfig = loadConfig();
  const envOpenAiKey = process.env.OPENAI_API_KEY ?? undefined;
  let openAIApiKey = envOpenAiKey ?? existingConfig.openAIApiKey;
  let hasApiKey = existingConfig.openAIApiKey !== undefined || envOpenAiKey !== undefined;
  if (!hasApiKey) {
    existingConfig = await configure(options);
    openAIApiKey = existingConfig.openAIApiKey;
    hasApiKey = existingConfig.openAIApiKey !== undefined;
  }

  if (!hasApiKey || !openAIApiKey || openAIApiKey.length === 0) {
    console.error(MessagesForCurrentLanguage.messages["openai-key-required"]);
    return;
  }

  const context = await doGenerate({ ...options, openAIApiKey });

  console.log(); // Ends the rainbow

  if (context.status !== "error") {
    setTimeout(async () =>
      await getUserResponseToMessages(context, options), 100);
  }
}

async function doGenerate(options: GenerateOptions & { openAIApiKey: string }): Promise<GenerateStatusWithContext> {
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
      summaries = await summarizeDiffs({ openAIApiKey, diffs, verbose: options.verbose });
      commitMessages = await summarizeSummaries({ openAIApiKey, summaries, maxLength: length, verbose });
      cache.storePreviousRun(diffs, summaries, commitMessages);
    }

    return { status: "continue", diffs, summaries, commitMessages, openAIApiKey };

  } catch (e) {
    console.error(e);
    // Should probably log this using some telemetry
    return { status: "error", diffs: [], summaries: [], commitMessages: [], openAIApiKey };
  }
}

async function doRegenerate(hint: string, context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { diffs, summaries, commitMessages, openAIApiKey } = context;
  const { verbose, length, releaseNotes, noCache } = options;
  try {
    const newSummaries = await resummarizeDiffs({ openAIApiKey, hint, diffs, summaries, verbose: options.verbose });
    const newCommitMessages = await reSummarizeSummaries({
      openAIApiKey,
      diffSummaries: newSummaries,
      previousSummaries: summaries,
      length,
      verbose,
      hint,
    })
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
  const hint = (await input({
    message: "Would you like to provide a hint for Ava?",
    default: "none",
  })) ?? "none";
  const newContext = await doRegenerate(hint, context, { ...options, noCache: true });
  return { ...newContext, status: "continue" };
}

async function handleCombine(context: GenerateStatusWithContext, options: GenerateOptions): Promise<GenerateStatusWithContext> {
  const { commitMessages, diffs, openAIApiKey } = context;
  const { length } = options;
  const choices = commitMessages.map((s, i) => ({ name: `${i + 1}. ${s}`, value: i + 1 }));
  let numbers: (number | string)[] = [];
  const { rows } = getConsoleSize();
  const totalLinesInCommitMessages = commitMessages.map(s => s.split("\n").length).reduce((a, b) => a + b, 0);
  const pageSize = Math.min(rows - 2, Math.max(20, totalLinesInCommitMessages));

  if (choices.length > 2) {
    numbers = await checkbox<number | string>({
      message: MessagesForCurrentLanguage.prompts["combine-summaries-selection"].text,
      choices: [
        { name: "-. Back", value: 0 },
        { name: "A. All", value: "A" },
        ...choices,
      ],
      pageSize
    });
  } else {
    numbers = [1, 2]
  }
  if (numbers.length === 0 || numbers[0] === 0) {
    return { ...context, status: "continue" };
  }

  let combined: string[] = [];
  const allSelected = !!(numbers.find(val => val === "A"))
  if (allSelected) {
    combined = commitMessages;
  } else {
    const numbersFixed = numbers.map(n => parseInt(n.toString()));
    combined = numbersFixed.map(n => commitMessages[n - 1]);
  }
  const resummarized = await combineSummaries({ openAIApiKey, summaries: combined, maxLength: length, verbose: options.verbose });
  // console.log(MessagesForCurrentLanguage.messages["summaries-combined-confirmation"] + "\n", resummarized);
  return await getUserResponseToMessages({ status: "continue", diffs, summaries: combined, commitMessages: [resummarized], openAIApiKey }, options);
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
  const { commitMessages } = statusWithContext;
  let status: GenerateStatusWithContext = { ...statusWithContext, status: "continue" }
  const totalLinesInCommitMessages = commitMessages.map(s => s.split("\n").length).reduce((a, b) => a + b, 0);
  const { rows } = getConsoleSize();
  while (status.status === "continue") {
    const choices = await generateChoices(commitMessages);
    const key = choices.length > 1 ? "accept-summary-selection" : "accept-summary-single";
    const pageSize = Math.min(rows - 2, Math.max(20, totalLinesInCommitMessages));

    const promptOptions = {
      message: MessagesForCurrentLanguage.prompts[key].text,
      choices: [
        { name: "<", value: "n" },
        ...choices,
      ],
      pageSize,
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
