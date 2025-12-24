/** Run a function, and return the result and its duration in milliseconds. */
export async function time<T>(fn: () => T | Promise<T>): Promise<{
  result: T;
  duration: number;
}> {
  const start = Date.now();
  const result = await fn();
  return { result, duration: Date.now() - start };
}
