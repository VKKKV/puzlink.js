import { getArithmeticSequenceInfo } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Feature } from "./index.js";

function equalCounts(): Feature {
  return {
    name: T.Text("has equal letter counts"),
    property: (slug, { letterIndices }) => {
      const countSet = letterIndices.countSet();
      if (countSet.size !== 1) {
        return null;
      }
      return T.Row([T.Slug(slug), T.Text(Array.from(countSet)[0]!)]);
    },
  };
}

function twoCounts(): Feature {
  return {
    name: T.Text("has one of two letter counts"),
    property: (slug, { letterIndices }) => {
      const countSet = letterIndices.countSet();
      if (countSet.size !== 2) {
        return null;
      }
      let [a, b] = Array.from(countSet) as [number, number];
      let aLetters = letterIndices.filterKeys(
        (_, indices) => indices.length === a,
      );
      let bLetters = letterIndices.filterKeys(
        (_, indices) => indices.length === b,
      );
      if (a > b) {
        [a, b] = [b, a];
        [aLetters, bLetters] = [bLetters, aLetters];
      }
      return T.Row([
        T.Slug(slug),
        T.Text(a),
        T.Slug(aLetters.sort().join("")),
        T.Text(b),
        T.Slug(bLetters.sort().join("")),
      ]);
    },
  };
}

function arithmeticSequenceCounts(): Feature {
  return {
    name: T.Text("has letter counts in arithmetic sequence"),
    property: (slug, { letterIndices }) => {
      const sortedCounts = Array.from(letterIndices.counts()).sort(
        ([, a], [, b]) => a - b,
      );
      if (!getArithmeticSequenceInfo(sortedCounts.map(([, c]) => c))) {
        return null;
      }
      const [first, ...rest] = sortedCounts;
      return T.Row([
        T.Slug(slug),
        T.Text(first![1]),
        T.Slug(first![0]),
        ...rest.flatMap(([l, c]) => [
          T.Collapsible(T.Text(c)),
          T.Collapsible(T.Slug(l)),
        ]),
      ]);
    },
  };
}

/**
 * Features for letter counts: things we can remark solely based on the
 * histogram of letters/bigrams/trigrams in the slug.
 */
export function letterCountFeatures(): Feature[] {
  return [equalCounts(), twoCounts(), arithmeticSequenceCounts()];
}
