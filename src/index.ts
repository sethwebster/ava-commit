import { exec } from 'child_process';
import {Command} from 'commander';

const program = new Command();

program.version('0.0.1')
  .description("Use AI to write your commit messages")
  .option("-a", "--all", "All commits, not just staged")
  .parse(process.argv);

const options = program.opts();

const openAiKey = process.env.OPENAI_API_KEY;
const hasApiKey = openAiKey !== undefined;



exec("git diff", (err, stdout, stderr) => {
  if (stdout.trim().length === 0) {
    console.log("No changes to commit")
    return;
  }
  console.log(stdout)
});