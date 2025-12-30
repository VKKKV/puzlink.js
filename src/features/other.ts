import { morseLetter } from "../data/morse.js";
import { VOWELS } from "../lib/letterDistribution.js";
import { enumerate, interval, windows } from "../lib/util.js";
import * as T from "../templating/index.js";
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
    name: T.Text("is palindrome"),
    property: (slug) => {
      if (mirrorDiff(slug) !== 0) return null;
      const middle = Math.floor(slug.length / 2);
      return T.Row([
        T.Highlight(
          slug,
          slug.length % 2 === 0 ? [middle - 1, middle] : [middle],
        ),
        T.Indices(middle),
        T.Slug(slug[middle]!),
      ]);
    },
  };
}

function changeToPalindrome(): Feature {
  return {
    name: T.Text("is one change to a palindrome"),
    property: (slug) => {
      if (mirrorDiff(slug) !== 1) return null;
      const mismatchIndex = Array.from(slug).findIndex(
        (letter, i) => letter !== slug[slug.length - i - 1],
      );
      const middle = Math.floor(slug.length / 2);
      return T.Row([
        T.Highlight(
          slug,
          slug.length % 2 === 0
            ? [mismatchIndex, middle - 1, middle]
            : [mismatchIndex, middle],
        ),
        T.Indices(mismatchIndex),
        T.Slug(slug[mismatchIndex]!),
        T.Indices(slug.length - mismatchIndex - 1),
        T.Slug(slug[slug.length - mismatchIndex - 1]!),
      ]);
    },
  };
}

function deleteToPalindrome(): Feature {
  return {
    name: T.Text("is one deletion to a palindrome"),
    property: (slug) => {
      for (const i of interval(0, slug.length - 1)) {
        const candidate = `${slug.slice(0, i)}${slug.slice(i + 1)}`;
        if (mirrorDiff(candidate) === 0) {
          const middle = Math.floor(candidate.length / 2);
          return T.Row([
            T.Highlight(slug, [i]),
            T.Indices(i),
            T.Slug(slug[i]!),
            T.Highlight(
              candidate,
              candidate.length % 2 === 0 ? [middle - 1, middle] : [middle],
            ),
            T.Collapsible(T.Indices(middle)),
            T.Collapsible(T.Slug(candidate[middle]!)),
          ]);
        }
      }
      return null;
    },
  };
}

function hill(): Feature {
  return {
    name: T.Text("is a hill"),
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
      const peakEnd = codes.findLastIndex((code) => code === max);

      return T.Row([
        T.Highlight(slug, interval(peak, peakEnd)),
        T.Indices(peak),
        T.Slug(slug[peak]!),
        peak !== peakEnd && T.Indices(peakEnd),
      ]);
    },
  };
}

function valley(): Feature {
  return {
    name: T.Text("is a valley"),
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

      const troughEnd = codes.findLastIndex((code) => code === min);

      return T.Row([
        T.Highlight(slug, interval(trough, troughEnd)),
        T.Indices(trough),
        T.Slug(slug[trough]!),
        trough !== troughEnd && T.Indices(troughEnd),
      ]);
    },
  };
}

function alternatingVowels(): Feature {
  return {
    name: T.Text("alternates vowels and consonants"),
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
      return T.Row([
        T.Highlight(slug, vowelIndices),
        T.Indices(vowelIndices.includes(0) ? 0 : 1),
      ]);
    },
  };
}

function morseEqual(): Feature {
  return {
    name: T.Join(["has morse code with equal dot/dash count"]),
    property: (slug) => {
      const morse = Array.from(slug, (letter) => morseLetter[letter]!).join(
        " ",
      );
      const dotCount = Array.from(morse).filter((c) => c === ".").length;
      const dashCount = Array.from(morse).filter((c) => c === "-").length;
      if (dotCount !== dashCount) {
        return null;
      }
      return T.Row([T.Slug(slug), T.Text(dotCount), T.Slug(morse)]);
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
    morseEqual(),
  ];
}
