import { LetterDistribution, VOWELS } from "../lib/letterDistribution.js";
import { enumerate } from "../lib/util.js";
import type { Linker, PartialLink } from "./index.js";

// TODO(maybe): preponderance of NEWS
// TODO(maybe): preponderance of IVXLDCM

type Props = {
  distribution: LetterDistribution;
  slugs: string[];
};

function unusual({ distribution, slugs }: Props): PartialLink | null {
  const all = slugs.join("");
  const { high, low } = distribution.outliers(all);
  if (high.length > 0 || low.length > 0) {
    return {
      name: "unusual letter distribution",
      logProb: distribution.prob(all),
      description: [
        ...(high ? [`over-represented: ${high}`] : []),
        ...(low ? [`under-represented: ${low}`] : []),
      ],
    };
  }
  return null;
}

function equalVowelPattern(
  start: boolean,
  { distribution, slugs }: Props,
): PartialLink | null {
  const minLength = Math.min(...slugs.map((s) => s.length));
  const shortest = slugs.find((s) => s.length === minLength)!;
  const pattern = Array.from(shortest, (letter) =>
    VOWELS.includes(letter) ? "V" : "C",
  ).join("");
  for (const other of slugs) {
    const offset = start ? 0 : other.length - shortest.length;
    for (const [i] of enumerate(shortest)) {
      if (VOWELS.includes(other[offset + i]!) !== (pattern[i] === "V")) {
        return null;
      }
    }
  }
  return {
    name: `${start ? "start" : "end"} with the same vowel-consonant pattern`,
    logProb: distribution.probEqualVowelPattern(slugs.length, minLength),
    description: [`all ${start ? "start" : "end"} with ${pattern}`],
  };
}

export function nGramLinker(distribution: LetterDistribution): Linker {
  return {
    name: "n-grams",
    eval: (slugs) => {
      const props = {
        distribution,
        slugs,
      };
      return [
        unusual(props),
        equalVowelPattern(true, props),
        equalVowelPattern(false, props),
      ].filter((l): l is PartialLink => l !== null);
    },
  };
}
