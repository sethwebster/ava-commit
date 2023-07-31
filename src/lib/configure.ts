import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import Readline from 'readline';
import { makeConfigPath } from './environment.js';

const DEFAULT_CONFIG: Options = {
  openAIApiKey: undefined,
  model: "gpt-4",
}

const welcomeMessages = [
  "",
  chalk.bold(`Welcome to ${chalk.green("ava-commit")}, the AI-powered commit message generator.`),
  `🎉 This tool will help you write better commit messages.`,
  "",
  "🔑 To use this tool, you'll need an OpenAI API key. You can get one here: 🔗 https://platform.openai.com/account/api-keys",
]

const welcomeMessage = welcomeMessages.join("\n");


function createConfigPath() {
  const configPath = makeConfigPath();
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveConfig(options: Options) {
  try {
    const path = makeConfigPath();
    createConfigPath();
    const config = JSON.stringify({...DEFAULT_CONFIG, ...options});
    fs.writeFileSync(path, config);
  } catch (e) {
    console.error(e);
  }
}

export function loadConfig(): Options {
  const path = makeConfigPath();
  if (!fs.existsSync(path)) {
    return DEFAULT_CONFIG;
  }
  const data = fs.readFileSync(path);
  try {
    return JSON.parse(data.toString());
  } catch (e) {
    console.error(e);
    return DEFAULT_CONFIG;
  }
}

export async function configure() {
  console.log(welcomeMessage);
  const existingConfig = loadConfig();
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question("Enter your OpenAI API key > ", (answer) => {
    saveConfig({...existingConfig, openAIApiKey: answer});
  });
}

interface Options {
  openAIApiKey: string | undefined;
  model: "gpt-4" | "gpt-3.5-turbo-16k"
}