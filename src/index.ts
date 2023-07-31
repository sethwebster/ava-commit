import { Command } from 'commander';
import chalk from 'chalk';
import Readline from 'readline';
import consoleHelpers from './lib/consoleHelpers.js';
import git from './lib/git.js';
import { configure, loadConfig } from './lib/configure.js';
import { combineSummaries, summarizeDiffs, summarizeSummaries } from './lib/summarize.js';

//"gpt-3.5-turbo-16k"

const program = new Command();

program.version('0.0.2')
  .description("Use AI to write your commit messages")
  .option("-a,--all", "All commits, not just staged", false)
  .option('-v,--verbose', 'Verbose output', false)
  .option<number>('-l,--length [number]', 'Length of commit message', (val, prev) => {
    return parseInt(val);
  }, 80)
  .option('--configure', 'Configure the tool')
  .parse(process.argv);

export const options = program.opts();

async function checkStagedCommits() {
  const status = git.status({ short: true });
  if (status.length === 0) {
    console.log(chalk.red("No changes to commit"));
    process.exit(1);
  }

  if (options.all) {
    console.log(chalk.yellow("Staging all files..."));
    git.add();
    return;
  }

  if (status.filter(s => s.type === "unknown" || s.type === "modified-partly-staged").length > 0) {
    console.log(chalk.yellow("You have unstaged commits. Do you want to stage them before generating the commit messages?"));
    const answer = await consoleHelpers.readline("(Y, n) > ");
    if (answer.toLowerCase() === "y" || answer.trim().length === 0) {
      console.log("Staging all files...")
      git.add();
    }
  }
}

function displayOptions(options: string[]) {
  const message = options.map((m, i) => `${chalk.bold(chalk.yellow(i + 1))}. ${m}`).join("\n");
  console.log(`Commit message options:\n${message}`);
}

async function main() {
  const existingConfig = loadConfig();
  const envOpenAiKey = process.env.OPENAI_API_KEY ?? undefined;
  let openAiKey = envOpenAiKey ?? existingConfig.openAIApiKey;
  const hasApiKey = existingConfig.openAIApiKey !== undefined || envOpenAiKey !== undefined;
  if (!hasApiKey || options.configure) {
    configure();
    main();
    return;
  }

  if (!hasApiKey || !openAiKey || openAiKey.length === 0) {
    console.error("You must set the OPENAI_API_KEY environment variable, or run `ava-commit --configure`");
    return;
  }

  try {
    await checkStagedCommits();
    const diffs = await git.diff();
    const summaries = await summarizeDiffs(openAiKey, diffs);
    const commitMessages = await summarizeSummaries(openAiKey, summaries);
    
    let done = false;
    while (!done) {
      displayOptions(commitMessages);
      const answer = await consoleHelpers.readline("Accept which summary? (#, [n]one, [c]ombine) > ");
      switch (answer.toLowerCase()) {
        case "c": {
          const answer = await consoleHelpers.readline("Enter the numbers of the commit messages to combine, separated by spaces > ");
          const numbers = answer.split(" ").map(n => parseInt(n));
          const combined = numbers.map(n => commitMessages[n - 1]);
          const resummarized = await combineSummaries(openAiKey!, combined);
          console.log("Combined commit message:\n", resummarized);
          const acceptCombinedAnswer = await consoleHelpers.readline("Accept? (Y, n) > ");
          if (acceptCombinedAnswer.toLowerCase() === "y" || answer.trim().length === 0) {
            git.commit(resummarized);
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

