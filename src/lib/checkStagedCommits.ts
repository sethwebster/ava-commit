import chalk from "chalk";
import git from "./git.js";
import { convertAnswerToDefault } from "./messages.js";
import MessagesForCurrentLanguage from "./messages.js";
import { input } from "@inquirer/prompts";
import Logger from "./logger.js";

export default async function checkStagedCommits(options: { all: boolean } = { all: false }) {
  Logger.verbose("Checking for staged commits...")
  const status = checkForStagedCommits();
  if (status.length === 0) {
    console.log(chalk.red(MessagesForCurrentLanguage.errors["no-diff"]));
    process.exit(1);
  }

  if (options.all) {
    console.log(chalk.yellow(MessagesForCurrentLanguage.messages["staging-all-files"]));
    git.add();
    return;
  }

  if (status.filter(s => s.type === "unknown" || s.type === "modified-partly-staged").length > 0) {
    const userAnswer = await input({ message: chalk.yellow(MessagesForCurrentLanguage.prompts["unstaged-commits-confirm-add"].text) });
    // await consoleHelpers.readline(chalk.yellow(MessagesForCurrentLanguage.prompts["unstaged-commits-confirm-add"].text));
    const answer = convertAnswerToDefault(MessagesForCurrentLanguage.prompts["unstaged-commits-confirm-add"], userAnswer.trim().toLowerCase(), "y");
    if (answer === "y" || answer.trim().length === 0) {
      console.log(MessagesForCurrentLanguage.messages["staging-all-files"])
      git.add();
    }
  }
}
function checkForStagedCommits() {
  try {
    const status = git.status({ short: true });
    Logger.verbose("Status: ", status)
    return status;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Command exited with status 128") {
        Logger.verbose("checkForStagedCommits Failed: Not a git repository?")
        Logger.error("Error: Failed to check for outstanding changes. Not a git repository?")
        process.exit(128);
      }
    }
    throw e;
  }
}

