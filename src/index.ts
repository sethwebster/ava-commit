import { Command } from 'commander';
import { configure } from './lib/configure.js';
import packageJson from './lib/packageJson.js';
import { createReleaseNotes } from './lib/releaseNotes.js';
import generate from './lib/generate.js';
import { checkForLatestVersionAndNotify, doAutoUpdate } from './lib/environment.js';

async function start() {
  await checkForLatestVersionAndNotify();
  const program = new Command();
  program.version(packageJson.packageVersion())
    .description("🤖 Use AI to write your commit messages")
    .name("ava-commit")
    .addCommand(new Command("update").description("Check for updates").action(() => {
      doAutoUpdate();
    }))
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
}

start();