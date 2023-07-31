import { exec } from 'child_process';
import { Command } from 'commander';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts'
import { OpenAIChat } from 'langchain/llms/openai';
import chalk from 'chalk';
import Readline from 'readline';
import { configure, loadConfig } from './lib/configure';

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

const options = program.opts();

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

async function summarizeDiff(openAiApiKey: string, diff: string): Promise<string> {
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: "gpt-3.5-turbo-16k",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["diff"],
    template: "Create a multi-line summary of the follwing diff. You may have a 50 word summary on line 1, followed by more details on up to 5 lines below:\n\n{diff}\n\nSummary:",
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });

  const summary = await chain.call({ diff });
  process.stdout.write(".")
  return summary.text;
}

async function summarizeDiffs(openAiApiKey: string, diffs: string[]) {
  const filtered = diffs.filter(d => !d.startsWith("diff --git") && d.trim().length > 0);
  console.log(`Summarizing ${chalk.bold(chalk.yellow(filtered.length))} diffs`);
  const summaryPromises = filtered.map(diff => summarizeDiff(openAiApiKey, diff));
  const summaries = await Promise.all(summaryPromises);
  return summaries;
}

async function summarizeSummaries(openAiApiKey: string, summaries: string[]): Promise<string[]> {
  console.log(options);
  const maxLen = options.length ?? 150;
  console.log(`Summarizing ${chalk.bold(chalk.yellow(summaries.length))} summaries ${chalk.bold(chalk.yellow(maxLen))} characters or less`);
  const model = new OpenAIChat({
    temperature: 0,
    openAIApiKey: openAiApiKey,
    modelName: "gpt-3.5-turbo-16k",
    maxTokens: -1,
  });

  const template = new PromptTemplate({
    inputVariables: ["summaries"],
    template: `These are summaries of ${summaries.length} diffs. 
      -- instructions -- 
      
      Create 5 multi-line commit message options. The first line with have ${maxLen} characters or less for them, and no more than 5 bulleted lines will follow.
      Do not omit any important information.
      
      Prioritze added code over changes to package lock files or package.json. Don't include any diffs that are just package lock changes.
      Don't include messages about adding imports.
      Example commit message:
      "Added new feature to the app
      - incorporate feedback from the team
      - removed dead code
      - added tests for command line options
      "
      -- content --
      {summaries}
      
      Output (each summary separated by --- summary ---):
      `
  });

  const chain = new LLMChain({
    llm: model,
    prompt: template,
    verbose: false,
  });
  const mappedSummaries = summaries.map((s, i) => `Diff ${i}: ${s}`).join("\n\n")
  const summary = await chain.call({ summaries: mappedSummaries }) as { text: string }
  const lines = summary.text.split("--- summary ---").map(s => s.trim()).filter(s => s.length > 0);
  return lines;
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
    const diffs = await getDiffs();
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
        exec(`git add . && git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
          if (stdout.trim().length === 0) {
            console.log(chalk.green("Commit successful"));
          }
          if (stderr && stderr.trim().length > 0) {
            console.error(stderr);
          }
        });
        rl.close();
      }
    })
  } catch (e) {
    console.error(e);
  }
}

main();

