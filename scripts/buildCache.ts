import { loadWordlist } from "cromulence";
import meow from "meow";
import * as fs from "node:fs/promises";
import { cache } from "../src/data/cache.js";
import { featureLinkers, FeatureLogProbs } from "../src/features/index.js";
import { KeyedCache } from "../src/lib/keyedCache.js";
import { LetterDistribution } from "../src/lib/letterDistribution.js";
import { Wordlist } from "../src/lib/wordlist.js";
import { metricLinkers, MetricLogProbs } from "../src/metrics/index.js";
import { timeAsync, timeSync } from "./util.js";

const MAX_TAG_LENGTH = 20;

function abbreviate(str: string, limit = MAX_TAG_LENGTH): string {
  return str.length <= limit ? str : `${str.slice(0, limit - 3)}...`;
}

const cli = meow(
  `
    Build JSON caches.

    Usage
      $ npm run build:cache -- [options]

    Options
      --all          Force rebuild all log probs
      --no-features  Don't build feature log probs
      --no-metrics   Don't build metric log probs
      --no-letters   Don't build letter distribution
  `,
  {
    importMeta: import.meta,
    flags: {
      all: { type: "boolean", default: false },
      features: { type: "boolean", default: true },
      letters: { type: "boolean", default: true },
      metrics: { type: "boolean", default: true },
    },
    allowUnknownFlags: false,
    description: false,
  },
);

type State = {
  args: (typeof cli)["flags"];
  start: number;
  durations: [number, string][];
  missingKeys: Set<string>;
};

function preDownload<T>(state: State, cache: KeyedCache<T>) {
  if (state.args.all) {
    cache.useCache = false;
  }

  cache.wrapCompute = (name, fn, existing) => {
    process.stdout.write(`  ${name}...`);
    const { result, duration } = timeSync(fn);
    const repr = cache.repr(result);
    const tag =
      existing === undefined
        ? `(new: ${abbreviate(repr)})`
        : repr !== cache.repr(existing)
          ? `(diff: ${abbreviate(repr)})`
          : "(same)";
    process.stdout.write(` in ${duration.toString()}ms ${tag}\n`);
    state.durations.push([duration, name]);
    state.missingKeys.delete(name);
    return result;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
async function write<const K extends keyof typeof cache>(
  key: K,
  value: string,
) {
  const path = new URL(`../src/data/cache/${key}.json`, import.meta.url);
  await fs.writeFile(path, value + "\n", "utf-8");
}

async function main() {
  const state: State = {
    args: cli.flags,
    start: Date.now(),
    durations: [],
    missingKeys: new Set(),
  };

  console.log(`building ${state.args.all ? "all" : "new"} caches for:`);

  if (state.args.features) {
    console.log("- feature log probs");
    preDownload(state, FeatureLogProbs);
  }
  if (state.args.metrics) {
    console.log("- metric log probs");
    preDownload(state, MetricLogProbs);
  }
  if (state.args.letters) {
    console.log("- letter distribution");
    delete cache.letterDistribution;
  }

  console.log("");
  const rawWordlist = await timeAsync(loadWordlist);
  console.log(`downloaded wordlist in ${rawWordlist.duration.toString()}ms`);

  if (state.args.letters) {
    console.log("\nbuilding letter distribution...");
    const { result, duration } = timeSync(
      () => new LetterDistribution(Object.keys(rawWordlist.result), false),
    );
    console.log(`built letter distribution in ${duration.toString()}ms`);
    await write("letterDistribution", JSON.stringify(result.dump(), null, 2));
  }

  const wordlist = new Wordlist(rawWordlist.result);

  if (state.args.features) {
    console.log("\nbuilding feature log probs...");
    const { duration } = timeSync(() => featureLinkers(wordlist));
    console.log(`built feature log probs in ${duration.toString()}ms`);
    await write("featureLogProbs", FeatureLogProbs.dump());
  }

  if (state.args.metrics) {
    console.log("\nbuilding metric log probs...");
    const { duration } = timeSync(() => metricLinkers(wordlist));
    console.log(`built metric log probs in ${duration.toString()}ms`);
    await write("metricLogProbs", MetricLogProbs.dump());
  }

  if (state.durations.length > 0) {
    console.log("\nslowest computations:");
    for (const [duration, name] of state.durations
      .sort((a, b) => b[0] - a[0])
      .slice(0, 10)) {
      console.log(`  ${name}: ${duration.toString()}ms`);
    }
  } else {
    console.log("\nno changes");
  }

  if (state.args.all && state.missingKeys.size > 0) {
    console.warn("\nmissing features:");
    for (const name of state.missingKeys) {
      console.warn(`  ${name}`);
    }
  }
}

await main();
