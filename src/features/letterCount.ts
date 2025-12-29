import type { LetterKind } from "../lib/letterDistribution.js";
import { LETTERS, letterKind } from "../lib/letterDistribution.js";
import {
  getArithmeticSequenceInfo,
  interval,
  mapProduct,
} from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Feature } from "./index.js";

function withTimes(letter: string, times: number, strict: boolean): Feature {
  return {
    name: T.Join([
      strict ? "has exactly" : "has at least",
      T.CountSlug(times, letter),
    ]),
    property: (slug, { letterIndices }) => {
      const starts = letterIndices.get(letter);
      if (strict ? starts.length !== times : starts.length < times) {
        return null;
      }
      return T.Row([
        T.Highlight(slug, starts),
        ...starts.slice(0, times).map((i) => T.Indices(i)),
        ...starts.slice(times).map((i) => T.Collapsible(T.Indices(i))),
      ]);
    },
  };
}

function uniqueOf(kind: LetterKind, times: number): Feature {
  return {
    name: T.Join([
      "has",
      times === 1 ? "a" : times,
      "unique",
      T.Inflect(times, kind.one, kind.other),
    ]),
    property: (slug, { letterIndices }) => {
      const unique = letterIndices.filterKeys((letter) =>
        kind.letters.includes(letter),
      );
      if (unique.length !== times) {
        return null;
      }
      if (times === 1) {
        const [letter] = unique as [string];
        const indices = letterIndices.get(letter);
        return T.Row([
          T.Highlight(slug, indices),
          T.Slug(letter),
          ...letterIndices.get(letter).map((i) => T.Collapsible(T.Indices(i))),
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
}

function nGramRepeatsTimes(
  kind: { one: string; other: string; n: number },
  count: number,
  repeats: number,
  strict: boolean,
): Feature {
  return {
    name:
      count === 1
        ? T.Join([
            "has a",
            kind.one,
            "that appears",
            !strict && "at least",
            T.Times(repeats),
          ])
        : T.Join([
            "has",
            count,
            `${kind.other},`,
            "each appearing",
            !strict && "at least",
            T.Times(repeats),
          ]),
    property: (slug) => {
      const nGramToIndices = new Map<string, number[]>();
      for (const i of interval(0, slug.length - kind.n + 1)) {
        const nGram = slug.slice(i, i + kind.n);
        if (!nGramToIndices.has(nGram)) {
          nGramToIndices.set(nGram, []);
        }
        nGramToIndices.get(nGram)!.push(i);
      }
      const nGrams = Array.from(nGramToIndices.entries()).filter(
        ([, indices]) =>
          strict ? indices.length === repeats : indices.length >= repeats,
      );
      if (nGrams.length !== count) {
        return null;
      }
      if (count === 1) {
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
}

function repeatedOf(kind: LetterKind): Feature {
  return {
    name: T.Join(["has a", kind.one, "that appears at least twice"]),
    property: (slug, { letterIndices }) => {
      const repeated = letterIndices.filterKeys(
        (letter, indices) =>
          kind.letters.includes(letter) && indices.length >= 2,
      );
      if (repeated.length === 0) {
        return null;
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
}

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
  return [
    ...mapProduct(withTimes, LETTERS, interval(1, 5), [true, false]),
    ...mapProduct(uniqueOf, [letterKind.vowel], interval(0, 5)),
    ...mapProduct(uniqueOf, [letterKind.consonant], interval(1, 15)),
    ...mapProduct(uniqueOf, [letterKind.letter], interval(1, 26)),
    ...mapProduct(
      nGramRepeatsTimes,
      [
        { n: 1, one: "letter", other: "letters" },
        { n: 2, one: "bigram", other: "bigrams" },
        { n: 3, one: "trigram", other: "trigrams" },
      ],
      interval(1, 5),
      interval(2, 4),
      [true, false],
    ),
    ...mapProduct(repeatedOf, [letterKind.vowel, letterKind.consonant]),
    equalCounts(),
    twoCounts(),
    arithmeticSequenceCounts(),
  ];
}
