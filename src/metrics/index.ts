import { metricLogProbs } from "../data/metricLogProbs.js";
import { Bitset } from "../lib/bitset.js";
import { LetterIndices } from "../lib/letterIndices.js";
import { LogNum } from "../lib/logNum.js";
import { MetricLogProbCache } from "../lib/logProbCache.js";
import { enumerate, interval, windows } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker } from "../linkers/index.js";
import * as T from "../templating/index.js";
import { letterCountMetrics } from "./letterCount.js";
import { letterSequenceMetrics } from "./letterSequence.js";
import { otherMetrics } from "./other.js";
import { substringMetrics } from "./substring.js";

export const MetricLogProbs = new MetricLogProbCache(metricLogProbs);

type Props = {
  letterIndices: LetterIndices;
  wordlist: Wordlist;
};

function getProps(wordlist: Wordlist, slug: string): Props {
  return { letterIndices: LetterIndices.from(slug), wordlist };
}

/**
 * A Metric assigns a slug to a non-negative integer. Metrics are used to build
 * features of the form: "has {exactly, at least} <value> ...".
 *
 * Representing features as metrics lets us deduplicate reported features, and
 * makes computing features for high-cardinality metrics take less time.
 */
export type Metric = {
  /** The name of the metric; used for debugging. */
  metricName: T.Inline;
  /**
   * Constructs the name of a feature. For example: (2, true) =>
   *   "has exactly two ..."
   */
  name: (vertex: number, strict: boolean) => T.Inline;
  /** Score a slug for the given metric. */
  score: (
    slug: string,
    props: Props,
  ) => {
    /** The actual score. */
    score: number;
    /** Returns a description of the score, for the given metric. */
    describe: (vertex: number, strict: boolean) => T.Row;
  };
};

/**
 * A range of scores. If strict, this is { vertex }. Otherwise, this is
 * [vertex, inf).
 */
type FeatureRange = { vertex: number; strict: boolean };

/**
 * Turns a list of scores into a list of (vertex, strict) pairs to construct
 * Features out of. Because some Features ranges contain others, we only need to
 * report the smallest Features that contain each subset of scores, because
 * these are the best-scoring ones.
 */
export function getFeatureRanges(
  scores: number[],
): Map<bigint, FeatureRange[]> {
  const scoreToBitset = new Map<number, bigint>();
  for (const [i, score] of enumerate(scores)) {
    scoreToBitset.set(
      score,
      (scoreToBitset.get(score) ?? 0n) | (1n << BigInt(i)),
    );
  }

  const setToRanges = new Map<bigint, FeatureRange[]>([[0n, []]]);
  const push = (range: FeatureRange, contained: bigint) => {
    if (!setToRanges.has(contained)) {
      setToRanges.set(contained, []);
    }
    setToRanges.get(contained)!.push(range);
  };

  const sorted = [...scoreToBitset.entries(), [Infinity, 0n] as const].sort(
    (a, b) => a[0] - b[0],
  );
  const allIndices = Array.from(scoreToBitset.values()).reduce(
    (a, b) => a | b,
    0n,
  );
  let restIndices = allIndices;
  for (const [[a, aIndices], [b]] of windows(sorted, 2)) {
    if (b < Infinity) {
      push({ vertex: a, strict: false }, restIndices);
      push({ vertex: a, strict: true }, aIndices);
      for (const v of interval(a + 1, b - 1)) {
        push({ vertex: v, strict: true }, 0n);
      }
      restIndices &= ~aIndices;
    } else {
      push({ vertex: a, strict: true }, aIndices);
      push({ vertex: a + 1, strict: false }, 0n);
    }
  }

  // There is exactly one pair of complementary feature ranges: (0, true) and
  // (1, false). If both are present, we keep only (0, true).
  const zeroScore = scoreToBitset.get(0);
  if (zeroScore) {
    setToRanges.delete(allIndices & ~zeroScore);
  }

  return setToRanges;
}

/** Create the Linker for a Metric. */
function metricLinker(wordlist: Wordlist, metric: Metric): Linker {
  const linkerName = T.renderToText(metric.metricName);

  MetricLogProbs.fill(linkerName, () => {
    const counts = wordlist.reduce(new Map<number, number>(), (acc, slug) => {
      const vector = metric.score(slug, getProps(wordlist, slug)).score;
      return acc.set(vector, (acc.get(vector) ?? 0) + 1);
    });
    return interval(0, Math.max(...counts.keys())).map((i) =>
      LogNum.fromFraction(counts.get(i) ?? 0, wordlist.length),
    );
  });

  return {
    name: metric.metricName,
    eval: function* (slugs, options) {
      const scores = slugs.map((slug) =>
        metric.score(slug, getProps(wordlist, slug)),
      );
      const bitsetToRanges = getFeatureRanges(scores.map((x) => x.score));
      for (const [bitset, ranges] of bitsetToRanges) {
        const indices = Array.from(new Bitset(bitset).entries());
        if (
          indices.length !== 0 &&
          indices.length < options.minFeatureRatio * slugs.length
        ) {
          continue;
        }
        const rangeLogProbs = ranges.flatMap((range) => {
          const logProb = LogNum.binomialPValue(
            indices.length,
            slugs.length,
            MetricLogProbs.get(linkerName, range.vertex, range.strict),
          );
          return logProb ? [{ range, logProb }] : [];
        });
        const { range, logProb } =
          LogNum.minBy(rangeLogProbs, (x) => x.logProb) ?? {};
        if (!range || !logProb) {
          continue;
        }
        yield {
          name: T.Join([
            T.Fraction(indices.length, slugs.length),
            metric.name(range.vertex, range.strict),
          ]),
          logProb,
          description: T.Table(
            indices.map((i) => scores[i]!.describe(range.vertex, range.strict)),
          ),
        };
      }
    },
  };
}

/** Metric-based linkers. */
export function metricLinkers(wordlist: Wordlist): Linker[] {
  return [
    ...letterCountMetrics(),
    ...letterSequenceMetrics(),
    ...otherMetrics(),
    ...substringMetrics(),
  ].map((metric) => metricLinker(wordlist, metric));
}

/**
 * For testing purposes. Takes a list of metrics, and returns
 * a function that takes a slug and returns its score against each metric.
 */
export function makeMetricGetter(
  metrics: Metric[],
  wordlist: Wordlist,
): (slug: string) => Record<string, string> {
  return (slug) => {
    const properties: Record<string, string> = {};
    for (const metric of metrics) {
      const score = metric.score(slug, getProps(wordlist, slug));
      if (score.score === 0) {
        continue;
      }
      const feature = {
        vertex: score.score,
        strict: true,
      };
      properties[T.renderToText(metric.name(feature.vertex, feature.strict))] =
        score
          .describe(feature.vertex, feature.strict)
          .cells.map((c) => {
            const content = T.renderToText(c.content);
            return c.collapsible ? `(${content})` : content;
          })
          .join(" | ");
    }
    return properties;
  };
}
