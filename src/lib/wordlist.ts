import { Cromulence, loadWordlist, logProbToZipf } from "cromulence";
import { PrefixDistribution, SuffixDistribution } from "./affixDistribution.js";
import { LetterBitsets } from "./letterBitset.js";
import { LetterDistribution } from "./letterDistribution.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";

/**
 * Info about the words in a wordlist.
 *
 * We assume (as in `cromulence`) that words appearing in puzzles are
 * distributed via Zipf frequency.
 */
export class Wordlist {
  private cromulence: Cromulence;
  /** A map from letter bitsets to words with that bitset. */
  private bitsets: LetterBitsets;
  /** The letter distribution of the wordlist. */
  letters: LetterDistribution;
  /** The prefix distribution of the wordlist. */
  prefixes: PrefixDistribution;
  /** The suffix distribution of the wordlist. */
  suffixes: SuffixDistribution;

  constructor(wordlist: Record<string, number>) {
    this.cromulence = new Cromulence(wordlist);
    this.bitsets = new LetterBitsets(wordlist);
    this.letters = new LetterDistribution(wordlist);
    this.prefixes = new PrefixDistribution(wordlist);
    this.suffixes = new SuffixDistribution(wordlist);
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
    // TODO: maybe tweak the weights here to get better results?
    // if we do so, do the same thing in letterDistribution
    const count = this.reduce(0, (acc, slug) => acc + (property(slug) ? 1 : 0));
    const total = Object.keys(this.cromulence.wordlist).length;
    return LogNum.fromFraction(count, total);
  }

  /** Returns true if the given slug is in the wordlist. */
  isWord(
    slug: string,
    { threshold = 0 }: { threshold?: number } = {},
  ): boolean {
    return (this.cromulence.wordlist[slug] ?? -1000) > threshold;
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
    return this.bitsets
      .get(slug)
      .filter((word) => loose || word !== slug)
      .map((word) => [word, this.cromulence.wordlist[word]!] as const)
      .filter((t) => t[1] > threshold)
      .sort((a, b) => b[1] - a[1])
      .map((t) => t[0]);
  }

  /**
   * Prob that, for two words, the first has a suffix equal to the second's
   * prefix, of the given length.
   */
  @memoize()
  probSharedAffix(length: number) {
    const prefixes = this.prefixes.get(length);
    const suffixes = this.suffixes.get(length);

    return LogNum.sum(
      Array.from(prefixes.entries(), ([prefix, prefixProb]) => {
        return prefixProb.mul(suffixes.get(prefix));
      }),
    );
  }
}
