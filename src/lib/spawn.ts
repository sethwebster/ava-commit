import { spawn as spawnBase, spawnSync, exec as execBase } from "child_process";

export function spawn(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command exited with status ${result.status}`);
  }
  if (result.signal !== null) {
    throw new Error(`Command exited with signal ${result.signal}`);
  }
  if (result.stderr && result.stderr.length > 0) {
    throw new Error(result.stderr.toString());
  }
  if (result.stdout && result.stdout.length > 0) {
    return result.stdout.toString();
  }
}

export async function exec(command: string) {
  return new Promise<string>((resolve, reject) => {
    execBase(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr && stderr.length > 0) {
        reject(stderr);
      }
      if (stdout && stdout.length > 0) {
        resolve(stdout);
      }
      resolve("Nothing")
    });
  });
}