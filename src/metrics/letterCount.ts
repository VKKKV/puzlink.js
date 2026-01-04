import { DefaultMap } from "../lib/defaultMap.js";
import type { LetterKind } from "../lib/letterDistribution.js";
import { LETTERS, letterKind } from "../lib/letterDistribution.js";
import { interval, mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Metric } from "./index.js";

function withTimes(letter: string): Metric {
  return {
    metricName: T.Join([letter, "count"]),
    maxNonStrict: 5,
    name: (times, strict) =>
      T.Join([
        strict ? "has exactly" : "has at least",
        T.CountSlug(times, letter),
      ]),
    score: (slug, { letterIndices }) => {
      const starts = letterIndices.get(letter);
      return {
        score: starts.length,
        describe: (times) =>
          T.Row([
            T.Highlight(slug, starts),
            ...starts.slice(0, times).map((i) => T.Indices(i)),
            ...starts.slice(times).map((i) => T.Collapsible(T.Indices(i))),
          ]),
      };
    },
  };
}

function uniqueOf(kind: LetterKind): Metric {
  return {
    metricName: T.Join(["unique", kind.one, "count"]),
    maxNonStrict: 5,
    name: (times, strict) =>
      T.Join([
        "has",
        !strict && "at least",
        times,
        "unique",
        T.Inflect(times, kind.one, kind.other),
      ]),
    score: (slug, { letterIndices }) => {
      const unique = letterIndices.filterKeys((letter) =>
        kind.letters.includes(letter),
      );
      return {
        score: unique.length,
        describe: (times) => {
          if (times <= 0) {
            return T.Row([T.Slug(slug)]);
          }
          if (times === 1) {
            const [letter] = unique as [string];
            const indices = letterIndices.get(letter);
            return T.Row([
              T.Highlight(slug, indices),
              T.Slug(letter),
              ...indices.map((i) => T.Collapsible(T.Indices(i))),
            ]);
          }
          if (times === 2) {
            const [a, b] = unique as [string, string];
            const aIndices = letterIndices.get(a);
            const bIndices = letterIndices.get(b);
            return T.Row([
              T.Highlight(slug, [...aIndices, ...bIndices]),
              T.Slug(a),
              T.Indices(aIndices),
              T.Slug(b),
              T.Indices(bIndices),
            ]);
          }
          const indices = Array.from(slug).flatMap((letter, i) =>
            kind.letters.includes(letter) ? [i] : [],
          );
          const letters = Array.from(slug)
            .map((letter) => (kind.letters.includes(letter) ? letter : ""))
            .join("");
          return T.Row([
            T.Highlight(slug, indices),
            T.Slug(unique.join("")),
            T.Slug(letters),
          ]);
        },
      };
    },
  };
}

function nGramRepeatsTimes(
  kind: { one: string; other: string; n: number },
  repeats: number,
  repeatsStrict: boolean,
): Metric {
  return {
    metricName: T.Join([
      "count of",
      kind.other,
      "that repeat",
      repeatsStrict ? "exactly" : "at least",
      T.Times(repeats),
    ]),
    maxNonStrict: 5,
    name: (count, strict) =>
      T.Join([
        strict ? "has exactly" : "has at least",
        T.Count(count, `${kind.one} that appears`, `${kind.other} that appear`),
        !repeatsStrict && "at least",
        T.Times(repeats),
      ]),
    score: (slug) => {
      const nGramToIndices = new DefaultMap<string, number[]>(() => []);
      for (const i of interval(0, slug.length - kind.n + 1)) {
        const nGram = slug.slice(i, i + kind.n);
        nGramToIndices.get(nGram).push(i);
      }
      const nGrams = Array.from(nGramToIndices.entries()).filter(
        ([, indices]) =>
          repeatsStrict
            ? indices.length === repeats
            : indices.length >= repeats,
      );
      return {
        score: nGrams.length,
        describe: () => {
          if (nGrams.length === 0) {
            return T.Row([T.Slug(slug)]);
          }
          if (nGrams.length === 1) {
            const [nGram, indices] = nGrams[0]!;
            return T.Row([
              T.Highlight(slug, indices),
              T.Slug(nGram),
              ...indices.map((i) => T.Collapsible(T.Indices(i))),
            ]);
          }
          return T.Row([
            T.Highlight(
              slug,
              nGrams.flatMap(([, indices]) => indices),
            ),
            ...nGrams.map(([nGram]) => T.Slug(nGram)),
          ]);
        },
      };
    },
  };
}

function repeatedOf(kind: LetterKind): Metric {
  return {
    metricName: T.Join(["repeated", kind.one, "count"]),
    maxNonStrict: 5,
    name: (count, strict) =>
      T.Join([
        strict ? "has exactly" : "has at least",
        T.Count(count, kind.one, kind.other),
        T.Inflect(count, "that appears", "that appear"),
        "at least twice",
      ]),
    score: (slug, { letterIndices }) => {
      const repeated = letterIndices.filterKeys(
        (letter, indices) =>
          kind.letters.includes(letter) && indices.length >= 2,
      );
      return {
        score: repeated.length,
        describe: () => {
          if (repeated.length === 0) {
            return T.Row([T.Slug(slug)]);
          }
          const [first, ...rest] = repeated as [string, ...string[]];
          return T.Row([
            T.Highlight(slug, letterIndices.get(first)),
            T.Slug(first),
            T.Indices(letterIndices.get(first)),
            ...rest.flatMap((letter) => [
              T.Collapsible(T.Slug(letter)),
              T.Collapsible(T.Indices(letterIndices.get(letter))),
            ]),
          ]);
        },
      };
    },
  };
}

/**
 * Metrics for letter counts: metrics solely based on the histogram of
 * letters/bigrams/trigrams in the slug.
 */
export function letterCountMetrics(): Metric[] {
  return [
    ...mapProduct(withTimes, LETTERS),
    ...mapProduct(uniqueOf, [
      letterKind.vowel,
      letterKind.consonant,
      letterKind.letter,
    ]),
    ...mapProduct(
      nGramRepeatsTimes,
      [
        { n: 1, one: "letter", other: "letters" },
        { n: 2, one: "bigram", other: "bigrams" },
        { n: 3, one: "trigram", other: "trigrams" },
      ],
      interval(2, 4),
      [true, false],
    ),
    ...mapProduct(repeatedOf, [letterKind.vowel, letterKind.consonant]),
  ];
}
