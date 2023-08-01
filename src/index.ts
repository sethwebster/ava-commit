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
    configure().then(()=>{
      main();
    });
    return;
  }

  if (!hasApiKey || !openAiKey || openAiKey.length === 0) {
    console.error("You must set the OPENAI_API_KEY environment variable, or run `ava-commit --configure`");
    return;
  }
  try {
    let summaries: string[];
    let commitMessages: string[];
    await checkStagedCommits();
    const diffs = await git.diff();
    const previousSummaryRun = cache.getPreviousRun(diffs);

    if (previousSummaryRun && !noCache) {
      console.log(chalk.green("Using cached summaries and commit messages from previous run."));
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
      const answer = await consoleHelpers.readline("Accept which summary? (#, [n]one, [c]ombine, [r]egenerate) > ");
      switch (answer.toLowerCase()) {
        case "r": {
          main(true);
          return;
        }
        case "c": {
          const answer = await consoleHelpers.readline("Enter the numbers of the commit messages to combine, separated by spaces > ");
          const numbers = answer.split(" ").map(n => parseInt(n));
          const combined = numbers.map(n => commitMessages[n - 1]);
          const resummarized = await combineSummaries(openAiKey!, combined);
          console.log("Combined commit message:\n", resummarized);
          const acceptCombinedAnswer = await consoleHelpers.readline("Accept? (Y, n) > ");
          if (acceptCombinedAnswer.toLowerCase() === "y" || answer.trim().length === 0) {
            git.commit(resummarized);
            cache.deletePreviousRun(diffs);
            done = true;
          }

          break;
        }
        case "n": {
          // None
          console.log(chalk.red("Aborting commit"));
          done = true;
          return;
        }
        default: {
          if (answer.length === 0) {
            console.log(chalk.red("Aborting commit"));
            done = true;
            return;
          }

          const commitMessage = commitMessages[parseInt(answer) - 1];
          console.log("Selected commit message: ", commitMessage)
          git.commit(commitMessage);
          cache.deletePreviousRun(diffs);
          done = true;
          break;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();

