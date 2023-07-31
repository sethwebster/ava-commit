import { exec } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import Readline from 'readline';
import { configure, loadConfig } from './lib/configure';
import { spawn } from './lib/spawn';
import { summarizeDiffs, summarizeSummaries } from './lib/summarize';
import git from './lib/git';
import consoleHelpers from './lib/consoleHelpers';

//"gpt-3.5-turbo-16k"

const program = new Command();

program.version('0.0.1')
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
  console.log(status)
  if (status.length === 0) {
    console.log(chalk.red("No changes to commit"));
    return;
  }
  if (status.filter(s => s.type === "unknown" || s.type==="modified-partly-staged").length > 0) {
    console.log(chalk.yellow("You have unstaged commits. Do you want to stage them before generating the commit messages?"));
    const answer = await consoleHelpers.readline("(Y, n) > ");
    if (answer.toLowerCase() === "y" || answer.trim().length === 0) {
      console.log("Staging all files...")
      git.add();
    }
  }
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

  console.log("")
  if (!hasApiKey || !openAiKey || openAiKey.length === 0) {
    console.error("You must set the OPENAI_API_KEY environment variable, or run `ava-commit --configure`");
    return;
  }

  try {
    await checkStagedCommits();
    const diffs = await git.diff();
    const summaries = await summarizeDiffs(openAiKey, diffs);
    const commitMessages = await summarizeSummaries(openAiKey, summaries);

    const message = commitMessages.map((m, i) => `${chalk.bold(chalk.yellow(i + 1))}. ${m}`).join("\n");
    console.log(`Commit message options:\n${message}`);
    // Ask the user to Accept

    const rl = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question("Accept? (#, [n]one) > ", (answer) => {
      if (answer.toLowerCase() === "n" || answer.trim().length === 0) {
        rl.close();
        console.log(chalk.red("Aborting commit"));
        return;
      } else {
        const commitMessage = commitMessages[parseInt(answer) - 1];
        console.log("Selected commit message: ", commitMessage)
        const addResult = git.add();
        console.log(addResult);
        const commitResult = git.commit(commitMessage);
        console.log(commitResult);
        rl.close();
      }
    })
  } catch (e) {
    console.error(e);
  }
}

main();

