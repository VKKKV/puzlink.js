import type { LetterKind } from "../lib/letterDistribution.js";
import { LETTERS, letterKind } from "../lib/letterDistribution.js";
import { enumerate, interval, mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Metric } from "./index.js";

function equalWithDistanceTimes(letter: string, distance: number): Metric {
  return {
    metricName: T.Join(["equal", letter, "with distance", distance, "count"]),
    name: (times, strict) =>
      distance === 0
        ? T.Join([
            "has",
            !strict && "at least",
            times,
            "double",
            T.Slug(times, letter),
          ])
        : T.Join([
            "has",
            T.Slug(`${letter}${"?".repeat(distance)}${letter}`),
            times === 1 ? "as a substring" : "as a substring,",
            times > 1 && !strict && "at least",
            times > 1 && T.Times(times),
          ]),
    score: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === letter && slug[i + distance + 1] === letter;
      });
      return {
        score: starts.length,
        describe: (times) => {
          if (distance === 0) {
            return T.Row([
              T.Highlight(
                slug,
                starts.flatMap((i) => [i, i + 1]),
              ),
              ...starts.slice(0, times).map((i) => T.Indices(i)),
              ...starts.slice(times).map((i) => T.Collapsible(T.Indices(i))),
            ]);
          }
          if (times === 1) {
            const [i] = starts as [number];
            return T.Row([
              T.Highlight(slug, interval(i, i + distance + 1)),
              T.Indices(i),
              T.Slug(slug.slice(i + 1, i + distance + 1)),
            ]);
          }
          return T.Row([
            T.Highlight(
              slug,
              starts.flatMap((i) => [i, i + distance + 1]),
            ),
            ...starts
              .slice(0, times)
              .flatMap((i) => [
                T.Indices(i),
                T.Slug(slug.slice(i + 1, i + distance + 1)),
              ]),
            ...starts
              .slice(times)
              .flatMap((i) => [
                T.Collapsible(T.Indices(i)),
                T.Collapsible(T.Slug(slug.slice(i + 1, i + distance + 1))),
              ]),
          ]);
        },
      };
    },
  };
}

function equalAnyDistanceTimes(distance: number): Metric {
  return {
    metricName: T.Join(["equal with distance", distance, "count"]),
    name: (times, strict) =>
      distance === 0
        ? T.Join([
            "has",
            strict ? "exactly" : "at least",
            T.Count(times, "double letter", "double letters"),
          ])
        : T.Join([
            "has",
            !strict && "at least",
            T.Count(times, "pair", "pairs"),
            "of equal letters, separated by",
            T.Count(distance, "letter", "letters"),
          ]),
    score: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === slug[i + distance + 1];
      });
      return {
        score: starts.length,
        describe: (times) => {
          if (starts.length === 0) {
            return T.Row([T.Slug(slug)]);
          }
          if (distance === 0) {
            return T.Row([
              T.Highlight(
                slug,
                starts.flatMap((i) => [i, i + 1]),
              ),
              ...starts
                .slice(0, times)
                .flatMap((i) => [T.Slug(slug.slice(i, i + 1)), T.Indices(i)]),
              ...starts
                .slice(times)
                .flatMap((i) => [
                  T.Collapsible(T.Slug(slug.slice(i, i + 1))),
                  T.Collapsible(T.Indices(i)),
                ]),
            ]);
          }
          if (times === 1) {
            const [i] = starts as [number];
            return T.Row([
              T.Highlight(slug, interval(i, i + distance + 1)),
              T.Slug(slug.slice(i, i + 1)),
              T.Indices(i),
              T.Slug(slug.slice(i + 1, i + distance + 1)),
            ]);
          }
          return T.Row([
            T.Highlight(
              slug,
              starts.flatMap((i) => [i, i + distance + 1]),
            ),
            ...starts
              .slice(0, times)
              .map((i) => T.Slug(slug.slice(i, i + distance + 2))),
            ...starts
              .slice(times)
              .map((i) =>
                T.Collapsible(T.Slug(slug.slice(i, i + distance + 2))),
              ),
          ]);
        },
      };
    },
  };
}

const bigram = {
  alpha: {
    type: "alphabetical",
    check: (a, b) => a < b,
  },
  revAlpha: {
    type: "reverse alphabetical",
    check: (a, b) => a > b,
  },
  seq: {
    type: "sequential",
    check: (a, b) => a.charCodeAt(0) - b.charCodeAt(0) === -1,
  },
  revSeq: {
    type: "reverse sequential",
    check: (a, b) => a.charCodeAt(0) - b.charCodeAt(0) === 1,
  },
} as const satisfies Record<
  string,
  { type: string; check: (a: string, b: string) => boolean }
>;

function bigramOfTimes(bigram: {
  type: string;
  check: (a: string, b: string) => boolean;
}): Metric {
  return {
    metricName: T.Join([bigram.type, "bigram count"]),
    name: (times, strict) =>
      T.Join([
        "has",
        !strict && "at least",
        times,
        bigram.type,
        T.Inflect(times, "bigram", "bigrams"),
      ]),
    score: (slug) => {
      const starts = interval(0, slug.length - 2).filter((i) => {
        return bigram.check(slug[i]!, slug[i + 1]!);
      });
      return {
        score: starts.length,
        describe: (times) =>
          T.Row([
            T.Highlight(
              slug,
              starts.flatMap((i) => [i, i + 1]),
            ),
            ...starts
              .slice(0, times)
              .flatMap((i) => [T.Slug(slug.slice(i, i + 2)), T.Indices(i)]),
            ...starts
              .slice(times)
              .flatMap((i) => [
                T.Collapsible(T.Slug(slug.slice(i, i + 2))),
                T.Collapsible(T.Indices(i)),
              ]),
          ]),
      };
    },
  };
}

function consecutiveOfTimes(kind: LetterKind): Metric {
  return {
    metricName: T.Join(["consecutive", kind.one, "count"]),
    name: (times, strict) =>
      T.Join([
        "has",
        !strict && "at least",
        times,
        "consecutive",
        T.Inflect(times, kind.one, kind.other),
      ]),
    score: (slug) => {
      let bestStreak = 0;
      let bestStart = -1;
      let currentStreak = 0;
      for (const [i, letter] of enumerate(slug)) {
        if (kind.letters.includes(letter)) {
          currentStreak++;
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            bestStart = i - currentStreak + 1;
          }
        } else {
          currentStreak = 0;
        }
      }
      return {
        score: bestStreak,
        describe: () => {
          if (bestStreak === 0) {
            return T.Row([T.Slug(slug)]);
          }
          return T.Row([
            T.Highlight(slug, interval(bestStart, bestStart + bestStreak - 1)),
            T.Slug(slug.slice(bestStart, bestStart + bestStreak)),
            T.Indices(bestStart),
          ]);
        },
      };
    },
  };
}

/**
 * Metrics for letter sequences: things we can remark based on the relative
 * order of the letters/bigrams/trigrams within the slug.
 */
export function letterSequenceMetrics(): Metric[] {
  return [
    ...mapProduct(equalWithDistanceTimes, LETTERS, [0, 1, 2, 3]),
    ...mapProduct(equalAnyDistanceTimes, [0, 1, 2, 3]),
    ...mapProduct(bigramOfTimes, [
      bigram.alpha,
      bigram.revAlpha,
      bigram.seq,
      bigram.revSeq,
    ]),
    ...mapProduct(consecutiveOfTimes, [letterKind.vowel, letterKind.consonant]),
  ];
}
