import type { LetterDistribution } from "../lib/letterDistribution.js";
import { interval, ordinal } from "../lib/util.js";
import type { Link, Linker } from "./index.js";

type Props = {
  distribution: LetterDistribution;
  indexText: string;
  indexed: string[];
  indexedWithNull: (string | null)[];
  slugs: string[];
};

function allEqual({ distribution, indexText, indexed }: Props): Link | null {
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
}: Props): Link | null {
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

// TODO:
// - letters at index [-10..10] are:
//   - (ordered) spell a word
//   - are an anagram of a word
//   - one of two choices
//   - (ordered) are consecutive
//   - can pair up
// - (ordered) letters on the diagonal are (as above)

export function indexingLinker(distribution: LetterDistribution): Linker {
  return {
    name: "indexing linker",
    eval: (slugs) => {
      return interval(-10, 9).flatMap((i) => {
        const indexText =
          i >= 0 ? `${ordinal(i + 1)} letters` : `${ordinal(i)} letters`;
        const indexedWithNull = slugs.map((slug) => slug.at(i) ?? null);
        const indexed = indexedWithNull.filter((w): w is string => w !== null);
        const props = {
          distribution,
          indexText,
          indexed,
          indexedWithNull,
          slugs,
        };
        return [allEqual(props), almostEqual(props)].filter(
          (l): l is Link => l !== null,
        );
      });
    },
  };
}
