import { Cromulence, loadWordlist, logProbToZipf } from "cromulence";
import { LetterBitset } from "./letterBitset.js";
import { LogNum } from "./logNum.js";

/**
 * Info about the words in a wordlist.
 *
 * We assume (as in `cromulence`) that words appearing in puzzles are
 * distributed via Zipf frequency.
 */
export class Wordlist {
  private cromulence: Cromulence;
  /** A map from letter bitsets to words with that bitset. */
  private letterCounters = new Map<bigint, string[]>();

  constructor(wordlist: Record<string, number>) {
    this.cromulence = new Cromulence(wordlist);
    for (const word of Object.keys(this.cromulence.wordlist)) {
      const existing = this.letterCounters.get(LetterBitset.from(word).data);
      if (existing !== undefined) {
        existing.push(word);
        continue;
      } else {
        this.letterCounters.set(LetterBitset.from(word).data, [word]);
      }
    }
  }

  static async download(): Promise<Wordlist> {
    return new Wordlist(await loadWordlist());
  }

  /**
   * For testing purposes: create a wordlist from an array of words, each
   * equiprobable.
   */
  static from(words: string[]): Wordlist {
    const logFrac = LogNum.fromFraction(1, words.length);
    const wordlist: Record<string, LogNum> = {};
    for (const word of words) {
      wordlist[word] = wordlist[word] ? wordlist[word].add(logFrac) : logFrac;
    }
    return new Wordlist(
      Object.fromEntries(
        Object.entries(wordlist).map(([word, logProb]) => [
          word,
          logProbToZipf(logProb.toLog()),
        ]),
      ),
    );
  }

  /** Apply a reducer to each word in the wordlist. */
  reduce<T>(initial: T, reducer: (acc: T, slug: string, zipf: number) => T): T {
    let result = initial;
    for (const slug in this.cromulence.wordlist) {
      const zipf = this.cromulence.wordlist[slug]!;
      result = reducer(result, slug, zipf);
    }
    return result;
  }

  /**
   * Get the log prob that a wordlist item, drawn uniformly at random,
   * satisfies the given property. This is NOT weighted by zipf!
   */
  logProb(property: (slug: string) => boolean): LogNum {
    const total = this.reduce(0, (acc, slug) => {
      if (!property(slug)) {
        return acc;
      }
      return acc + 1;
    });
    return LogNum.fromFraction(
      total,
      Object.keys(this.cromulence.wordlist).length,
    );
  }

  /** Returns true if the given slug is in the wordlist. */
  isWord(
    slug: string,
    { threshold = 0 }: { threshold?: number } = {},
  ): boolean {
    const zipf = this.cromulence.wordlist[slug];
    if (zipf === undefined) {
      return false;
    }
    return zipf > threshold;
  }

  /** Returns true if any of the given slugs are in the wordlist. */
  hasWord(
    slugs: string[],
    { threshold = 0 }: { threshold?: number } = {},
  ): boolean {
    return slugs.some((slug) => this.isWord(slug, { threshold }));
  }

  /** Filters for slugs in the wordlist, sorted from most common to least. */
  filterWords(
    slugs: string[],
    { threshold = 0 }: { threshold?: number } = {},
  ): string[] {
    return slugs
      .map((slug) => [slug, this.cromulence.wordlist[slug]] as const)
      .filter(
        (t): t is [string, number] => t[1] !== undefined && t[1] > threshold,
      )
      .sort((a, b) => b[1] - a[1])
      .map((t) => t[0]);
  }

  /**
   * Filters for slugs in the wordlist under the given getter, sorted from most
   * common to least.
   */
  filterWordsUnder<T>(
    items: T[],
    getSlug: (item: T) => string,
    { threshold = 0 }: { threshold?: number } = {},
  ): T[] {
    return items
      .map((item) => [item, this.cromulence.wordlist[getSlug(item)]] as const)
      .filter((t): t is [T, number] => t[1] !== undefined && t[1] > threshold)
      .sort((a, b) => b[1] - a[1])
      .map((t) => t[0]);
  }

  /** Returns true if the given phrase is in the wordlist. */
  isPhrase(phrase: string): boolean {
    return this.cromulence.cromulence(phrase) > 0;
  }

  /** Returns the anagrams of a given slug, sorted from most common to least. */
  anagrams(
    slug: string,
    {
      loose = false,
      threshold = 0,
    }: { loose?: boolean; threshold?: number } = {},
  ): string[] {
    return (this.letterCounters.get(LetterBitset.from(slug).data) ?? [])
      .filter((word) => loose || word !== slug)
      .map((word) => [word, this.cromulence.wordlist[word]!] as const)
      .filter((t) => t[1] > threshold)
      .sort((a, b) => b[1] - a[1])
      .map((t) => t[0]);
  }
}
