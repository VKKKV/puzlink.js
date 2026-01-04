import { DefaultMap } from "./defaultMap.js";

/**
 * A class that uses a single bigint to store counts for each lowercase letter,
 * for fast-ish comparison.
 *
 * Idea stolen from Collective.jl:
 * https://github.com/rdeits/Collective.jl/blob/master/src/bitstally.jl
 */
export class LetterBitCounter {
  private static readonly bits = 5n;
  private static readonly mask = (1n << LetterBitCounter.bits) - 1n;
  private static readonly offsets = Array(26)
    .fill(0)
    .map((_, i) => LetterBitCounter.bits * BigInt(i));
  private static readonly letterMasks = LetterBitCounter.offsets.map(
    (x) => 1n << x,
  );

  /**
   * This is a (26 * 5)-bit integer; each 5-bit block is a count for a letter.
   * Unclear how efficient this'll be for different engines...
   *
   * Note that 26 * 5 = 130, so these *mostly* fit in 128-bit integers, unless
   * there's more than 7 'z's.
   */
  readonly data: bigint;

  constructor(data: bigint) {
    this.data = data;
  }

  private static toIndex(letter: string) {
    return letter.charCodeAt(0) - 97;
  }

  private static fromIndex(index: number) {
    return String.fromCharCode(97 + index);
  }

  /** Create a new LetterCounter from a slug. */
  static from(slug: string) {
    let data = 0n;
    for (const char of slug) {
      data += LetterBitCounter.letterMasks[this.toIndex(char)]!;
    }
    return new LetterBitCounter(data);
  }

  /** Count the number of times the given letter appears in this bitcounter. */
  index(letter: string): number {
    return Number(
      (this.data >>
        LetterBitCounter.offsets[LetterBitCounter.toIndex(letter)]!) &
        LetterBitCounter.mask,
    );
  }

  equals(other: LetterBitCounter): boolean {
    return this.data === other.data;
  }

  add(char: string): LetterBitCounter {
    return new LetterBitCounter(
      this.data +
        (LetterBitCounter.letterMasks[LetterBitCounter.toIndex(char)] ?? 0n),
    );
  }

  sub(char: string): LetterBitCounter {
    return new LetterBitCounter(
      this.data -
        (LetterBitCounter.letterMasks[LetterBitCounter.toIndex(char)] ?? 0n),
    );
  }

  /** If this + result == other, return result; else null. */
  transaddOf(other: LetterBitCounter) {
    const diff = this.data - other.data;
    const index = LetterBitCounter.letterMasks.findIndex(
      (mask) => diff === mask,
    );
    if (index === -1) {
      return null;
    }
    return LetterBitCounter.fromIndex(index);
  }

  /** If this - result == other, return result; else null. */
  transdeleteOf(other: LetterBitCounter) {
    return other.transaddOf(this);
  }
}

/** A map from letter bitcounters to words with that bitcounter. */
export class LetterBitCounters {
  private letterCounters = new DefaultMap<bigint, string[]>(() => []);
  private lengths = new Set<number>();

  constructor(wordlist: string[]) {
    for (const word of wordlist) {
      const bitcounter = LetterBitCounter.from(word).data;
      this.letterCounters.get(bitcounter).push(word);
      this.lengths.add(word.length);
    }
  }

  /** Get the words whose bitcounter matches the given slug's bitcounter. */
  get(slug: string): string[] {
    return this.letterCounters.get(LetterBitCounter.from(slug).data);
  }

  /** Find all substrings of the slug that anagram to a word's bitcounter. */
  *matchSubstring(slug: string): Generator<{ start: number; words: string[] }> {
    for (const length of this.lengths) {
      let start = 0;
      let bitcounter = LetterBitCounter.from(slug.slice(0, length));
      for (; start + length <= slug.length; start++) {
        const words = this.letterCounters.get(bitcounter.data);
        if (words.length > 0) {
          yield { start, words };
        }
        bitcounter = bitcounter
          .sub(slug[start] ?? "")
          .add(slug[start + length] ?? "");
      }
    }
  }
}
