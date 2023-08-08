#!/usr/bin/env node
import { Argument, Command } from 'commander';
import { configure } from './lib/configure.js';
import packageJson from './lib/packageJson.js';
import { createReleaseNotes } from './lib/releaseNotes.js';
import generate from './lib/generate.js';
import { checkForLatestVersionAndNotify, doAutoUpdate } from './lib/environment.js';
import MessagesForCurrentLanguage from './lib/messages.js';
import Logger from './lib/logger.js';

async function start() {
  let verbose = false;
  if (process.argv.find((arg) => arg === '--verbose')) {
    verbose = true;
  }
  Logger.setVerbose(verbose);
  await checkForLatestVersionAndNotify();
  const program = new Command();
  program.version(packageJson.packageVersion() ?? "0.0.0", "-V,--version", MessagesForCurrentLanguage.messages["display-version-information"])
    .description(MessagesForCurrentLanguage.messages.description)
    .name('ava-commit')
    .addCommand(new Command("update").description(MessagesForCurrentLanguage.messages["update-command-description"])
      .action(() => {
        doAutoUpdate();
      }))
    .addCommand(new Command("release-notes").description(MessagesForCurrentLanguage.messages["release-notes-command-description"])
      .option("-v,--verbose", MessagesForCurrentLanguage.messages["option-verbose-description"], false).action(() => Logger.setVerbose(true))
      .action((options) => createReleaseNotes(options)))
    .addCommand(new Command("configure").description(MessagesForCurrentLanguage.messages["configure-command-description"]).action((options) => {configure(options)}))
    .addCommand(new Command("generate").description(MessagesForCurrentLanguage.messages["generate-command-description"])
      .option("-a, --all", MessagesForCurrentLanguage.messages["option-all-description"], false)
      .option('-v, --verbose', MessagesForCurrentLanguage.messages["option-verbose-description"], false)
      .option("-p, --push", MessagesForCurrentLanguage.messages["option-push-description"], false)
      .option("--ignore [file...]", "Ignore diffs to file")
      .option<number>('-l,--length <number>', MessagesForCurrentLanguage.messages["option-length-description"], (val, prev) => {
        return parseInt(val);
      }, 80)
      // .option("--release-notes", "Generate release notes as well", false)
      .option('--configure', MessagesForCurrentLanguage.messages["option-configure-description"])
      .addHelpText('after', `\n`)
      .addHelpText('after', MessagesForCurrentLanguage.messages["example-1"])
      .addHelpText('after', MessagesForCurrentLanguage.messages["example-2"])
      .addHelpText('after', MessagesForCurrentLanguage.messages["example-3"])
      .action((options) => {
        generate(options);
      })
    )
    .helpOption("-h,--help", MessagesForCurrentLanguage.messages["display-help-for-a-command"])
    .addHelpCommand("help [command]", MessagesForCurrentLanguage.messages["display-help-for-a-command"])
    .parse(process.argv);
}

start();