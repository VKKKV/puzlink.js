import { CONSONANTS, LETTERS, VOWELS } from "../lib/letterDistribution.js";
import { interval, mapProduct, printIndexSlug } from "../lib/util.js";
import type { Feature } from "./index.js";

// TODO: make the printed property names better here; some of these should be
// more than just the raw index. evaluate after looking at integration tests

function equalWithDistanceTimes(
  letter: string,
  distance: number,
  times: number,
): Feature {
  return {
    name: `has ${letter} with ${distance.toString()} letters between, ${times.toString()} times`,
    property: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === letter && slug[i + distance + 1] === letter;
      });
      if (starts.length !== times) {
        return null;
      }
      return printIndexSlug(
        slug,
        starts.flatMap((i) => [i, i + distance + 1]),
      );
    },
  };
}

function unequalWithDistance(a: string, b: string, distance: number): Feature {
  return {
    name: `has ${a} and ${b} with ${distance.toString()} letters between`,
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
      return printIndexSlug(
        slug,
        starts.flatMap((i) => [i, i + distance + 1]),
      );
    },
  };
}

function equalAnyDistanceTimes(distance: number, times: number): Feature {
  return {
    name: `has equal letters with ${distance.toString()} letters between, ${times.toString()} times`,
    property: (slug) => {
      const starts = interval(0, slug.length - distance - 1).filter((i) => {
        return slug[i] === slug[i + distance + 1];
      });
      if (starts.length !== times) {
        return null;
      }
      return printIndexSlug(
        slug,
        starts.flatMap((i) => [i, i + distance + 1]),
      );
    },
  };
}

function bigramOfTimes(
  bigram: { type: string; check: (a: string, b: string) => boolean },
  times: number,
  strict: boolean,
): Feature {
  return {
    name: strict
      ? `has ${times.toString()} ${bigram.type} bigrams`
      : `has at least ${times.toString()} ${bigram.type} bigrams`,
    property: (slug) => {
      const starts = interval(0, slug.length - 2).filter((i) => {
        return bigram.check(slug[i]!, slug[i + 1]!);
      });
      if (strict ? starts.length !== times : starts.length < times) {
        return null;
      }
      return printIndexSlug(
        slug,
        starts.flatMap((i) => [i, i + 1]),
      );
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

function consecutiveOfTimes(
  kind: { name: string; letters: string },
  times: number,
  strict: boolean,
): Feature {
  return {
    name: strict
      ? `has ${times.toString()} ${kind.name} in a row`
      : `has at least ${times.toString()} ${kind.name} in a row`,
    property: (slug) => {
      let bestStreak = 0;
      let bestStart = -1;
      let currentStreak = 0;
      for (let i = 0; i < slug.length; i++) {
        if (kind.letters.includes(slug[i]!)) {
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
      return printIndexSlug(
        slug,
        interval(bestStart, bestStart + bestStreak - 1),
      );
    },
  };
}

// TODO: does this belong somewhere else?
function bookendsOf(length: number): Feature {
  return {
    name: `starts and ends with the same ${length.toString()} letters`,
    property: (slug) => {
      if (slug.length < length * 2) {
        return null;
      }
      if (slug.slice(0, length) !== slug.slice(-length)) {
        return null;
      }
      return printIndexSlug(slug, [
        ...interval(0, length - 1),
        ...interval(slug.length - length, slug.length - 1),
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
    ...mapProduct(equalAnyDistanceTimes, [0, 1, 2, 3], [1, 2, 3]),
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
      [
        { name: "vowels", letters: VOWELS },
        { name: "consonants", letters: CONSONANTS },
      ],
      interval(2, 5),
      [true, false],
    ),
    ...mapProduct(bookendsOf, [1, 2, 3]),
  ];
}
