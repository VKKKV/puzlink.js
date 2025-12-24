import { LetterDistribution, VOWELS } from "../lib/letterDistribution.js";
import type { Link, Linker } from "./index.js";

// TODO(maybe): preponderance of NEWS
// TODO(maybe): preponderance of IVXLDCM

type Props = {
  distribution: LetterDistribution;
  slugs: string[];
};

function unusual({ distribution, slugs }: Props): Link | null {
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

function equalVowelPattern({ distribution, slugs }: Props): Link | null {
  const minLength = Math.min(...slugs.map((s) => s.length));
  const shortest = slugs.find((s) => s.length === minLength)!;
  const pattern = Array.from(shortest, (letter) =>
    VOWELS.includes(letter) ? "V" : "C",
  ).join("");
  for (const other of slugs) {
    for (let i = 0; i < minLength; i++) {
      if (VOWELS.includes(other[i]!) !== (pattern[i] === "V")) {
        return null;
      }
    }
  }
  return {
    name: "start with the same vowel-consonant pattern",
    logProb: distribution.probEqualVowelPattern(slugs.length, minLength),
    description: [`all start with ${pattern}`],
  };
}

export function letterDistributionLinker(
  distribution: LetterDistribution,
): Linker {
  return {
    name: "letter distribution",
    eval: (slugs) => {
      const props = {
        distribution,
        slugs,
      };
      return [unusual(props), equalVowelPattern(props)].filter(
        (l): l is Link => l !== null,
      );
    },
  };
}
