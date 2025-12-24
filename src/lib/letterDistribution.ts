import { Distribution } from "./distribution.js";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { caesar } from "./util.js";
import { Wordlist } from "./wordlist.js";

export const LETTERS = "abcdefghijklmnopqrstuvwxyz";
export const VOWELS = "aeiou";
export const CONSONANTS = "bcdfghjklmnpqrstvwxyz";

/**
 * Info about the letter distribution of a wordlist.
 */
export class LetterDistribution {
  readonly distribution: Distribution<string>;
  private readonly wordlist: Wordlist;
  private readonly lengthToProbs: Map<
    number,
    { word: LogNum; anagram: LogNum }
  >;

  constructor(wordlist: Wordlist) {
    this.wordlist = wordlist;
    const frequencies = wordlist.reduce(
      new Map(Array.from(LETTERS).map((letter) => [letter, LogNum.from(0)])),
      (freqs, slug, zipf) => {
        const prob = LogNum.fromZipf(zipf);
        const length = LogNum.from(slug.length);
        for (const letter of slug) {
          freqs.set(letter, freqs.get(letter)!.add(prob.div(length)));
        }
        return freqs;
      },
    );
    this.distribution = new Distribution(frequencies);
    this.lengthToProbs = this.wordlist.reduce(
      new Map<number, { word: LogNum; anagram: LogNum }>(),
      (acc, slug) => {
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

        if (!acc.has(slug.length)) {
          acc.set(slug.length, {
            word: LogNum.from(0),
            anagram: LogNum.from(0),
          });
        }
        acc.get(slug.length)!.word = acc.get(slug.length)!.word.add(prob);
        acc.get(slug.length)!.anagram = acc
          .get(slug.length)!
          .anagram.add(prob.mul(perms));

        return acc;
      },
    );
  }

  static from(words: string[]): LetterDistribution {
    return new LetterDistribution(Wordlist.from(words));
  }

  /** Log probability of a slug's distribution, via chi-squared. */
  prob(slug: string): LogNum {
    const counter = LogCounter.from(slug);
    return this.distribution.prob(counter);
  }

  /** Over- and under-represented letters, at 3 sigma. */
  outliers(slug: string): {
    high: string;
    low: string;
  } {
    const counter = LogCounter.from(slug);
    const { high, low } = this.distribution.outliers(counter);
    return { high: Object.keys(high).join(""), low: Object.keys(low).join("") };
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
      Array(common)
        .fill(null)
        .flatMap((_, k) =>
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
    for (let i = 1; i <= k; i++) {
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
}
