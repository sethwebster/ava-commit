import { exec } from 'child_process';
import { Command } from 'commander';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts'
import { OpenAIChat } from 'langchain/llms/openai';
import chalk from 'chalk';
import Readline from 'readline';

const program = new Command();

program.version('0.0.1')
  .description("Use AI to write your commit messages")
  .option("-a", "--all", "All commits, not just staged")
  .option('-v', '--verbose', 'Verbose output')
  .parse(process.argv);

const options = program.opts();

const openAiKey = process.env.OPENAI_API_KEY;
const hasApiKey = openAiKey !== undefined;

async function getDiffs() {
  return new Promise<string[]>((resolve, reject) => {
    exec("git diff", (err, stdout, stderr) => {
      if (stdout.trim().length === 0) {
        reject("No changes to commit")
        return;
      }
      if (stderr && stderr.trim().length > 0) {
        reject(stderr);
        return;
      }
      return resolve(stdout.split("---"));
    })
  });
}

async function summarizeDiff(diff: string): Promise<string> {
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiKey,
    modelName: "gpt-3.5-turbo-16k",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["diff"],
    template: "Create a 1-line 150 or fewer word summary of this diff:\n\n{diff}\n\nSummary:",
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });

  const summary = await chain.call({ diff });
  return summary.text;
}

async function summarizeDiffs(diffs: string[]) {
  console.log(`Summarizing ${chalk.bold(chalk.yellow(diffs.length))} diffs`);
  const summaryPromises = diffs.map(diff => summarizeDiff(diff));
  const summaries = await Promise.all(summaryPromises);
  return summaries;
}

async function summarizeSummaries(summaries: string[]) {
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiKey,
    modelName: "gpt-3.5-turbo-16k",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: `These are summaries of ${summaries.length} diffs. 
      Create a commit message of 150 characters or less for them; do not omit any important information.
      
      Prioritze added code over changes to package lock files or package.json.

      {summaries}
      
      Commit message:`
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });
  const mappedSummaries =  summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n")
  console.log("Mapped", mappedSummaries)
  const summary = await chain.call({ summaries: mappedSummaries });
  return summary.text;
}

async function main() {
  console.log("")
  if (!hasApiKey) {
    console.error("You must set the OPENAI_API_KEY environment variable");
    return;
  }

  try {
    const diffs = await getDiffs();
    const summaries = await summarizeDiffs(diffs);
    const commitMessage = await summarizeSummaries(summaries);
    console.log("Commit message:", chalk.bold(chalk.green(commitMessage)));
    // Ask the user to Accept

    const rl = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question("Accept? (y/n)", (answer) => {
      if (answer.toLowerCase() === "y") {
        rl.close();
        exec(`git add . && git commit -m "${commitMessage}"`);
      } else {
        console.log("Aborting commit");
        rl.close();
      }
    })


  } catch (e) {
    console.error(e);
  }
}

main();

