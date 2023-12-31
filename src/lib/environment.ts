import fs from 'fs';
import chalk from 'chalk';
import boxen, { Options } from 'boxen';
import { compareVersions } from 'compare-versions';
import { exec, spawn } from './spawn.js';
import { promiseWithTimeout } from './promiseWithTimeout.js';
import MessagesForCurrentLanguage from './messages.js';
import { input } from '@inquirer/prompts';
import Logger from './logger.js';
import packageJson from './packageJson.js';

export function makeAvaHomePath() {
  return `${process.env.HOME}/.ava-commit`;
}

export function makeConfigPath() {
  return `${makeAvaHomePath()}/config.json`;
}

export function makeAvaDiffCachePath() {
  return `${makeAvaHomePath()}/diff-cache`;
}

export function ensureAvaDiffCachePathExists() {
  const path = makeAvaDiffCachePath();
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

export async function checkForLatestVersionAndNotify(_options?: { verbose?: boolean }) {
  Logger.verbose("Checking for latest version...");
  const { currentVersion, latestNpmVersion, updateAvailable } = await checkForLatestVersionSafeWithTimeout(1000);
  if (!updateAvailable) return;
  notifyUpdate({ currentVersion, latestNpmVersion, updateAvailable });
  if (updateAvailable) {
    await offerUpdate();
  }
}

async function checkForLatestVersionSafeWithTimeout(timeout: number): Promise<UpdatePayload> {
  try {
    // const result = await new Promise<UpdatePayload>((resolve) => checkForLatestVersion().then(resolve));
    const result = await promiseWithTimeout(checkForLatestVersion(), timeout);
    Logger.verbose("Version information: ", result);
    return result;
  } catch (e) {
    // Swallow the error
    Logger.verbose("Error checking for latest version: ", e);
    return { currentVersion: (packageJson.packageVersion() ?? "0.0.0"), latestNpmVersion: packageJson.packageVersion() ?? "0.0.0", updateAvailable: false };
  }
}

async function checkForLatestVersion(): Promise<UpdatePayload> {
  const currentVersion = packageJson.packageVersion() ?? "0.0.0";
  const latestNpmVersion = await fetchLatestNpmVersion();
  const versionComparison = compareVersions(currentVersion, latestNpmVersion);
  return { currentVersion, latestNpmVersion, updateAvailable: versionComparison === -1 };
}

export async function fetchLatestNpmVersion() {
  Logger.verbose("Fetching latest npm version...")
  const packageJsonData = await packageJson.loadPackageJson();
  const { name } = packageJsonData;
  if (!name) {
    throw new Error("Failed to fetch latest npm version. No name in package.json");
  }
  const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
  const json = await response.json();
  if (json === "Not Found") {
    return "-1.-1.-1";
  }
  const latestVersion = json.version;
  Logger.verbose(`Latest npmjs.org version for ${name} is ${latestVersion}`)
  return latestVersion;
}

interface UpdatePayload {
  currentVersion: string;
  latestNpmVersion: string;
  updateAvailable: boolean;
}

function notifyUpdate({ currentVersion, latestNpmVersion, updateAvailable }: UpdatePayload) {
  if (updateAvailable) {
    // Draw a corner and a line
    const options: Options = {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      dimBorder: true,
      title: MessagesForCurrentLanguage.messages['update-available-header'],
    }

    console.log(
      boxen(
        `\🎉🎉 ${chalk.bold(chalk.green("ava-commit"))} ${chalk.bold(chalk.yellow(currentVersion))} ${MessagesForCurrentLanguage.messages["update-available-body"]} ${chalk.bold(chalk.green(latestNpmVersion))}.
        ${MessagesForCurrentLanguage.messages["run"]} ${chalk.bold(chalk.green("npm i -g @sethwebster/ava-commit"))} ${MessagesForCurrentLanguage.messages['to-update']}.
        `, options
      )
    )
  }
}

async function offerUpdate() {
  const userUpdateOfferAnswer = await input({ message: MessagesForCurrentLanguage.prompts["update-now"].text });
  const trimmed = userUpdateOfferAnswer.trim().toLowerCase();
  if (trimmed === "y" || trimmed.length === 0) {
    await doAutoUpdate();
  }
}

export async function doAutoUpdate() {
  const updated: { [key: string]: "updated" | "error" } = {};

  try {
    const npm = await exec("npm list -g");
    if (npm && npm.length > 0 && npm.includes("@sethwebster/ava-commit")) {
      const update = spawn("npm", ["i", "-g", "@sethwebster/ava-commit"]);
      if (update && update.length > 0) {
        updated["npm"] = "updated";
      }
    }
  } catch (e) {
    updated["npm"] = "error";
  }

  try {
    const pnpm = await exec("pnpm list -g");
    if (pnpm && pnpm.length > 0 && pnpm.includes("@sethwebster/ava-commit")) {
      const update = spawn("pnpm", ["i", "-g", "@sethwebster/ava-commit"]);
      if (update && update.length > 0) {
        updated["pnpm"] = "updated";
      }
    }
  } catch (e) {
    updated["pnpm"] = "error";
  }

  try {
    const yarn = await exec("yarn global list");
    if (yarn && yarn.length > 0 && yarn.includes("@sethwebster/ava-commit")) {
      const update = spawn("yarn", ["global", "add", "@sethwebster/ava-commit"]);
      if (update && update.length > 0) {
        updated["yarn"] = "updated";
      }
    }
  } catch (e) {
    updated["yarn"] = "error";
  }

  const updatedKeys = Object.keys(updated).filter(k => updated[k] === "updated");
  if (updatedKeys.length > 0) {
    console.log(`Updated the following package managers:`);
    updatedKeys.forEach(k => console.log(chalk.green(k)));
    console.log("Please run ava-commit again.");
    process.exit(0);
  }
}



export function makeAvaDiffCacheFilePath(hash: string) {
  return `${makeAvaDiffCachePath()}/${hash}.json`;
}

