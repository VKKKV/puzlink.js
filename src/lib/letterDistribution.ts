import { Distribution } from "./distribution.js";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";
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
  private readonly lengthToProbCache: Map<
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
    this.lengthToProbCache = this.wordlist.reduce(
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

  /** Log probability that k letters form a word. */
  probWord(k: number): LogNum {
    return this.lengthToProbCache.get(k)?.word ?? LogNum.from(0);
  }

  /** Log probability that k letters form an anagram of a word. */
  probAnagram(k: number): LogNum {
    return this.lengthToProbCache.get(k)?.anagram ?? LogNum.from(0);
  }
}
