import fs from 'fs';
import packageJson from './packageJson.js';
import chalk from 'chalk';
import boxen, { Options } from 'boxen';
import { compareVersions } from 'compare-versions';
import { exec, spawn } from './spawn.js';
import consoleHelpers from './consoleHelpers.js';
import cancelablePromise from './cancelablePromise.js';
import MessagesForCurrentLanguage from './messages.js';

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

export async function checkForLatestVersionAndNotify() {
  const { currentVersion, latestVersion, updateAvailable } = await checkForLatestVersionSafeWithTimeout(500);
  if (!updateAvailable) return;
  notifyUpdate({ currentVersion, latestVersion, updateAvailable });
  if (updateAvailable) {
    await offerUpdate();
  }
}

async function checkForLatestVersionSafeWithTimeout(timeout: number): Promise<UpdatePayload> {
  try {
    const result = await cancelablePromise<UpdatePayload>((resolve) => checkForLatestVersion().then(resolve), timeout);
    return result;
  } catch (e) {
    // Swallow the error
    return { currentVersion: packageJson.packageVersion(), latestVersion: packageJson.packageVersion(), updateAvailable: false };
  }
}

async function checkForLatestVersion(): Promise<UpdatePayload> {
  const currentVersion = packageJson.packageVersion();
  const response = await fetch(`https://registry.npmjs.org/@sethwebster/ava-commit/latest`);
  const json = await response.json();
  const latestVersion = json.version;
  const versionComparison = compareVersions(currentVersion, latestVersion);
  return { currentVersion, latestVersion, updateAvailable: versionComparison === -1 };
}

interface UpdatePayload {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

function notifyUpdate({ currentVersion, latestVersion, updateAvailable }: UpdatePayload) {
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
        `\🎉🎉 ${chalk.bold(chalk.green("ava-commit"))} ${chalk.bold(chalk.yellow(currentVersion))} ${MessagesForCurrentLanguage.messages["update-available-body"]} ${chalk.bold(chalk.green(latestVersion))}.
        ${MessagesForCurrentLanguage.messages["run"]} ${chalk.bold(chalk.green("npm i -g @sethwebster/ava-commit"))} ${MessagesForCurrentLanguage.messages['to-update']}.
        `, options
      )
    )
  }
}

async function offerUpdate() {
  const userUpdateOfferAnswer = await consoleHelpers.readline(MessagesForCurrentLanguage.prompts["update-now"].text);
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

