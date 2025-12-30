import meow from "meow";
import * as fs from "node:fs/promises";
import { FeatureLogProbs } from "../src/features/index.js";
import { Puzlink } from "../src/index.js";
import { LogProbCache } from "../src/lib/logProbCache.js";
import { MetricLogProbs } from "../src/metrics/index.js";

const MAX_TAG_LENGTH = 20;

function abbreviate(str: string, limit = MAX_TAG_LENGTH): string {
  return str.length <= limit ? str : `${str.slice(0, limit - 3)}...`;
}

const cli = meow(
  `
    Build cached feature/metric log probs.

    Usage
      $ npm run build:logProbs -- [options]

    Options
      --all          Build all log probs
      --no-features  Don't build feature log probs
      --no-metrics   Don't build metric log probs
  `,
  {
    importMeta: import.meta,
    flags: {
      all: {
        type: "boolean",
        default: false,
      },
      features: {
        type: "boolean",
        default: true,
      },
      metrics: {
        type: "boolean",
        default: true,
      },
    },
  },
);

type State = {
  args: (typeof cli)["flags"];
  start: number;
  durations: [number, string][];
  missingKeys: Set<string>;
};

function preDownload<T>(state: State, cache: LogProbCache<T>) {
  if (state.args.all) {
    cache.useCache = false;
  }

  cache.wrapCompute = (name, fn, existing) => {
    process.stdout.write(`${name}...`);
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
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

async function main() {
  const state: State = {
    args: cli.flags,
    start: Date.now(),
    durations: [],
    missingKeys: new Set(),
  };

  console.log(`building${state.args.all ? " all" : ""} log probs for:`);

  if (state.args.features) {
    console.log("- features");
    preDownload(state, FeatureLogProbs);
  }
  if (state.args.metrics) {
    console.log("- metrics");
    preDownload(state, MetricLogProbs);
  }

  console.log("");
  await Puzlink.download();
  console.log("");

  console.log(`built logProbs in ${(Date.now() - state.start).toString()}ms`);

  if (state.args.features) {
    const featureLogProbsPath = new URL(
      "../src/data/featureLogProbs.ts",
      import.meta.url,
    );
    const lines = [...FeatureLogProbs.dump(), ""];
    await fs.writeFile(featureLogProbsPath, lines.join("\n"), "utf-8");
  }
  if (state.args.metrics) {
    const metricLogProbsPath = new URL(
      "../src/data/metricLogProbs.ts",
      import.meta.url,
    );
    const lines = [...MetricLogProbs.dump(), ""];
    await fs.writeFile(metricLogProbsPath, lines.join("\n"), "utf-8");
  }

  if (state.durations.length > 0) {
    console.log("slowest computations:");
    for (const [duration, name] of state.durations
      .sort((a, b) => b[0] - a[0])
      .slice(0, 10)) {
      console.log(`  ${name}: ${duration.toString()}ms`);
    }
  } else {
    console.log("no changes");
  }

  if (state.args.all && state.missingKeys.size > 0) {
    console.warn("missing features:");
    for (const name of state.missingKeys) {
      console.warn(`  ${name}`);
    }
  }
}

await main();
