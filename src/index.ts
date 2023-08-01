import { Command } from 'commander';
import chalk from 'chalk';
import Readline from 'readline';
import consoleHelpers from './lib/consoleHelpers.js';
import git from './lib/git.js';
import { configure, loadConfig } from './lib/configure.js';
import { combineSummaries, summarizeDiffs, summarizeSummaries } from './lib/summarize.js';
import cache from './lib/cache.js';
import checkStagedCommits from './lib/checkStagedCommits.js';
import packageJson from './lib/packageJson.js';
import displayOptions from './lib/displayOptions.js';
import MessagesForCurrentLanguage, { convertAnswerToDefault } from './lib/messages.js';
import { createReleaseNotes } from './lib/releaseNotes.js';
import generate from './lib/generate.js';

const program = new Command();

program.version(packageJson.packageVersion())
  .description("🤖 Use AI to write your commit messages")
  .name("ava-commit")
  .addCommand(new Command("release-notes").description("Generates release notes based on what's changed since the most recent tag").action((options) => createReleaseNotes(options)))
  .addCommand(new Command("configure").description("Configure the tool").action((options) => configure(options)))
  .addCommand(new Command("generate").description("Generate a commit message")
    .option("-a,--all", "All commits, not just staged", false)
    .option('-v,--verbose', 'Verbose output', false)
    .option<number>('-l,--length [number]', 'Length of commit message', (val, prev) => {
      return parseInt(val);
    }, 80)
    // .option("--release-notes", "Generate release notes as well", false)
    .option('--configure', 'Configure the tool')
    .addHelpText('after', `\n`)
    .addHelpText('after', `Examples:`)
    .addHelpText('after', `  $ ava-commit generate                # create a commit message for staged files with all defaults`)
    .addHelpText('after', `  $ ava-commit generate --all          # create a commit message for staged files, bypassing the check for staged files`)
    .addHelpText('after', `  $ ava-commit generate --length 150   # create a commit message for staged files, targeting max summary of 150 characters`)
    .action((options) => {
      generate(options);
    })
    )
  .usage("command [options]")
  .parse(process.argv);