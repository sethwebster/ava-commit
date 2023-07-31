import fs from 'fs';

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

export function makeAvaDiffCacheFilePath(hash: string) {
  return `${makeAvaDiffCachePath()}/${hash}.json`;
}

