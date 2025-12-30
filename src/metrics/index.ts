import { Bitset } from "../lib/bitset.js";
import { LetterIndices } from "../lib/letterIndices.js";
import { LogNum } from "../lib/logNum.js";
import { enumerate, interval, windows } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker, PartialLink } from "../linkers/index.js";
import * as T from "../templating/index.js";
import { ConeLogProbs } from "./coneLogProb.js";
import { letterCountMetrics } from "./letterCount.js";
import { letterSequenceMetrics } from "./letterSequence.js";
import { otherMetrics } from "./other.js";
import { substringMetrics } from "./substring.js";

type Props = {
  letterIndices: LetterIndices;
  wordlist: Wordlist;
};

export function getProps(wordlist: Wordlist, slug: string): Props {
  return { letterIndices: LetterIndices.from(slug), wordlist };
}

/**
 * A Metric is a function that assigns a slug to a non-negative integer.
 *
 * Metrics are used to build features, of the form:
 *   - has exactly <value> of ..., and
 *   - has at least <value> of ...
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

type FeatureCone = { vertex: number; strict: boolean };

/**
 * Turns a list of scores into a list of (vertex, strict) pairs to construct
 * Features out of. Because some Features cones contain others, we only need to
 * report the smallest Features that contain each subset of scores, because
 * these are the best-scoring ones.
 */
export function getFeatureCones(
  /** Map from a score to the bitset of slug indices that have it. */
  scores: Map<number, bigint>,
): Map<bigint, FeatureCone[]> {
  const setToCones = new Map<bigint, FeatureCone[]>([[0n, []]]);
  const push = (cone: FeatureCone, contained: bigint) => {
    if (!setToCones.has(contained)) {
      setToCones.set(contained, []);
    }
    setToCones.get(contained)!.push(cone);
  };

  const sorted = [...scores.entries(), [Infinity, 0n] as const].sort(
    (a, b) => a[0] - b[0],
  );
  let restIndices = Array.from(scores.values()).reduce((a, b) => a | b, 0n);
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

  return setToCones;
}

/** Create the Linker for a Metric. */
function metricLinker(wordlist: Wordlist, metric: Metric): Linker {
  const { metricName, name, score } = metric;

  ConeLogProbs.fill(T.renderToText(metricName), () => {
    let maxVector = 0;
    const counts: Record<number, number> = {};
    wordlist.reduce(undefined, (_, slug) => {
      const vector = score(slug, getProps(wordlist, slug)).score;
      maxVector = Math.max(maxVector, vector);
      counts[vector] = (counts[vector] ?? 0) + 1;
      return undefined;
    });
    return {
      maxVector,
      logProbs: Object.fromEntries(
        Object.entries(counts).map(([vector, count]) => [
          vector,
          LogNum.fromFraction(count, wordlist.length),
        ]),
      ),
    };
  });

  return {
    name: metricName,
    eval: (slugs) => {
      const links: PartialLink[] = [];
      const scores = slugs.map((slug) => score(slug, getProps(wordlist, slug)));
      // TODO: this pattern appears so often, we should make it an indices class
      const scoreToBitset = new Map<number, bigint>();
      for (const [i, { score }] of enumerate(scores)) {
        scoreToBitset.set(
          score,
          (scoreToBitset.get(score) ?? 0n) | (1n << BigInt(i)),
        );
      }
      const bitsetToCones = getFeatureCones(scoreToBitset);
      for (const [bitset, cones] of bitsetToCones) {
        const indices = Array.from(new Bitset(bitset).entries());
        let bestCone: FeatureCone | undefined;
        let bestLogProb = LogNum.from(1);
        for (const cone of cones) {
          const featureLogProb = LogNum.min([
            ConeLogProbs.total(
              T.renderToText(metricName),
              cone.vertex,
              cone.strict,
            ),
            LogNum.from(1),
          ]);
          const logProb = LogNum.binomialPValue(
            indices.length,
            slugs.length,
            featureLogProb,
          );
          if (logProb.lt(bestLogProb)) {
            bestCone = cone;
            bestLogProb = logProb;
          }
        }
        if (bestCone === undefined) {
          continue;
        }
        links.push({
          name: T.Join([
            T.Fraction(indices.length, slugs.length),
            name(bestCone.vertex, bestCone.strict),
          ]),
          logProb: bestLogProb,
          description: T.Table(
            indices.map((i) =>
              scores[i]!.describe(bestCone.vertex, bestCone.strict),
            ),
          ),
        });
      }
      return links;
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
