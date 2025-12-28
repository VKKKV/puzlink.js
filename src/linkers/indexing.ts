import { LetterIndices } from "../lib/letterIndices.js";
import { getArithmeticSequenceInfo, interval } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import * as T from "../templating/index.js";
import type { Linker, PartialLink } from "./index.js";

type Indexed = [slug: string, index: number, letter: string];

function indexedRows(indexed: Indexed[]): T.Row[] {
  return indexed.map(([slug, index, letter]) =>
    T.Row([T.Highlight(slug, index), T.Indices(index), T.Slug(letter)]),
  );
}

function* indicesFor(
  slugs: string[],
  ordered?: boolean,
): Generator<{
  indexName: T.Inline;
  indexed: Indexed[];
}> {
  const checkIndices = (
    indexed: (readonly [string, number, string | undefined])[],
  ): indexed is Indexed[] => {
    return indexed.every(([, , c]) => typeof c === "string");
  };

  for (const i of interval(-10, 9)) {
    const indexed = slugs.map((slug) => [slug, i, slug.at(i)] as const);
    if (checkIndices(indexed)) {
      yield {
        indexName: T.Join([T.Ordinal(i), T.Text("letters")]),
        indexed,
      };
    }
  }
  if (ordered) {
    const indexed = slugs.map((slug, i) => [slug, i, slug.at(i)] as const);
    if (checkIndices(indexed)) {
      yield {
        indexName: T.Text("diagonal letters"),
        indexed,
      };
    }
  }
  if (ordered && slugs.every((slug) => slug.length >= slugs.length)) {
    yield {
      indexName: T.Text("antidiagonal letters"),
      indexed: slugs.map(
        (slug, i) =>
          [slug, slugs.length - i - 1, slug.at(slugs.length - i - 1)!] as const,
      ),
    };
  }
}

type Props = {
  /** "the 2nd letters", "the diagonal", "the antidiagonal" */
  indexName: T.Inline;
  /** List of (slug, index, indexed letter). */
  indexed: [slug: string, index: number, letter: string][];
  slugs: string[];
  wordlist: Wordlist;
};

function allEqual({ indexName, indexed, wordlist }: Props): PartialLink | null {
  if (new Set(indexed.map(([, , c]) => c)).size !== 1) {
    return null;
  }
  return {
    name: T.Join([indexName, T.Text("are equal")]),
    logProb: wordlist.letters.probEqual(indexed.length),
    description: T.Table(indexedRows(indexed)),
  };
}

function almostEqual({
  indexName,
  indexed,
  wordlist,
}: Props): PartialLink | null {
  const indexedSet = new Set(indexed.map(([, , c]) => c));
  if (indexedSet.size !== 2) {
    return null;
  }
  let [a, b] = Array.from(indexedSet) as [string, string];
  let aIndexed = indexed.filter(([, , c]) => c === a);
  let bIndexed = indexed.filter(([, , c]) => c === b);
  if (aIndexed.length > bIndexed.length) {
    [aIndexed, bIndexed] = [bIndexed, aIndexed];
    [a, b] = [b, a];
  }
  if (aIndexed.length !== 1) {
    return null;
  }
  return {
    name: T.Join([indexName, T.Text("are almost equal")]),
    logProb: wordlist.letters.probAlmostEqual(indexed.length),
    description: T.Sortable([
      ...indexedRows(aIndexed),
      ...indexedRows(bIndexed),
    ]),
  };
}

function onlyTwo({ indexName, indexed, wordlist }: Props): PartialLink | null {
  const indexedSet = new Set(indexed.map(([, , c]) => c));
  if (indexedSet.size !== 2) {
    return null;
  }
  const [a, b] = Array.from(indexedSet) as [string, string];
  const aIndexed = indexed.filter(([, , c]) => c === a);
  const bIndexed = indexed.filter(([, , c]) => c === b);
  return {
    name: T.Join([indexName, T.Text("have two distinct values")]),
    logProb: wordlist.letters.probTwoDistinct(indexed.length),
    description: T.Sortable([
      ...indexedRows(aIndexed),
      ...indexedRows(bIndexed),
    ]),
  };
}

function word({ indexName, indexed, wordlist }: Props): PartialLink | null {
  // TODO: isPhrase?
  if (!wordlist.isWord(indexed.map(([, , c]) => c).join(""))) {
    return null;
  }
  return {
    name: T.Join([indexName, T.Text("form a word")]),
    logProb: wordlist.letters.probWord(indexed.length),
    description: T.Table(indexedRows(indexed)),
  };
}

function anagram({ indexName, indexed, wordlist }: Props): PartialLink | null {
  const anagrams = wordlist.anagrams(indexed.map(([, , c]) => c).join(""));
  if (anagrams.length === 0) {
    return null;
  }
  const [best] = anagrams as [string, ...string[]];
  const sorted = indexed.sort(
    ([, , a], [, , b]) => best.indexOf(a) - best.indexOf(b),
  );
  return {
    name: T.Join([indexName, T.Text("anagram to a word")]),
    logProb: wordlist.letters.probAnagram(indexed.length),
    description: T.Sortable([
      ...indexedRows(sorted),
      anagrams.length > 1 &&
        T.Row([
          T.Collapsible(
            T.Join(["alt:", ...anagrams.slice(1).map((a) => T.Slug(a))]),
          ),
        ]),
    ]),
  };
}

function consecutive({
  indexName,
  indexed,
  wordlist,
}: Props): PartialLink | null {
  const sorted = indexed.sort(([, , a], [, , b]) => a.localeCompare(b));
  if (
    getArithmeticSequenceInfo(sorted.map(([, , c]) => c.charCodeAt(0)))
      ?.step !== 1
  ) {
    return null;
  }
  return {
    name: T.Join([indexName, T.Text("are consecutive")]),
    logProb: wordlist.letters.probConsecutive(indexed.length),
    description: T.Sortable(indexedRows(sorted)),
  };
}

function paired({ indexName, indexed, wordlist }: Props): PartialLink | null {
  const byIndexed = LetterIndices.from(indexed.map(([, , c]) => c).join(""));
  const countSet = byIndexed.countSet();
  if (countSet.size !== 1 || Array.from(countSet)[0] !== 2) {
    return null;
  }
  const sorted = indexed.sort(([, , a], [, , b]) => a.localeCompare(b));
  return {
    name: T.Join([indexName, T.Text("can be paired")]),
    logProb: wordlist.letters.probPaired(indexed.length),
    description: T.Table(
      sorted.flatMap(([slug, index, letter], i) => {
        if (i % 2 === 1) {
          return [];
        }
        const [otherSlug, otherIndex] = sorted[i + 1]!;
        return [
          T.Row([
            T.Slug(slug),
            T.Indices(index),
            T.Slug(otherSlug),
            T.Indices(otherIndex),
            T.Slug(letter),
          ]),
        ];
      }),
    ),
  };
}

/** Links of the form "the nth indices are..." */
export function indexingLinker(wordlist: Wordlist): Linker {
  return {
    name: T.Text("indexing linker"),
    eval: (slugs, { ordered }) => {
      const indices = Array.from(indicesFor(slugs, ordered));
      return indices.flatMap(({ indexName, indexed }) => {
        const props = {
          indexName,
          indexed,
          slugs,
          wordlist,
        };
        return [
          allEqual(props),
          almostEqual(props),
          onlyTwo(props),
          ordered ? word(props) : null,
          anagram(props),
          consecutive(props),
          paired(props),
        ].filter((l): l is PartialLink => l !== null);
      });
    },
  };
}
