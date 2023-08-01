import chalk from "chalk";
import cache from "./cache.js";
import checkStagedCommits from "./checkStagedCommits.js";
import { configure, loadConfig } from "./configure.js";
import MessagesForCurrentLanguage, { convertAnswerToDefault } from "./messages.js";
import git from "./git.js";
import { combineSummaries, summarizeDiffs, summarizeSummaries } from "./summarize.js";
import displayOptions from "./displayOptions.js";
import consoleHelpers from "./consoleHelpers.js";

export default async function generate(options: { all: boolean; verbose: boolean; length: number; releaseNotes: boolean; noCache?: boolean }) {
  const { all, verbose, length, releaseNotes, noCache } = options;
  const existingConfig = loadConfig();
  const envOpenAiKey = process.env.OPENAI_API_KEY ?? undefined;
  let openAiKey = envOpenAiKey ?? existingConfig.openAIApiKey;
  const hasApiKey = existingConfig.openAIApiKey !== undefined || envOpenAiKey !== undefined;
  if (!hasApiKey) {
    configure(options).then(() => {
      generate(options);
    });
    return;
  }

  if (!hasApiKey || !openAiKey || openAiKey.length === 0) {
    console.error(MessagesForCurrentLanguage.messages["openai-key-required"]);
    return;
  }
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
      summaries = await summarizeDiffs(openAiKey, diffs, options.verbose);
      commitMessages = await summarizeSummaries(openAiKey, summaries, options.length, options.verbose);
      cache.storePreviousRun(diffs, summaries, commitMessages);
    }
    let done = false;
    while (!done) {
      displayOptions(commitMessages);
      const userAnswer = await consoleHelpers.readline(MessagesForCurrentLanguage.prompts["accept-which-summary"].text);
      const answer = convertAnswerToDefault(
        MessagesForCurrentLanguage.prompts["accept-which-summary"],
        userAnswer.trim().toLowerCase(),
        "n"
      );
      switch (answer) {
        case "r": {
          generate({ ...options, noCache: true });
          return;
        }
        case "c": {
          const answer = await consoleHelpers.readline(MessagesForCurrentLanguage.prompts["combine-summaries-selection"].text);
          const numbers = answer.split(" ").join(",").split(",").map(s => s.trim()).filter(s => s.length > 0).map(n => parseInt(n));
          const combined = numbers.map(n => commitMessages[n - 1]);
          const resummarized = await combineSummaries(openAiKey!, combined);
          console.log(MessagesForCurrentLanguage.messages["summaries-combined-confirmation"] + "\n", resummarized);
          const userAcceptCombinedAnswer = await consoleHelpers.readline(MessagesForCurrentLanguage.prompts["accept-yes-no"].text);
          const acceptCombinedAnswer = convertAnswerToDefault(
            MessagesForCurrentLanguage.prompts["accept-yes-no"],
            userAcceptCombinedAnswer.trim().toLowerCase(),
            "y"
          );
          if (acceptCombinedAnswer === "y" || acceptCombinedAnswer.trim().length === 0) {
            git.commit(resummarized);
            cache.deletePreviousRun(diffs);
            done = true;
          }

          break;
        }
        case "n": {
          // None
          console.log(chalk.red(MessagesForCurrentLanguage.messages["aborting-commit"]));
          done = true;
          return;
        }
        default: {
          if (answer.length === 0) {
            console.log(chalk.red(MessagesForCurrentLanguage.messages["aborting-commit"]));
            done = true;
            return;
          }

          const commitMessage = commitMessages[parseInt(answer) - 1];
          console.log(MessagesForCurrentLanguage.messages['selected-commit-message'], commitMessage)
          git.commit(commitMessage);
          cache.deletePreviousRun(diffs);
          done = true;
          break;
        }
      }
    }
  } catch (e) {
    console.error(e);
    // Should probably log this using some telemetry
  }
}