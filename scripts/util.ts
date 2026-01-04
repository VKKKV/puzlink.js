import { gzipSize } from "gzip-size";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

export const scriptsDir = path.dirname(url.fileURLToPath(import.meta.url));

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

/** Write a file, making directories if needed, and log its size. */
export async function writeLines(
  dir: string,
  name: string,
  lines: string | string[],
) {
  const data = Array.isArray(lines) ? lines.join("\n") : lines;
  const file = path.join(dir, name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data, "utf-8");
  const sizeKB = Math.round(data.length / 1e3);
  const gzipSizeKB = Math.round((await gzipSize(data)) / 1e3);
  console.log(
    `${sizeKB.toString().padStart(4)}k ${gzipSizeKB.toString().padStart(4)}k ${name}`,
  );
}
