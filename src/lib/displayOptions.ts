import chalk from "chalk";

export default function displayOptions(options: string[]) {
  const message = options.map((m, i) => `${chalk.bold(chalk.yellow(i + 1))}. ${m}`).join("\n");
  console.log(`Commit message options:\n${message}`);
}