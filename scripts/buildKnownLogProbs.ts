import * as fs from "node:fs/promises";
import { KnownLogProbs } from "../src/features/logProbCache.js";
import * as puzlink from "../src/index.js";

const start = Date.now();

const knownLogProbsPath = new URL(
  "../src/data/knownLogProbs.ts",
  import.meta.url,
);

const regenAll = process.argv[2] === "all";

if (regenAll) {
  console.log("building all logProbs");
  KnownLogProbs.useCache = false;
} else {
  console.log('building new logProbs (pass "all" to regenerate all)');
}

const durations: [number, string][] = [];

const missingFeatures = new Set(Object.keys(KnownLogProbs.knownLogProbs));

KnownLogProbs.wrapCompute = (name, fn, existing) => {
  process.stdout.write(`  ${name}...`);
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;
  const tag =
    existing === undefined
      ? `(new: ${result.toLog().toFixed(3)})`
      : result.toLog() !== existing.toLog()
        ? `(diff: ${result.toLog().toFixed(3)})`
        : "(same)";
  process.stdout.write(` in ${duration.toString()}ms ${tag}\n`);
  durations.push([duration, name]);
  missingFeatures.delete(name);
  return result;
};

const newFile = [];

const oldFile = await fs.readFile(knownLogProbsPath, "utf-8");
for (const line of oldFile.split("\n")) {
  if (line.startsWith("export const knownLogProbs")) {
    break;
  }
  newFile.push(line);
}

// This actually computes the new log probs:
await puzlink.download();

for (const line of KnownLogProbs.dump()) {
  newFile.push(line);
}

// Add a trailing newline:
newFile.push("");

await fs.writeFile(knownLogProbsPath, newFile.join("\n"), "utf-8");

console.log(`built logProbs in ${(Date.now() - start).toString()}ms`);

if (durations.length > 0) {
  console.log("slowest computations:");
  for (const [duration, name] of durations
    .sort((a, b) => b[0] - a[0])
    .slice(0, 10)) {
    console.log(`  ${name}: ${duration.toString()}ms`);
  }
} else {
  console.log("no changes");
}

if (regenAll && missingFeatures.size > 0) {
  console.warn("missing features:");
  for (const name of missingFeatures) {
    console.warn(`  ${name}`);
  }
}
