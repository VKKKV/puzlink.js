/** Run a function, and return the result and its duration in milliseconds. */
export async function timeAsync<T>(fn: () => T | Promise<T>): Promise<{
  result: T;
  duration: number;
}> {
  const start = Date.now();
  const result = await fn();
  return { result, duration: Date.now() - start };
}

/** Run a function, and return the result and its duration in milliseconds. */
export function timeSync<T>(fn: () => T): {
  result: T;
  duration: number;
} {
  const start = Date.now();
  const result = fn();
  return { result, duration: Date.now() - start };
}
