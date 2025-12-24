import { morseLetter } from "../data/morse.js";
import { scrabbleLetterScore } from "../data/scrabble.js";
import { VOWELS } from "../lib/letterDistribution.js";
import { interval, mapProduct, printIndexSlug } from "../lib/util.js";
import type { Feature } from "./index.js";

function palindrome(): Feature {
  return {
    name: "is palindrome",
    property: (slug) => {
      for (let i = 0, j = slug.length - 1; i < j; i++, j--) {
        if (slug[i] !== slug[j]) return null;
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

function changeToPalindrome(): Feature {
  return {
    name: "is one change to a palindrome",
    property: (slug) => {
      let mismatches = 0;
      for (let i = 0, j = slug.length - 1; i < j; i++, j--) {
        if (slug[i] !== slug[j]) mismatches++;
      }
      if (mismatches !== 1) {
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
        let isPalindrome = true;
        for (let j = 0, k = candidate.length - 1; j < k; j++, k--) {
          if (candidate[j] !== candidate[k]) {
            isPalindrome = false;
            break;
          }
        }
        if (isPalindrome) {
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
      const peak = interval(0, slug.length - 1).find((i) => codes[i] === max)!;
      for (let i = 0; i < peak; i++) {
        if (codes[i]! > codes[i + 1]!) return null;
      }
      for (let i = peak; i < slug.length - 1; i++) {
        if (codes[i]! < codes[i + 1]!) return null;
      }

      let foundMax = false;
      const letters = [];
      for (const letter of slug) {
        if (!foundMax && letter.charCodeAt(0) === max) {
          letters.push("<");
          foundMax = true;
        }
        if (foundMax && letter.charCodeAt(0) !== max) {
          letters.push(">");
          foundMax = false;
        }
        letters.push(letter);
      }
      if (foundMax) {
        letters.push(">");
      }

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
      const peak = interval(0, slug.length - 1).find((i) => codes[i] === min)!;
      for (let i = 0; i < peak; i++) {
        if (codes[i]! < codes[i + 1]!) return null;
      }
      for (let i = peak; i < slug.length - 1; i++) {
        if (codes[i]! > codes[i + 1]!) return null;
      }

      let foundMin = false;
      const letters = [];
      for (const letter of slug) {
        if (!foundMin && letter.charCodeAt(0) === min) {
          letters.push(">");
          foundMin = true;
        }
        if (foundMin && letter.charCodeAt(0) !== min) {
          letters.push("<");
          foundMin = false;
        }
        letters.push(letter);
      }
      if (foundMin) {
        letters.push("<");
      }

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
      for (let i = 1; i < slug.length; i++) {
        const isVowel = VOWELS.includes(slug[i]!);
        if (isVowel === wasVowel) {
          return null;
        }
        if (isVowel) {
          vowelIndices.push(i);
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
