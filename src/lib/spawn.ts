import { spawnSync } from "child_process";

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