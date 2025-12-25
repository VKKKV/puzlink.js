import { morseLetter } from "../data/morse.js";
import { scrabbleLetterScore } from "../data/scrabble.js";
import { VOWELS } from "../lib/letterDistribution.js";
import {
  enumerate,
  interval,
  mapProduct,
  printIndexSlug,
  windows,
} from "../lib/util.js";
import type { Feature } from "./index.js";

/**
 * Returns the number of diffs between the first half and the last half
 * reversed. Palindromes have a mirrorDiff of 0.
 */
function mirrorDiff(slug: string): number {
  let mismatches = 0;
  for (let i = 0, j = slug.length - 1; i < j; i++, j--) {
    if (slug[i] !== slug[j]) {
      mismatches++;
    }
  }
  return mismatches;
}

function palindrome(): Feature {
  return {
    name: "is palindrome",
    property: (slug) => {
      if (mirrorDiff(slug) !== 0) return null;
      const letters = Array.from(slug);
      if (letters.length % 2 === 0) {
        letters.splice(letters.length / 2, 0, "|");
      } else {
        letters.splice(Math.floor(letters.length / 2) + 1, 0, "|");
        letters.splice(Math.floor(letters.length / 2) - 1, 0, "|");
      }
      return letters.join("");
    },
  };
}

function changeToPalindrome(): Feature {
  return {
    name: "is one change to a palindrome",
    property: (slug) => {
      if (mirrorDiff(slug) !== 1) {
        return null;
      }
      const letters = Array.from(slug);
      if (letters.length % 2 === 0) {
        letters.splice(letters.length / 2, 0, "|");
      } else {
        letters.splice(Math.floor(letters.length / 2) + 1, 0, "|");
        letters.splice(Math.floor(letters.length / 2) - 1, 0, "|");
      }
      return letters.join("");
    },
  };
}

function deleteToPalindrome(): Feature {
  return {
    name: "is one deletion to a palindrome",
    property: (slug) => {
      for (const i of interval(0, slug.length - 1)) {
        const candidate = `${slug.slice(0, i)}${slug.slice(i + 1)}`;
        if (mirrorDiff(candidate) === 0) {
          return `${slug} delete ${slug[i]!} = ${candidate}`;
        }
      }
      return null;
    },
  };
}

function hill(): Feature {
  return {
    name: "is a hill",
    property: (slug) => {
      const codes = Array.from(slug, (letter) => letter.charCodeAt(0));
      const max = Math.max(...codes);
      const peak = codes.findIndex((code) => code === max);
      for (const [a, b] of windows(codes.slice(0, peak), 2)) {
        if (a > b) return null;
      }
      for (const [a, b] of windows(codes.slice(peak), 2)) {
        if (a < b) return null;
      }

      const letters = Array.from(slug);
      const peakEnd = codes.findLastIndex((code) => code === max);
      letters.splice(peak, 0, "<");
      letters.splice(peakEnd + 2, 0, ">");

      return letters.join("");
    },
  };
}

function valley(): Feature {
  return {
    name: "is a valley",
    property: (slug) => {
      const codes = Array.from(slug, (letter) => letter.charCodeAt(0));
      const min = Math.min(...codes);
      const trough = codes.findIndex((code) => code === min);
      for (const [a, b] of windows(codes.slice(0, trough), 2)) {
        if (a < b) return null;
      }
      for (const [a, b] of windows(codes.slice(trough), 2)) {
        if (a > b) return null;
      }

      const letters = Array.from(slug);
      const troughEnd = codes.findLastIndex((code) => code === min);
      letters.splice(trough, 0, ">");
      letters.splice(troughEnd + 2, 0, "<");

      return letters.join("");
    },
  };
}

function alternatingVowels(): Feature {
  return {
    name: "alternates vowels and consonants",
    property: (slug) => {
      let wasVowel = VOWELS.includes(slug[0]!);
      const vowelIndices = wasVowel ? [0] : [];
      for (const [i, letter] of enumerate(slug.slice(1))) {
        const isVowel = VOWELS.includes(letter);
        if (isVowel === wasVowel) {
          return null;
        }
        if (isVowel) {
          vowelIndices.push(i + 1);
        }
        wasVowel = isVowel;
      }
      return printIndexSlug(slug, vowelIndices);
    },
  };
}

function scrabbleScore(n: number): Feature {
  return {
    name: `has scrabble score ${n.toString()}`,
    property: (slug) => {
      const points = Array.from(slug, (letter) => scrabbleLetterScore[letter]!);
      const score = points.reduce((a, b) => a + b, 0);
      return score === n
        ? `${slug}: ${points.join("+")} = ${n.toString()}`
        : null;
    },
  };
}

function morseEqual(): Feature {
  return {
    name: "has morse code with equal dot/dash count",
    property: (slug) => {
      const morse = Array.from(slug, (letter) => morseLetter[letter]!).join(
        " ",
      );
      const dotCount = Array.from(morse).filter((c) => c === ".").length;
      const dashCount = Array.from(morse).filter((c) => c === "-").length;
      return dotCount === dashCount
        ? `${slug} has ${dotCount.toString()} dots/dashes: ${morse}`
        : null;
    },
  };
}

function morseCount(kind: { name: string; chars: string }, n: number): Feature {
  return {
    name: `has morse code with ${n.toString()} ${kind.name}`,
    property: (slug) => {
      const morse = Array.from(slug, (letter) => morseLetter[letter]!).join(
        " ",
      );
      const count = Array.from(morse).filter((c) =>
        kind.chars.includes(c),
      ).length;
      return count === n
        ? `${slug} has ${count.toString()} ${kind.name}: ${morse}`
        : null;
    },
  };
}

/** Features that don't fit elsewhere. */
export function otherFeatures(): Feature[] {
  return [
    palindrome(),
    changeToPalindrome(),
    deleteToPalindrome(),
    hill(),
    valley(),
    alternatingVowels(),
    ...mapProduct(scrabbleScore, interval(1, 40)),
    morseEqual(),
    ...mapProduct(
      morseCount,
      [
        { name: "dots", chars: "." },
        { name: "dashes", chars: "-" },
        { name: "dots and dashes", chars: ".-" },
      ],
      interval(1, 40),
    ),
  ];
}
