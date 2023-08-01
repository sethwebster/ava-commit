import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import Readline from 'readline';
import { makeConfigPath } from './environment.js';
import MessagesForCurrentLanguage from './messages.js';

const DEFAULT_CONFIG: Options = {
  openAIApiKey: undefined,
  model: "gpt-4",
  cliLanguage: "en-us",
  commitMessageLanguage: "en-us",
}

const welcomeMessages = [
  "",
  chalk.bold(`Welcome to ${chalk.green("ava-commit")}, the AI-powered commit message generator.`),
  `🎉 This tool will help you write better commit messages.`,
  "",
  "🔑 To use this tool, you'll need an OpenAI API key. You can get one here: 🔗 https://platform.openai.com/account/api-keys",
]

const welcomeMessage = welcomeMessages.join("\n");

function getLanguage() {
  let locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return locale.toLowerCase();
}

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
    const config = JSON.stringify({ ...DEFAULT_CONFIG, ...options });
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
  return new Promise<void>((resolve, reject) => {
    console.log(welcomeMessage);
    const existingConfig = loadConfig();
    const rl = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(MessagesForCurrentLanguage.prompts['enter-openai-key'], (answer) => {
      saveConfig({ ...existingConfig, openAIApiKey: answer });
      resolve();
    });
  });
}

const AllLanguageLocales = ["en-us", "en-gb", "en-au", "en-ca", "en-in", "en-za", "en-nz", "en-ie", "en-jm", "en-bz", "en-tt", "en-zw", "en-ph", "en-my", "en-sg", "en-pk", "en-ng", "en-gh", "en-hk", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz", "en-ke", "en-ug", "en-tz"] as const;
export type LanguageLocales = typeof AllLanguageLocales[number];
export const AvailableLanguages: LanguageLocales[] = ["en-us"] as LanguageLocales[]
export type AvailableLanguages = typeof AvailableLanguages[number];

interface Options {
  openAIApiKey: string | undefined;
  model: "gpt-4" | "gpt-3.5-turbo-16k";
  cliLanguage: LanguageLocales
  commitMessageLanguage: LanguageLocales;
}