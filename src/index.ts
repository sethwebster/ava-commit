import { Command } from 'commander';
import chalk from 'chalk';
import Readline from 'readline';
import consoleHelpers from './lib/consoleHelpers.js';
import git from './lib/git.js';
import { configure, loadConfig } from './lib/configure.js';
import { combineSummaries, summarizeDiffs, summarizeSummaries } from './lib/summarize.js';
import cache from './lib/cache.js';
import checkStagedCommits from './lib/checkStagedCommits.js';
import packageJson from './lib/packageJson.js';
import displayOptions from './lib/displayOptions.js';
import MessagesForCurrentLanguage, { convertAnswerToDefault } from './lib/messages.js';

const program = new Command();

program.version(packageJson.packageVersion())
  .description("🤖 Use AI to write your commit messages")
  .name("ava-commit")
  .usage("[options]")
  .option("-a,--all", "All commits, not just staged", false)
  .option('-v,--verbose', 'Verbose output', false)
  .option<number>('-l,--length [number]', 'Length of commit message', (val, prev) => {
    return parseInt(val);
  }, 80)
  .option("--release-notes", "Generate release notes", false)
  .option('--configure', 'Configure the tool')
  .addHelpText('after', `\n`)
  .addHelpText('after', `Examples:`)
  .addHelpText('after', `  $ ava-commit --configure  # Start the configuration process`)
  .addHelpText('after', `  $ ava-commit              # create a commit message for staged files with all defaults`)
  .addHelpText('after', `  $ ava-commit --all        # create a commit message for staged files, bypassing the check for staged files`)
  .addHelpText('after', `  $ ava-commit --length 150 # create a commit message for staged files, targeting max summary of 150 characters`)
  .parse(process.argv);


export const options = program.opts();

async function main(noCache?: boolean) {
  const existingConfig = loadConfig();
  const envOpenAiKey = process.env.OPENAI_API_KEY ?? undefined;
  let openAiKey = envOpenAiKey ?? existingConfig.openAIApiKey;
  const hasApiKey = existingConfig.openAIApiKey !== undefined || envOpenAiKey !== undefined;
  if (!hasApiKey || options.configure) {
    configure().then(() => {
      main();
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
      summaries = await summarizeDiffs(openAiKey, diffs);
      commitMessages = await summarizeSummaries(openAiKey, summaries);
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
          main(true);
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

main();

