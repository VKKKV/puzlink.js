/**
 * A class that uses a single bigint to store counts for each lowercase letter,
 * for fast-ish comparison.
 *
 * Idea stolen from Collective.jl:
 * https://github.com/rdeits/Collective.jl/blob/master/src/bitstally.jl
 */
export class LetterBitset {
  private static readonly bits = 5n;
  private static readonly mask = (1n << LetterBitset.bits) - 1n;
  private static readonly offsets = Array(26)
    .fill(0)
    .map((_, i) => LetterBitset.bits * BigInt(i));
  private static readonly letterMasks = LetterBitset.offsets.map(
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
      data += LetterBitset.letterMasks[this.toIndex(char)]!;
    }
    return new LetterBitset(data);
  }

  /** Count the number of times the given letter appears in this bitset. */
  index(letter: string): number {
    return Number(
      (this.data >> LetterBitset.offsets[LetterBitset.toIndex(letter)]!) &
        LetterBitset.mask,
    );
  }

  equals(other: LetterBitset): boolean {
    return this.data === other.data;
  }

  add(char: string): LetterBitset {
    return new LetterBitset(
      this.data + (LetterBitset.letterMasks[LetterBitset.toIndex(char)] ?? 0n),
    );
  }

  sub(char: string): LetterBitset {
    return new LetterBitset(
      this.data - (LetterBitset.letterMasks[LetterBitset.toIndex(char)] ?? 0n),
    );
  }

  /** If this + result == other, return result; else null. */
  transaddOf(other: LetterBitset) {
    const diff = this.data - other.data;
    const index = LetterBitset.letterMasks.findIndex((mask) => diff === mask);
    if (index === -1) {
      return null;
    }
    return LetterBitset.fromIndex(index);
  }

  /** If this - result == other, return result; else null. */
  transdeleteOf(other: LetterBitset) {
    return other.transaddOf(this);
  }
}

/** A map from letter bitsets to words with that bitset. */
export class LetterBitsets {
  private letterCounters = new Map<bigint, string[]>();
  private lengths = new Set<number>();

  constructor(wordlist: string[]) {
    for (const word of wordlist) {
      const bitset = LetterBitset.from(word).data;
      if (!this.letterCounters.has(bitset)) {
        this.letterCounters.set(bitset, []);
      }
      this.letterCounters.get(bitset)!.push(word);
      this.lengths.add(word.length);
    }
  }

  /** Get the words whose bitset matches the given slug's bitset. */
  get(slug: string): string[] {
    return this.letterCounters.get(LetterBitset.from(slug).data) ?? [];
  }

  /** Find all substrings of the slug that anagram to a word's bitset. */
  *matchSubstring(slug: string): Generator<{ start: number; words: string[] }> {
    for (const length of this.lengths) {
      let start = 0;
      let bitset = LetterBitset.from(slug.slice(0, length));
      for (; start + length <= slug.length; start++) {
        const words = this.letterCounters.get(bitset.data);
        if (words && words.length > 0) {
          yield { start, words };
        }
        bitset = bitset.sub(slug[start] ?? "").add(slug[start + length] ?? "");
      }
    }
  }
}
