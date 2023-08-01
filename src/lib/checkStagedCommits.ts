import chalk from "chalk";
import git from "./git.js";
import { options } from "../index.js";
import consoleHelpers from "./consoleHelpers.js";
import messages from "./messages.js";
import MessagesForCurrentLanguage from "./messages.js";

export default async function checkStagedCommits() {
  const status = git.status({ short: true });
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
    console.log(chalk.yellow(MessagesForCurrentLanguage.prompts["unstaged-commits-confirm-add"]));
    const answer = await consoleHelpers.readline("(Y, n) > ");
    if (answer.toLowerCase() === "y" || answer.trim().length === 0) {
      console.log(MessagesForCurrentLanguage.messages["staging-all-files"])
      git.add();
    }
  }
}
