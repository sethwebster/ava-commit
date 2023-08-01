import chalk from "chalk";
import git from "./git.js";
import { options } from "../index.js";
import consoleHelpers from "./consoleHelpers.js";

export default async function checkStagedCommits() {
  const status = git.status({ short: true });
  if (status.length === 0) {
    console.log(chalk.red("No changes to commit"));
    process.exit(1);
  }

  if (options.all) {
    console.log(chalk.yellow("Staging all files..."));
    git.add();
    return;
  }

  if (status.filter(s => s.type === "unknown" || s.type === "modified-partly-staged").length > 0) {
    console.log(chalk.yellow("You have unstaged commits. Do you want to stage them before generating the commit messages?"));
    const answer = await consoleHelpers.readline("(Y, n) > ");
    if (answer.toLowerCase() === "y" || answer.trim().length === 0) {
      console.log("Staging all files...")
      git.add();
    }
  }
}
