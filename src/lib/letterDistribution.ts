import { Distribution } from "./distribution.js";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { caesar, interval } from "./util.js";

export const LETTERS = "abcdefghijklmnopqrstuvwxyz";
export const VOWELS = "aeiou";
export const CONSONANTS = "bcdfghjklmnpqrstvwxyz";

/**
 * Info about the letter distribution of a wordlist.
 *
 * All of these methods rely on letters being drawn iid. This is the case for
 * letters that come from random indexing. This is *not* the case for things
 * like random substrings.
 */
export class LetterDistribution {
  readonly distribution: Distribution<string>;
  private readonly lengthToProbs: Map<
    number,
    {
      /** Log probability to get a word of this length. */
      word: LogNum;
      /** Log probability to get an anagram of a word of this length. */
      anagram: LogNum;
    }
  >;

  constructor(wordlist: Record<string, number>) {
    const letterCount = new Map<string, number>();
    let total = 0;

    for (const word in wordlist) {
      for (const letter of word) {
        letterCount.set(letter, (letterCount.get(letter) ?? 0) + 1);
        total++;
      }
    }

    this.distribution = new Distribution(
      new Map(
        Array.from(letterCount.entries(), ([letter, count]) => [
          letter,
          LogNum.fromFraction(count, total),
        ]),
      ),
    );

    this.lengthToProbs = new Map<number, { word: LogNum; anagram: LogNum }>();

    for (const slug in wordlist) {
      const prob = LogNum.prod(
        Array.from(slug, (letter) => this.distribution.get(letter)),
      );

      const counts = new Map<string, number>();
      for (const letter of slug) {
        counts.set(letter, (counts.get(letter) ?? 0) + 1);
      }
      const perms = LogNum.fromFactorial(slug.length).div(
        LogNum.prod(
          Array.from(counts.values(), (count) => LogNum.fromFactorial(count)),
        ),
      );

      if (!this.lengthToProbs.has(slug.length)) {
        this.lengthToProbs.set(slug.length, {
          word: LogNum.from(0),
          anagram: LogNum.from(0),
        });
      }
      this.lengthToProbs.get(slug.length)!.word = this.lengthToProbs
        .get(slug.length)!
        .word.add(prob);
      this.lengthToProbs.get(slug.length)!.anagram = this.lengthToProbs
        .get(slug.length)!
        .anagram.add(prob.mul(perms));
    }
  }

  /**
   * Log probability that a list of letters is iid drawn from this distribution,
   * via chi-squared.
   */
  probUnordered(letters: string[]): LogNum {
    const counter = LogCounter.from(letters);
    return this.distribution.probUnordered(counter);
  }

  /** Over- and under-represented letters, at 2 sigma. */
  outliers(letters: string[]): {
    high: string[];
    low: string[];
  } {
    const counter = LogCounter.from(letters);
    const { high, low } = this.distribution.outliers(counter);
    return { high: Object.keys(high), low: Object.keys(low) };
  }

  /**
   * Log probability that words of given lengths share common letters, in the
   * same order.
   */
  probCommonOrdered(common: number, lengths: number[]): LogNum {
    if (common === 0) {
      return LogNum.from(1);
    }

    const combos = LogNum.prod(
      interval(0, common - 1).flatMap((k) =>
        lengths.map((length) => LogNum.fromFraction(length - k, k + 1)),
      ),
    );
    const p = this.distribution.moment(lengths.length).pow(common);

    return LogNum.from(1).sub(LogNum.fromExp(-p.toNum() * combos.toNum()));
  }

  /** Log probability that k letters are all equal. */
  probEqual(k: number): LogNum {
    return this.distribution.probEqual(k);
  }

  /** Log probability that k letters are all equal, except for one. */
  probAlmostEqual(k: number): LogNum {
    return this.distribution.probAlmostEqual(k);
  }

  /** Log probability that k letters have exactly two values. */
  probTwoDistinct(k: number): LogNum {
    return this.distribution.probTwoDistinct(k);
  }

  /** Log probability that k letters are consecutive. */
  @memoize()
  probConsecutive(k: number): LogNum {
    if (k <= 1) {
      return LogNum.from(1);
    } else if (k > LETTERS.length) {
      return LogNum.from(0);
    }

    const freqWindow = [];
    for (const i of interval(1, k)) {
      freqWindow.push(this.distribution.get(LETTERS[i]!));
    }

    const partials = [];
    for (let a = 1; a + k - 1 <= LETTERS.length; a++) {
      partials.push(LogNum.prod(freqWindow));
      freqWindow.shift();
      freqWindow.push(this.distribution.get(LETTERS[a + k]!));
    }

    return LogNum.fromFactorial(k).mul(LogNum.sum(partials));
  }

  /**
   * Log probability that k letters have distinct values, all at least min.
   */
  @memoize(2)
  probDistinct(k: number, min = "a"): LogNum {
    if (k <= 0) {
      return LogNum.from(1);
    } else if (min > "z") {
      return LogNum.from(0);
    }

    const probs = [];
    for (const [letter, freq] of this.distribution.entries()) {
      if (letter < min) {
        continue;
      }
      probs.push(freq.mul(this.probDistinct(k - 1, caesar(letter, 1))));
    }

    return probs.length === 0
      ? LogNum.from(0)
      : LogNum.from(k).mul(LogNum.sum(probs));
  }

  /** Log probability that k letters can be grouped in equal pairs. */
  probPaired(k: number): LogNum {
    if (k % 2 !== 0) {
      return LogNum.from(0);
    }
    return this.probDistinct(Math.floor(k / 2));
  }

  /** Log probability that k letters form a word. */
  probWord(k: number): LogNum {
    return this.lengthToProbs.get(k)?.word ?? LogNum.from(0);
  }

  /** Log probability that k letters form an anagram of a word. */
  probAnagram(k: number): LogNum {
    return this.lengthToProbs.get(k)?.anagram ?? LogNum.from(0);
  }

  /** Log probability that k letters are all vowels. */
  @memoize()
  probVowels(k: number): LogNum {
    if (k === 0) {
      return LogNum.from(1);
    }
    if (k === 1) {
      return LogNum.sum(
        Array.from(VOWELS, (vowel) => this.distribution.get(vowel)),
      );
    }
    return this.probVowels(1).pow(k);
  }

  /** Log probability that k letters are all consonants. */
  @memoize()
  probConsonants(k: number): LogNum {
    if (k === 0) {
      return LogNum.from(1);
    }
    if (k === 1) {
      return LogNum.sum(
        Array.from(CONSONANTS, (consonant) => this.distribution.get(consonant)),
      );
    }
    return this.probConsonants(1).pow(k);
  }

  /**
   * Log probability that n words, each of length k, have the same pattern of
   * vowels and consonants.
   */
  probEqualVowelPattern(n: number, k: number): LogNum {
    return this.probVowels(k).add(this.probConsonants(k)).pow(n);
  }
}
