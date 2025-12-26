import { LetterIndices } from "../lib/letterIndices.js";
import { getArithmeticSequenceInfo, interval, ordinal } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker, PartialLink } from "./index.js";

type Indexed = {
  /** "the 2nd letters", "the diagonal", "the antidiagonal" */
  indexText: string;
  /** Result of indexing the kind of thing in `indexText`. */
  indexed: string[];
};

function* indicesFor(slugs: string[], ordered?: boolean): Generator<Indexed> {
  for (const i of interval(-10, 9)) {
    const indexText =
      i >= 0 ? `${ordinal(i + 1)} letters` : `${ordinal(i)} letters`;
    const indexed = slugs.map((slug) => slug.at(i) ?? null);
    if (indexed.every((c) => c !== null)) {
      yield { indexText, indexed };
    }
  }
  if (ordered) {
    const indexed = slugs.map((slug, i) => slug.at(i) ?? null);
    if (indexed.every((c) => c !== null)) {
      yield { indexText: "diagonal", indexed };
    }
  }
  if (ordered && slugs.every((slug) => slug.length >= slugs.length)) {
    yield {
      indexText: "antidiagonal",
      indexed: slugs.map((slug, i) => slug.at(slugs.length - i - 1)!),
    };
  }
}

type Props = Indexed & {
  slugs: string[];
  wordlist: Wordlist;
};

function allEqual({ indexText, indexed, wordlist }: Props): PartialLink | null {
  if (new Set(indexed).size !== 1) {
    return null;
  }
  return {
    name: `${indexText} are equal`,
    logProb: wordlist.letters.probEqual(indexed.length),
    description: [`${indexText} are ${indexed[0]!}`],
  };
}

function almostEqual({
  indexText,
  indexed,
  slugs,
  wordlist,
}: Props): PartialLink | null {
  const indexedSet = new Set(indexed);
  if (indexedSet.size !== 2) {
    return null;
  }
  let [a, b] = indexedSet;
  let aSlugIndices = indexed.flatMap((w, i) => (w === a ? [i] : []));
  let bSlugIndices = indexed.flatMap((w, i) => (w === b ? [i] : []));
  if (aSlugIndices.length > bSlugIndices.length) {
    [aSlugIndices, bSlugIndices] = [bSlugIndices, aSlugIndices];
    [a, b] = [b, a];
  }
  if (aSlugIndices.length !== 1) {
    return null;
  }
  const [aSlugIndex] = aSlugIndices as [number];
  return {
    name: `${indexText} are almost equal`,
    logProb: wordlist.letters.probAlmostEqual(indexed.length),
    description: [
      `'${slugs[aSlugIndex]!}' ${indexText} is '${a!}'`,
      `others ${indexText} are '${b!}'`,
    ],
  };
}

function onlyTwo({
  indexText,
  indexed,
  slugs,
  wordlist,
}: Props): PartialLink | null {
  const indexedSet = new Set(indexed);
  if (indexedSet.size !== 2) {
    return null;
  }
  const [a, b] = indexedSet;
  const aSlugIndices = indexed.flatMap((w, i) => (w === a ? [i] : []));
  const bSlugIndices = indexed.flatMap((w, i) => (w === b ? [i] : []));
  return {
    name: `${indexText} have only two values`,
    logProb: wordlist.letters.probTwoDistinct(indexed.length),
    description: [
      `${aSlugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${a!}'`,
      `${bSlugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${b!}'`,
    ],
  };
}

function word({ indexText, indexed, wordlist }: Props): PartialLink | null {
  // TODO: isPhrase?
  if (!wordlist.isWord(indexed.join(""))) {
    return null;
  }
  return {
    name: `${indexText} are a word`,
    logProb: wordlist.letters.probWord(indexed.length),
    description: [`${indexText} are '${indexed.join("")}'`],
  };
}

function anagram({ indexText, indexed, wordlist }: Props): PartialLink | null {
  const anagrams = wordlist.anagrams(indexed.join(""));
  if (anagrams.length === 0) {
    return null;
  }
  return {
    name: `${indexText} anagram to a word`,
    logProb: wordlist.letters.probAnagram(indexed.length),
    description: [`${indexText} anagram to ${anagrams.join(", ")}`],
  };
}

function consecutive({
  indexText,
  indexed,
  wordlist,
}: Props): PartialLink | null {
  const sorted = indexed
    .slice()
    .map((w) => w.charCodeAt(0))
    .sort((a, b) => a - b);
  if (getArithmeticSequenceInfo(sorted)?.step !== 1) {
    return null;
  }
  return {
    name: `${indexText} are consecutive`,
    logProb: wordlist.letters.probConsecutive(indexed.length),
    description: [`${indexText} are ${indexed.join(", ")}`],
  };
}

function paired({
  indexText,
  indexed,
  slugs,
  wordlist,
}: Props): PartialLink | null {
  const byIndexed = LetterIndices.from(indexed.join(""));
  const countSet = byIndexed.countSet();
  if (countSet.size !== 1 || Array.from(countSet)[0] !== 2) {
    return null;
  }
  return {
    name: `${indexText} can be paired`,
    logProb: wordlist.letters.probPaired(indexed.length),
    description: Array.from(byIndexed.entries(), ([letter, slugIndices]) => {
      return `${slugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${letter}'`;
    }),
  };
}

/** Links of the form "the nth indices are..." */
export function indexingLinker(wordlist: Wordlist): Linker {
  return {
    name: "indexing linker",
    eval: (slugs, ordered) => {
      const indices = Array.from(indicesFor(slugs, ordered));
      return indices.flatMap(({ indexText, indexed }) => {
        const props = {
          indexText,
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
