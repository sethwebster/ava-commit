import fs from 'fs';
import packageJson from './packageJson.js';
import chalk from 'chalk';
import boxen, { Options } from 'boxen';
import cancelablePromise from './CancelablePromise.js';

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

export async function checkForLatestVersionSafeWithTimeout(timeout: number) {
  return cancelablePromise(checkForLatestVersionSafe, timeout).catch(e => {});
}

export async function checkForLatestVersionSafe() {
  try {
    await checkForLatestVersion();
  } catch (e) {
    // Swallow the error
  }
}

export async function checkForLatestVersion() {
  //{"name":"@sethwebster/ava-commit","version":"0.0.10","description":"`ava-commit` is a command-line tool that uses ChatGPT to generate git commit messages automatically. It leverages the capabilities of AI to produce informative, human-like messages. This was created as a  fun pet project while I couldn't sleep and has pro","main":"./src/index.ts","type":"module","repository":{"type":"git","url":"git+https://github.com/sethwebster/ava-commit.git"},"bin":{"ava-commit":"dist/index.js"},"scripts":{"dev":"tsc -w","build":"tsc","test":"echo \"Error: no test specified\" && exit 1"},"keywords":["ai","gpt","git"],"author":{"name":"Seth Webster"},"license":"ISC","dependencies":{"chalk":"^4.1.2","chalk-animation":"^2.0.3","commander":"^11.0.0","figlet":"^1.6.0","langchain":"^0.0.120"},"devDependencies":{"@types/chalk-animation":"^1.6.1","@types/node":"^20.4.5","typescript":"^5.1.6"},"gitHead":"4c4023ec80ec473171847085dd8e7a439122a1ca","bugs":{"url":"https://github.com/sethwebster/ava-commit/issues"},"homepage":"https://github.com/sethwebster/ava-commit#readme","_id":"@sethwebster/ava-commit@0.0.10","_nodeVersion":"18.17.0","_npmVersion":"9.6.7","dist":{"integrity":"sha512-UxV3n21qHsE+8Sl4664U7ikTTkhWBMgbl8X2QjoT1aETBkUVk2qozhzc//7XJSwfPWaq0bTJuwKH5AhMQlnnCQ==","shasum":"eb5bcb6f466af3042b053373b9ca495f73a13cb1","tarball":"https://registry.npmjs.org/@sethwebster/ava-commit/-/ava-commit-0.0.10.tgz","fileCount":49,"unpackedSize":131755,"signatures":[{"keyid":"SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA","sig":"MEUCIEhIsDQmGthERFR/t5qPb4u7V3hhtSzwphGmrGshpje8AiEAoXcBNsCaHmr20QeSlYw18AwOioPLxBu9Hq9C3DqP6ng="}]},"_npmUser":{"name":"sethwebster","email":"sethwebster@gmail.com"},"directories":{},"maintainers":[{"name":"sethwebster","email":"sethwebster@gmail.com"}],"_npmOperationalInternal":{"host":"s3://npm-registry-packages","tmp":"tmp/ava-commit_0.0.10_1690928641013_0.20577745860724161"},"_hasShrinkwrap":false}
  //https://registry.npmjs.org/@sethwebster/ava-commit/latest
  const currentVersion = packageJson.packageVersion();
  const response = await fetch(`https://registry.npmjs.org/@sethwebster/ava-commit/latest`);
  const json = await response.json();
  const latestVersion = json.version;
  if (currentVersion !== latestVersion) {
    // Draw a corner and a line
    const options: Options = {
      padding: 1,
      margin:1,     
      borderStyle: "round",
      dimBorder: true,
      title: "An update is available",
    }
    console.log(
      boxen(
        `\🎉🎉 ${chalk.bold(chalk.green("ava-commit"))} ${chalk.bold(chalk.yellow(currentVersion))} is out of date. The latest version is ${chalk.bold(chalk.green(latestVersion))}.
        Run ${chalk.bold(chalk.green("npm i -g @sethwebster/ava-commit"))} to update.
        `, options
      )
    )
  }
}

export function makeAvaDiffCacheFilePath(hash: string) {
  return `${makeAvaDiffCachePath()}/${hash}.json`;
}

