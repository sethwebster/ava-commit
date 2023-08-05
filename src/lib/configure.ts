import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { makeConfigPath } from './environment.js';
import MessagesForCurrentLanguage, { getLanguage } from './messages.js';
import { input, select } from '@inquirer/prompts';
import { AIModels, AvailableLanguages, Options, SupportedAIModelsType } from '../types.js';

const DEFAULT_CONFIG: Options = {
  openAIApiKey: undefined,
  summarizeDiffModel: "gpt-4",
  summarizeSummariesModel: "gpt-4",
  cliLanguage: "en-US",
  commitMessageLanguage: "en-US",
}
// ${chalk.green("ava-commit")}
const welcomeMessages = [
  "",
  chalk.bold(MessagesForCurrentLanguage.messages["welcome"].replace("{name}", chalk.green("ava-commit"))),
  `🎉 ${MessagesForCurrentLanguage.messages.description}`,
  "",
  `🔑 ${MessagesForCurrentLanguage.messages['openai-api-key-instructons']}`,
]

const welcomeMessage = welcomeMessages.join("\n");

/*
 {
  openAIApiKey: string | undefined;
  model: "gpt-4" | "gpt-3.5-turbo-16k";
  cliLanguage: LanguageLocales
  commitMessageLanguage: LanguageLocales;
}
*/

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

function languageChoices() {
  const langs = AvailableLanguages.map(l => ({ name: l, value: l }));
  const lang = getLanguage();
  const index = langs.findIndex(l => l.value === lang);
  if (index === -1) {
    return langs;
  }
  const langObj = langs[index];
  langs.splice(index, 1);
  langs.unshift(langObj);
  return langs;
}

function modelChoices(selected?: SupportedAIModelsType) {
  const models =  Object.entries(AIModels).map(([key, value]) => ({ name: value.text, value: key, description: value.description }));
  const index = models.findIndex(m => m.value === selected ?? "gpt-4");
  if (index === -1) {
    return models.map(m => (
      { name: m.name, value: m.value, description: m.description }
    ));
  }
  const model = models[index];
  models.splice(index, 1);
  models.unshift(model);
  return models;
}

export async function configure(options: any) {
  console.log(welcomeMessage);
  const existingConfig = loadConfig();
  const answers: Options = {
    openAIApiKey: await input({ message: MessagesForCurrentLanguage.prompts['enter-openai-key'].text, default: existingConfig.openAIApiKey }),
    summarizeDiffModel: await select({
      message: MessagesForCurrentLanguage.messages["select-summarize-diff-model"],
      choices: modelChoices(existingConfig.summarizeDiffModel),
    }) as SupportedAIModelsType,
    summarizeSummariesModel: await select({
      message: MessagesForCurrentLanguage.messages["select-summarize-summaries-model"],
      choices: modelChoices(existingConfig.summarizeSummariesModel),
    }) as SupportedAIModelsType,
    cliLanguage: await select({
      message: MessagesForCurrentLanguage.messages["select-cli-language"],
      choices: languageChoices(),
    }),
    commitMessageLanguage: await select({
      message: MessagesForCurrentLanguage.messages["select-commit-message-language"],
      choices: languageChoices(),
    }),
  }
  const config = { ...existingConfig, ...answers };
  saveConfig(config);
  return config;
}

