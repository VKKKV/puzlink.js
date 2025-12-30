import { Bitset } from "../lib/bitset.js";
import { LetterIndices } from "../lib/letterIndices.js";
import { LogNum } from "../lib/logNum.js";
import type { TupleOf } from "../lib/util.js";
import { enumerate, interval, power, product } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker, PartialLink } from "../linkers/index.js";
import * as T from "../templating/index.js";
import { Cone, fill, Vector } from "./cone.js";
import { ConeLogProbs } from "./coneLogProb.js";
import { letterCountMetrics } from "./letterCount.js";

type Props = {
  letterIndices: LetterIndices;
  wordlist: Wordlist;
};

export function getProps(wordlist: Wordlist, slug: string): Props {
  return { letterIndices: LetterIndices.from(slug), wordlist };
}

/**
 * A Metric is a function that assigns a slug to some non-negative integer
 * vector, usually a one-dimensional one.
 *
 * Metrics are used to build features. For example, a one-dimensional metric's
 * features are of the form:
 *   - has exactly <value> of ..., and
 *   - has at least <value> of ...
 * Generally, a feature is a convex cone in the metric space, specified via
 * its vertex and the non-strict dimensions which generate it.
 *
 * Representing features as metrics lets us deduplicate reported features, and
 * makes computing features for high-cardinality metrics take less time.
 */
export type Metric<Dimension extends number> = {
  /** The name of the metric; used for debugging. */
  metricName: string;
  /** The number of dimensions in the vector. */
  dimension: Dimension;
  /**
   * Constructs the name of a feature. For example: ([2, 3], [true, false]) =>
   *   "has exactly two ... at least thrice ..."
   */
  name: (
    vertex: TupleOf<Dimension, number>,
    strict: TupleOf<Dimension, boolean>,
  ) => T.Inline;
  /** Score a slug for the given metric. */
  score: (
    slug: string,
    props: Props,
  ) => {
    /** The actual score. */
    score: TupleOf<Dimension, number>;
    /** Returns a description of the score, for the given metric. */
    describe: (
      vertex: TupleOf<Dimension, number>,
      strict: TupleOf<Dimension, boolean>,
    ) => T.Row;
  };
};

type AnyMetric = {
  metricName: string;
  dimension: number;
  name: (vertex: number[], strict: boolean[]) => T.Inline;
  score: (
    slug: string,
    props: Props,
  ) => {
    score: number[];
    describe: (vertex: number[], strict: boolean[]) => T.Row;
  };
};

/** Helper for defining a Metric. */
export function defineMetric<const Dimension extends number>(
  dimension: Dimension,
  metric: Omit<Metric<Dimension>, "dimension">,
): AnyMetric {
  return { dimension, ...metric } as unknown as AnyMetric;
}

/**
 * Turns a list of scores into a list of (vertex, strict) pairs to construct
 * Features out of. Because some Features cones contain others, we only need to
 * report the smallest Features that contain each subset of scores, because
 * these are the best-scoring ones.
 */
export function getFeatureCones<Dimension extends number>(
  dimension: Dimension,
  /** Map from a bitset of slug indices to a shared score for those slugs. */
  scores: Map<bigint, Vector<Dimension>>,
): Map<bigint, Cone<Dimension>[]> {
  const setToCones = new Map<bigint, Cone<Dimension>[]>([[0n, []]]);

  // A feature cone can theoretically have its vertex anywhere in the range;
  // for example, the smallest feature cone containing [0, 1] and [1, 0]
  // has vertex [0, 0]. We also care about feature cones that contain none
  // of the scores.
  const ranges: [min: number, max: number][] = [];
  for (const d of interval(0, dimension - 1)) {
    let min = Infinity;
    let max = 0;
    for (const score of scores.values()) {
      min = Math.min(min, score.get(d));
      max = Math.max(max, score.get(d));
    }
    ranges.push([min, max]);
  }
  const vertices = Array.from(
    product(ranges.map(([min, max]) => interval(min, max + 1))),
  ) as TupleOf<Dimension, number>[];

  for (const strict of power([false, true], dimension)) {
    for (const vertex of vertices) {
      const cone = Cone.from(dimension, vertex, strict);
      let contained = 0n;
      for (const [bitset, score] of scores) {
        if (cone.includes(score)) {
          contained |= bitset;
        }
      }
      if (!setToCones.has(contained)) {
        setToCones.set(contained, []);
      }
      setToCones.get(contained)!.push(cone);
    }
  }

  // We only need to report the cones in the boundary for each set. Why?
  // Suppose some cone b was not in the boundary. Then there exists cones a and
  // c such that a < b < c under the containment poset. The frequencies are
  // also monotonic, and so are the expected number of successes. The actual
  // number of successes is either:
  // - at least b, in which case the binomial p-value under a is smaller, and
  //   thus higher-scoring; or,
  // - less than b, in which case the binomial p-value under c is smaller, and
  //   thus higher-scoring.
  // Concretely, this could be like: a is "has at least 3 of ...", b is "has at
  // least 2 of ...", and c is "has at least 1 of ...". If the actual number is
  // 3, then the best binomial p-value is with a; if the actual number is 0,
  // then the best binomial p-value is with c.
  for (const [set, cones] of setToCones) {
    // As a special case, if the actual number is 0 (and thus the set is 0n),
    // then it's enough to take the maxima.
    if (set === 0n) {
      setToCones.set(set, Cone.maxima(cones));
    } else {
      setToCones.set(set, Cone.extrema(cones));
    }
  }

  return setToCones;
}

/** Create the Linker for a Metric. */
function metricLinker(wordlist: Wordlist, metric: AnyMetric): Linker {
  const { metricName, dimension, name, score } = metric;

  ConeLogProbs.fill(metricName, () => {
    const maxVector = fill(dimension, 0);
    const counts: Record<string, number> = {};
    wordlist.reduce(undefined, (_, slug) => {
      const vector = Vector.from(
        dimension,
        score(slug, getProps(wordlist, slug)).score,
      );
      const vectorString = vector.toString();
      if (counts[vectorString] !== undefined) {
        counts[vectorString] += 1;
        return undefined;
      }
      for (const d of interval(0, dimension - 1)) {
        maxVector[d] = Math.max(maxVector[d]!, vector.get(d));
      }
      counts[vectorString] = 1;
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
    name: T.Text(metricName),
    eval: (slugs) => {
      const links: PartialLink[] = [];
      const scores = slugs.map((slug) => score(slug, getProps(wordlist, slug)));
      // TODO: this pattern appears so often, we should make it an indices class
      const scoreToIndices = new Map<string, number[]>();
      for (const [i, { score }] of enumerate(scores)) {
        const serialized = Vector.from(metric.dimension, score).toString();
        if (!scoreToIndices.has(serialized)) {
          scoreToIndices.set(serialized, []);
        }
        scoreToIndices.get(serialized)!.push(i);
      }
      const bitsetToScore = new Map(
        Array.from(scoreToIndices, ([score, indices]) => [
          Bitset.from(indices).data,
          Vector.parse(dimension, score),
        ]),
      );
      const bitsetToCones = getFeatureCones(dimension, bitsetToScore);
      for (const [bitset, cones] of bitsetToCones) {
        if (cones.length === 0) {
          continue;
        }
        const indices = Array.from(new Bitset(bitset).entries());
        let bestCone: Cone<number> | undefined;
        let bestLogProb = LogNum.from(1);
        for (const cone of cones) {
          const logProb = LogNum.binomialPValue(
            indices.length,
            slugs.length,
            ConeLogProbs.total(metricName, cone),
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
          name: name(bestCone.vertex.value, bestCone.strict),
          logProb: bestLogProb,
          description: T.Table(
            indices.map((i) =>
              scores[i]!.describe(bestCone.vertex.value, bestCone.strict),
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
  return [...letterCountMetrics()].map((metric) =>
    metricLinker(wordlist, metric),
  );
}

/**
 * For testing purposes. Takes a list of metrics, and returns
 * a function that takes a slug and returns its score against each metric.
 */
export function makeMetricGetter(
  metrics: AnyMetric[],
  wordlist: Wordlist,
): (slug: string) => Record<string, string> {
  return (slug) => {
    const properties: Record<string, string> = {};
    for (const metric of metrics) {
      const score = metric.score(slug, getProps(wordlist, slug));
      const feature = Cone.from(
        metric.dimension,
        fill(metric.dimension, 0),
        fill(metric.dimension, true),
      );
      properties[
        T.renderToText(metric.name(feature.vertex.value, feature.strict))
      ] = score
        .describe(feature.vertex.value, feature.strict)
        .cells.map((c) => {
          const content = T.renderToText(c.content);
          return c.collapsible ? `(${content})` : content;
        })
        .join(" | ");
    }
    return properties;
  };
}
