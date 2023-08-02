export default function cancelablePromise<T>(fn: (resolve: (value: T) => void, reject: (reason?: any) => void) => void, timeoutMs?: number): Promise<T> {  
  return new Promise<T>((resolve, reject) => {
    let interval: NodeJS.Timeout;
    if (timeoutMs) {
      interval = setTimeout(() => {
        reject("Promise timed out");
      }, timeoutMs);
    }
    const res = (value: T) => {
      if (interval) {
        clearTimeout(interval);
      }
      resolve(value);
    }
    fn(res, reject)
  });
}