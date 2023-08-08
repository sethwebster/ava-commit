import { exec } from "child_process";
import { spawn } from "./spawn.js";
import Logger from "./logger.js";

type GitStatusType = "unknown" | "added" | "modified" | "modified-partly-staged" | "deleted";
type GitStatusEntry = {
  type: GitStatusType;
  path: string;
}

interface DiffOptions {
  baseCompare?: string;
  compare?: string;
  staged?: boolean;
}

function currentBranch() {
  const currentBranch = spawn("git", ["branch", "--show-current"]) ?? "";
  return currentBranch;
}

async function diff(options?: DiffOptions) {
  return new Promise<string[]>((resolve, reject) => {
    const branch = (currentBranch() ?? "HEAD").trim();
    const args: string[] = [
      "diff",
      options ? "" : "--staged",
      options ? "" : branch
    ].filter(n => n.length > 0)
    if (options) {
      if (options?.baseCompare) {
        args.push(options.baseCompare);
      }
      if (options?.compare) {
        args.push(options.compare);
      }
      if (options?.staged) {
        args.push("--staged");
      }
    }
    const diffResult = spawn("git", args) ?? "";
    const splits = diffResult.split(/^diff --git/gm).filter(l => l.trim().length > 0).map(l => `diff --git${l}`)
    return resolve(splits);
  });
}

export function parseDiff(diff: string) {
  const lines = diff.split("\n");
  const header = lines[0];
  const file = header.split(" ")[2].split("/").pop();
  const index = lines[1];
  return {
    file,
    index    
  }
}

async function log({ baseCompare, compare }: Omit<DiffOptions, "staged">) {
  try {
    const logResult = spawn("git", ["log", "--pretty=%B", `${baseCompare}..${compare}`]);
    const lines = (logResult ?? "").split("\n").filter(l => l.trim().length > 0);
    return lines;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("ambiguous argument")) {
        Logger.verbose("git.log - No commits found")
        return [];
      }
    }
  }
}

async function fetch({ all }: { all?: boolean } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const fetchResult = spawn("git", ["fetch", all ? "--all" : ""]);
      return resolve(fetchResult);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes("[new tag]")) {
          // this is OK
          resolve(e.message);
        } else {
          throw e;
        }
      }
    }
  });
}

async function tags() {
  return new Promise<string[]>((resolve, reject) => {
    const tagsResult = spawn("git", ["tag"]) ?? "";
    const tags = tagsResult.split("\n").filter(t => t.trim().length > 0);
    return resolve(tags);
  });
}

async function add(addStr = ".") {
  return new Promise((resolve, reject) => {
    const addResult = spawn("git", ["add", "."]);
    return resolve(addResult);
  });
}

async function commit(commitMessage: string) {
  const commitResult = spawn("git", ["commit", "-m", commitMessage]);
  return commitResult;
}

async function push() {
  const pushResult = spawn("git", ["push"]);
  return pushResult;
}

function status(options?: { short?: boolean } | undefined): GitStatusEntry[] {
  const statusResult = spawn("git", ["status", options?.short ? "--short" : ""]);
  Logger.verbose("git.status - Status result: ", statusResult);
  if (!statusResult) return [];
  const lines = statusResult.split("\n").filter(l => l.trim().length > 0);
  const entries = lines.map<GitStatusEntry>(l => {
    const parts = l.split(" ");
    const type = parts[0];
    const path = parts.slice(1).join(" ");
    switch (type) {
      case "??":
        return { type: "unknown", path };
      case "A":
        return { type: "added", path };
      case "M":
        return { type: "modified", path };
      case "MM":
        return { type: "modified-partly-staged", path };
      case "D":
        return { type: "deleted", path };
      default:
        return { type: "unknown", path };
    }
  });

  return entries;
}


const git = {
  diff,
  add,
  commit,
  status,
  currentBranch,
  fetch,
  push,
  tags,
  log
}

export default git;