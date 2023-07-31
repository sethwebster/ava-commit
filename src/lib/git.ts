import { exec } from "child_process";
import { spawn } from "./spawn.js";

type GitStatusType = "unknown" | "added" | "modified" | "modified-partly-staged" | "deleted";
type GitStatusEntry = {
  type: GitStatusType;
  path: string;
}

function currentBranch() {
  const currentBranch = spawn("git", ["branch", "--show-current"]) ?? "";
  return currentBranch;
}

async function diff() {
  return new Promise<string[]>((resolve, reject) => {
    const branch = (currentBranch() ?? "HEAD").trim();
    console.log("git", ["diff", branch, "--staged"])
    const diffResult = spawn("git", ["diff", branch, "--staged"]) ?? "";
    return resolve(diffResult.split("---"));
  });
}

async function add(addStr = ".") {
  const addResult = spawn("git", ["add", "."]);
  return addResult;
}

async function commit(commitMessage: string) {
  const commitResult = spawn("git", ["commit", "-m", commitMessage]);
  return commitResult;
}

function status(options?: { short?: boolean } | undefined): GitStatusEntry[] {
  const statusResult = spawn("git", ["status", options?.short ? "--short" : ""]);
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
  currentBranch
}

export default git;