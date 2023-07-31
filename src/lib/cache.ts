import fs from 'fs';
import crypto from "crypto";
import { ensureAvaDiffCachePathExists, makeAvaDiffCacheFilePath } from "./environment.js";

interface PreviousRun {
  summaries: string[];
  commitMessages: string[];
}

function hashStringSha256(str: string) {
  const hash = crypto.createHash("sha256");
  hash.update(str);
  return hash.digest("hex");
}

function getPreviousRun(diffs: string[]): PreviousRun | null {
  ensureAvaDiffCachePathExists();
  const diffsHash = hashStringSha256(diffs.join("\n"));
  const path = makeAvaDiffCacheFilePath(diffsHash);
  
  if (!fs.existsSync(path)) return null;

  const data = fs.readFileSync(path);
  try {
    return JSON.parse(data.toString());
  } catch (e) {
    console.error(e);
    return null;
  }
}

function deletePrevoiusRun(diffs: string[]): void {
  ensureAvaDiffCachePathExists();
  const diffsHash = hashStringSha256(diffs.join("\n"));
  const path = makeAvaDiffCacheFilePath(diffsHash);
  fs.unlinkSync(path);
}  

function storePreviousRun(diffs: string[], summaries: string[], commitMessages: string[]): void {
  ensureAvaDiffCachePathExists();
  const diffsHash = hashStringSha256(diffs.join("\n"));
  const path = makeAvaDiffCacheFilePath(diffsHash);
  const data = JSON.stringify({
    summaries,
    commitMessages,
  });
  fs.writeFileSync(path, data);
}

export default {
  getPreviousRun,
  storePreviousRun,
  deletePreviousRun: deletePrevoiusRun
}