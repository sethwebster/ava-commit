import chalk from "chalk";
import cache from "./cache.js";
import checkStagedCommits from "./checkStagedCommits.js";
import { configure, loadConfig } from "./configure.js";
import MessagesForCurrentLanguage, { convertAnswerToDefault } from "./messages.js";
import git from "./git.js";
import { combineSummaries, summarizeDiffs, summarizeSummaries } from "./summarize.js";
import displayOptions from "./displayOptions.js";
import { Separator, checkbox, input, select } from "@inquirer/prompts";

export default async function generate(options: { all: boolean; verbose: boolean; length: number; releaseNotes: boolean; noCache?: boolean; push?: boolean }) {
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
      // displayOptions(commitMessages);
      console.log(); // Ends the rainbow
      const choices = commitMessages.map((s, i) => ({ name: `${i + 1}. ${s}`, value: i + 1 }));

      const userAnswer = await select<string | number>({
        message: MessagesForCurrentLanguage.prompts["accept-which-summary"].text,
        choices: [
          { name: "-", value: "n" },
          ...choices,
          new Separator(),
          { name: MessagesForCurrentLanguage.messages["combine-summaries"], value: "c" },
          { name: MessagesForCurrentLanguage.messages["regenerate-summaries"], value: "r" },
        ],
        pageSize: 20,

      });
      const answer = convertAnswerToDefault(
        MessagesForCurrentLanguage.prompts["accept-which-summary"],
        userAnswer.toString().trim().toLocaleLowerCase(),
        userAnswer.toString().trim().toLocaleLowerCase()
      );

      switch (answer) {
        case "r": {
          generate({ ...options, noCache: true });
          return;
        }
        case "c": {
          // const answer = await input({ message: MessagesForCurrentLanguage.prompts["combine-summaries-selection"].text });
          const choices = commitMessages.map((s, i) => ({ name: `${i + 1}. ${s}`, value: i + 1 }));

          let numbers: number[] = [];
          numbers = await checkbox<number>({
            message: MessagesForCurrentLanguage.prompts["combine-summaries-selection"].text,
            choices: [
              { name: "0. Back", value: 0 },
              ...choices,
            ],
            pageSize: 20

            // validate: (answer: string | number) => {
            //   if ((answer??"").toString().length === 0) {
            //     return "Make a selection"
            //   }
            //   return true;
            // }

          });
          if (numbers.length === 0 || numbers[0] === 0) {
            break;
          }
          const combined = numbers.map(n => commitMessages[n - 1]);
          const resummarized = await combineSummaries(openAiKey!, combined);
          console.log(MessagesForCurrentLanguage.messages["summaries-combined-confirmation"] + "\n", resummarized);
          const userAcceptCombinedAnswer = await input({ message: MessagesForCurrentLanguage.prompts["accept-yes-no"].text });
          const acceptCombinedAnswer = convertAnswerToDefault(
            MessagesForCurrentLanguage.prompts["accept-yes-no"],
            userAcceptCombinedAnswer.trim().toLowerCase(),
            "y"
          );
          if (acceptCombinedAnswer === "y" || acceptCombinedAnswer.trim().length === 0) {
            git.commit(resummarized);
            if (options.push) {
              const res = await git.push();
              console.log(res);
            }
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
          if (options.push) {
            const res = await git.push();
            console.log(res);
          }
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