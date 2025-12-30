import { LETTERS } from "../lib/letterDistribution.js";
import { mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import { defineMetric } from "./index.js";

function withTimes(letter: string) {
  return defineMetric(1, {
    metricName: `${letter} count`,
    name: ([times], [strict]) =>
      T.Join([
        strict ? "has exactly" : "has at least",
        T.CountSlug(times, letter),
      ]),
    score: (slug, { letterIndices }) => {
      const starts = letterIndices.get(letter);
      return {
        score: [starts.length],
        describe: ([times]) =>
          T.Row([
            T.Highlight(slug, starts),
            ...starts.slice(0, times).map((i) => T.Indices(i)),
            ...starts.slice(times).map((i) => T.Collapsible(T.Indices(i))),
          ]),
      };
    },
  });
}

/**
 * Metrics for letter counts: metrics solely based on the histogram of
 * letters/bigrams/trigrams in the slug.
 */
export function letterCountMetrics() {
  return [...mapProduct(withTimes, LETTERS)];
}
