import { VOWELS } from "../lib/letterDistribution.js";
import { LogNum } from "../lib/logNum.js";
import { enumerate } from "../lib/util.js";
import type { Wordlist } from "../lib/wordlist.js";
import type { Linker, PartialLink } from "./index.js";

type Props = {
  slugs: string[];
  wordlist: Wordlist;
};

function unusualLetters({ slugs, wordlist }: Props): PartialLink | null {
  const all = Array.from(slugs.join(""));
  const { high, low } = wordlist.letters.outliers(all);
  if (high.length > 0 || low.length > 0) {
    return {
      name: "unusual letter distribution",
      logProb: wordlist.letters.probUnordered(all),
      description: [
        ...(high.length > 0 ? [`over-represented: ${high.join(", ")}`] : []),
        ...(low.length > 0 ? [`under-represented: ${low.join(", ")}`] : []),
      ],
    };
  }
  return null;
}

function equalVowelPattern(
  start: boolean,
  { slugs, wordlist }: Props,
): PartialLink | null {
  const minLength = Math.min(...slugs.map((s) => s.length));
  const shortest = slugs.find((s) => s.length === minLength)!;
  const pattern = Array.from(shortest, (letter) =>
    VOWELS.includes(letter) ? "V" : "C",
  ).join("");
  const matchesVowelPattern = (other: string) => {
    const offset = start ? 0 : other.length - minLength;
    for (const [i, vc] of enumerate(pattern)) {
      if (VOWELS.includes(other[offset + i]!) !== (vc === "V")) {
        return false;
      }
    }
    return true;
  };
  if (!slugs.every(matchesVowelPattern)) {
    return null;
  }
  return {
    name: `${start ? "start" : "end"} with the same vowel-consonant pattern`,
    logProb: wordlist[start ? "prefixes" : "suffixes"].probEqualVowelPattern(
      slugs.length,
      minLength,
    ),
    description: [`all ${start ? "start" : "end"} with ${pattern}`],
  };
}

function sharedAffixes({ slugs, wordlist }: Props): PartialLink | null {
  const shared = new Map<string, { prefixOf: string; length: number }>();
  for (const suffixOf of slugs) {
    for (const prefixOf of slugs) {
      if (prefixOf === suffixOf) {
        continue;
      }
      let length = Math.min(prefixOf.length, suffixOf.length);
      for (; length > 1; length--) {
        if (prefixOf.slice(0, length) !== suffixOf.slice(-length)) {
          continue;
        }
        const currentBest = shared.get(suffixOf)?.length ?? 0;
        if (length > currentBest) {
          shared.set(suffixOf, { prefixOf, length });
        }
      }
    }
  }

  if (shared.size <= 1) {
    return null;
  }

  return {
    name: "multiple shared suffixes and prefixes",
    // This is an underestimate because it assumes independence.
    logProb: LogNum.prod(
      Array.from(shared.values(), ({ length }) => {
        return wordlist.probSharedAffix(length);
      }),
    ),
    description: Array.from(
      shared.entries(),
      ([suffixOf, { prefixOf, length }]) =>
        `${suffixOf.slice(0, -length)}${suffixOf.slice(-length).toUpperCase()} ${prefixOf
          .slice(0, length)
          .toUpperCase()}${prefixOf.slice(length)}`,
    ),
  };
}

// TODO at each index, there's exactly one repeated letter

/** Other links. */
export function otherLinker(wordlist: Wordlist): Linker {
  return {
    name: "other links",
    eval: (slugs) => {
      const props = { slugs, wordlist };
      return [
        unusualLetters(props),
        equalVowelPattern(true, props),
        equalVowelPattern(false, props),
        sharedAffixes(props),
      ].filter((l): l is PartialLink => l !== null);
    },
  };
}
