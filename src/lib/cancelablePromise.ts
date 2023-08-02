async function cancelablePromise<T>(fn: (resolve: (value: T) => void, reject: (reason?: any) => void) => void, timeoutMs?: number): Promise<T> {  
  return new Promise<T>((resolve, reject) => {
    if (timeoutMs) {
      setTimeout(() => {
        reject("Promise timed out");
      }, timeoutMs);
    }
    fn(resolve, reject);
  });
}
export default cancelablePromise;