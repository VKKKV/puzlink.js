import type { LetterKind } from "../lib/letterDistribution.js";
import { LETTERS, letterKind } from "../lib/letterDistribution.js";
import { enumerate, interval, mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Feature } from "./index.js";

function equalWithDistanceTimes(
  letter: string,
  distance: number,
  times: number,
): Feature {
  return {
    name:
      distance === 0
        ? T.Join([
            "has",
            times === 1 ? "a" : times,
            "double",
            T.Slug(times, letter),
          ])
        : T.Join([
            "has",
            T.Slug(`${letter}${"?".repeat(distance)}${letter}`),
            ...(times === 1
              ? ["as a substring"]
              : ["as a substring,", T.Times(times)]),
          ]),
    property: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === letter && slug[i + distance + 1] === letter;
      });
      if (starts.length !== times) {
        return null;
      }
      if (distance === 0) {
        return T.Row([
          T.Highlight(
            slug,
            starts.flatMap((i) => [i, i + 1]),
          ),
          ...starts.map((i) => T.Indices(i)),
        ]);
      }
      if (times === 1) {
        const [index] = starts as [number];
        return T.Row([
          T.Highlight(slug, interval(index, index + distance + 1)),
          T.Indices(index),
          T.Slug(slug.slice(index + 1, index + distance + 1)),
        ]);
      }
      return T.Row([
        T.Highlight(
          slug,
          starts.flatMap((i) => [i, i + distance + 1]),
        ),
        ...starts.flatMap((i) => [
          T.Indices(i),
          T.Slug(slug.slice(i + 1, i + distance + 1)),
        ]),
      ]);
    },
  };
}

function unequalWithDistance(a: string, b: string, distance: number): Feature {
  return {
    name: T.Join([
      "has",
      T.Slug(`${a}${"?".repeat(distance)}${b}`),
      "as a substring",
    ]),
    property: (slug) => {
      if (a === b) {
        return null;
      }
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === a && slug[i + distance + 1] === b;
      });
      if (starts.length === 0) {
        return null;
      }
      if (distance === 0) {
        return T.Row([
          T.Highlight(
            slug,
            starts.flatMap((i) => [i, i + 1]),
          ),
          ...starts.map((i) => T.Indices(i)),
        ]);
      }
      if (starts.length === 1) {
        const [index] = starts as [number];
        return T.Row([
          T.Highlight(slug, interval(index, index + distance + 1)),
          T.Indices(index),
          T.Slug(slug.slice(index + 1, index + distance + 1)),
        ]);
      }
      return T.Row([
        T.Highlight(
          slug,
          starts.flatMap((i) => [i, i + distance + 1]),
        ),
        ...starts.flatMap((i) => [
          T.Indices(i),
          T.Slug(slug.slice(i + 1, i + distance + 1)),
        ]),
      ]);
    },
  };
}

function equalAnyDistanceTimes(
  distance: number,
  times: number,
  strict: boolean,
): Feature {
  return {
    name:
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
    property: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === slug[i + distance + 1];
      });
      if (strict ? starts.length !== times : starts.length < times) {
        return null;
      }
      if (distance === 0) {
        const [first, ...rest] = starts as [number, ...number[]];
        return T.Row([
          T.Highlight(
            slug,
            starts.flatMap((i) => [i, i + 1]),
          ),
          T.Slug(slug.slice(first, first + 1)),
          T.Indices(first),
          ...rest.flatMap((i) => [
            T.Collapsible(T.Slug(slug.slice(i, i + 1))),
            T.Collapsible(T.Indices(i)),
          ]),
        ]);
      }
      if (times === 1) {
        const [index] = starts as [number];
        return T.Row([
          T.Highlight(slug, interval(index, index + distance + 1)),
          T.Slug(slug.slice(index, index + 1)),
          T.Indices(index),
          T.Slug(slug.slice(index + 1, index + distance + 1)),
        ]);
      }
      const [first, ...rest] = starts as [number, ...number[]];
      return T.Row([
        T.Highlight(
          slug,
          starts.flatMap((i) => [i, i + distance + 1]),
        ),
        T.Slug(slug.slice(first, first + distance + 2)),
        ...rest.flatMap((i) => [
          T.Collapsible(T.Slug(slug.slice(i, i + distance + 2))),
        ]),
      ]);
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

function bigramOfTimes(
  bigram: { type: string; check: (a: string, b: string) => boolean },
  times: number,
  strict: boolean,
): Feature {
  return {
    name: T.Join([
      "has",
      !strict && "at least",
      times,
      bigram.type,
      T.Inflect(times, "bigram", "bigrams"),
    ]),
    property: (slug) => {
      const starts = interval(0, slug.length - 2).filter((i) => {
        return bigram.check(slug[i]!, slug[i + 1]!);
      });
      if (strict ? starts.length !== times : starts.length < times) {
        return null;
      }
      return T.Row([
        T.Highlight(
          slug,
          starts.flatMap((i) => [i, i + 1]),
        ),
        ...starts.flatMap((i) => [T.Slug(slug.slice(i, i + 2)), T.Indices(i)]),
      ]);
    },
  };
}

function consecutiveOfTimes(
  kind: LetterKind,
  times: number,
  strict: boolean,
): Feature {
  return {
    name: T.Join([
      "has",
      !strict && "at least",
      times,
      "consecutive",
      T.Inflect(times, kind.one, kind.other),
    ]),
    property: (slug) => {
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
      if (strict ? bestStreak !== times : bestStreak < times) {
        return null;
      }
      return T.Row([
        T.Highlight(slug, interval(bestStart, bestStart + bestStreak - 1)),
        T.Slug(slug.slice(bestStart, bestStart + bestStreak - 1)),
        T.Indices(bestStart),
      ]);
    },
  };
}

// TODO: does this belong somewhere else?
function bookendsOf(length: number): Feature {
  return {
    name: T.Join([
      "starts and ends with the same",
      T.Count(length, "letter", "letters"),
    ]),
    property: (slug) => {
      if (slug.length < length * 2) {
        return null;
      }
      if (slug.slice(0, length) !== slug.slice(-length)) {
        return null;
      }
      return T.Row([
        T.Highlight(slug, [
          ...interval(0, length - 1),
          ...interval(slug.length - length, slug.length - 1),
        ]),
        T.Slug(slug.slice(0, length)),
      ]);
    },
  };
}

/**
 * Features for letter sequences: things we can remark based on the relative
 * order of the letters/bigrams/trigrams within the slug.
 */
export function letterSequenceFeatures(): Feature[] {
  return [
    ...mapProduct(equalWithDistanceTimes, LETTERS, [0, 1, 2, 3], [1]),
    ...mapProduct(equalWithDistanceTimes, LETTERS, [0, 1], [2, 3]),
    ...mapProduct(unequalWithDistance, LETTERS, LETTERS, [0, 1]),
    ...mapProduct(
      equalAnyDistanceTimes,
      [0, 1, 2, 3],
      [1, 2, 3],
      [true, false],
    ),
    ...mapProduct(
      bigramOfTimes,
      [bigram.alpha, bigram.revAlpha],
      interval(1, 10),
      [true, false],
    ),
    ...mapProduct(bigramOfTimes, [bigram.seq, bigram.revSeq], interval(1, 5), [
      true,
      false,
    ]),
    ...mapProduct(
      bigramOfTimes,
      [bigram.alpha, bigram.revAlpha, bigram.seq, bigram.revSeq],
      [0],
      [true],
    ),
    ...mapProduct(
      consecutiveOfTimes,
      [letterKind.vowel, letterKind.consonant],
      interval(2, 5),
      [true, false],
    ),
    ...mapProduct(bookendsOf, [1, 2, 3]),
  ];
}
