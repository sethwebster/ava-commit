import chalk from "chalk";
import MessagesForCurrentLanguage from "./messages.js";

export default function displayOptions(options: string[]) {
  const message = options.map((m, i) => `${chalk.bold(chalk.yellow(i + 1))}. ${m}`).join("\n");
  console.log(`${MessagesForCurrentLanguage.messages["commit-message-options"]}\n${message}`);
}