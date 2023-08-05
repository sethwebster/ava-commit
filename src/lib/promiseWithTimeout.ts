function makeTimeoutPromise(timeoutMs: number) {
  let interval: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise((_resolve, reject) => {
    interval = setTimeout(() => {
      reject("timeout");
    }, timeoutMs);
  });
  return {
    timeoutPromise,
    interval
  }
}

export async function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  const { timeoutPromise, interval } = makeTimeoutPromise(timeoutMs);
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    return res as T;
  } catch (e) {
    console.log('e', e)
    throw e;
  } finally {
    if (interval) {
      clearTimeout(interval);
    }
  }
} 