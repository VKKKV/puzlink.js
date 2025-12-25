import type { LetterDistribution } from "../lib/letterDistribution.js";
import { LetterIndices } from "../lib/letterIndices.js";
import { getArithmeticSequenceInfo, interval, ordinal } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker, PartialLink } from "./index.js";

type Props = {
  distribution: LetterDistribution;
  indexText: string;
  indexed: string[];
  slugs: string[];
  wordlist: Wordlist;
};

function allEqual({
  distribution,
  indexText,
  indexed,
}: Props): PartialLink | null {
  if (new Set(indexed).size !== 1) {
    return null;
  }
  return {
    name: `${indexText} are equal`,
    logProb: distribution.probEqual(indexed.length),
    description: [`${indexText} are ${indexed[0]!}`],
  };
}

function almostEqual({
  distribution,
  indexText,
  indexed,
  slugs,
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
    logProb: distribution.probAlmostEqual(indexed.length),
    description: [
      `'${slugs[aSlugIndex]!}' ${indexText} is '${a!}'`,
      `others ${indexText} are '${b!}'`,
    ],
  };
}

function onlyTwo({
  distribution,
  indexText,
  indexed,
  slugs,
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
    logProb: distribution.probTwoDistinct(indexed.length),
    description: [
      `${aSlugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${a!}'`,
      `${bSlugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${b!}'`,
    ],
  };
}

function word({
  distribution,
  indexText,
  indexed,
  wordlist,
}: Props): PartialLink | null {
  // TODO: isPhrase?
  if (!wordlist.isWord(indexed.join(""))) {
    return null;
  }
  return {
    name: `${indexText} are a word`,
    logProb: distribution.probWord(indexed.length),
    description: [`${indexText} are '${indexed.join("")}'`],
  };
}

function anagram({
  distribution,
  indexText,
  indexed,
  wordlist,
}: Props): PartialLink | null {
  const anagrams = wordlist.anagrams(indexed.join(""));
  if (anagrams.length === 0) {
    return null;
  }
  return {
    name: `${indexText} anagram to a word`,
    logProb: distribution.probAnagram(indexed.length),
    description: [`${indexText} anagram to ${anagrams.join(", ")}`],
  };
}

function consecutive({
  distribution,
  indexText,
  indexed,
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
    logProb: distribution.probConsecutive(indexed.length),
    description: [`${indexText} are ${indexed.join(", ")}`],
  };
}

function paired({
  distribution,
  indexText,
  indexed,
  slugs,
}: Props): PartialLink | null {
  const byIndexed = LetterIndices.from(indexed.join(""));
  const countSet = byIndexed.countSet();
  if (countSet.size !== 1 || Array.from(countSet)[0] !== 2) {
    return null;
  }
  return {
    name: `${indexText} can be paired`,
    logProb: distribution.probPaired(indexed.length),
    description: Array.from(byIndexed.entries(), ([letter, slugIndices]) => {
      return `${slugIndices.map((i) => `'${slugs[i]!}'`).join(", ")} ${indexText} are '${letter}'`;
    }),
  };
}

export function indexingLinker(
  distribution: LetterDistribution,
  wordlist: Wordlist,
): Linker {
  return {
    name: "indexing linker",
    eval: (slugs, ordered) => {
      const indices = [
        ...interval(-10, 9).flatMap((i) => ({
          indexText:
            i >= 0 ? `${ordinal(i + 1)} letters` : `${ordinal(i)} letters`,
          indexed: slugs.map((slug) => slug.at(i) ?? null),
        })),
        ...(ordered
          ? [
              {
                indexText: "diagonal",
                indexed: slugs.map((slug, i) => slug.at(i) ?? null),
              },
            ]
          : []),
        ...(ordered && slugs.every((slug) => slug.length >= slugs.length)
          ? [
              {
                indexText: "antidiagonal",
                indexed: slugs.map((slug, i) => slug.at(slugs.length - i - 1)),
              },
            ]
          : []),
      ].filter((props): props is { indexText: string; indexed: string[] } =>
        props.indexed.every((w) => w !== null),
      );

      return indices.flatMap(({ indexText, indexed }) => {
        const props = {
          distribution,
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
