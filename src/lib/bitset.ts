/** A subset of {0, 1, ..., 59}. */
export class Bitset {
  private static readonly max = 59;

  /** This is a (max + 1)-bit integer. */
  readonly data: bigint;

  constructor(data: bigint) {
    this.data = data;
  }

  static from(set: Iterable<number>): Bitset {
    let data = 0n;
    for (const i of set) {
      if (i > Bitset.max) {
        throw new Error(
          `Bitset.from: ${i.toString()} > ${Bitset.max.toString()}`,
        );
      }
      data |= 1n << BigInt(i);
    }
    return new Bitset(data);
  }

  complement(total: number): Bitset {
    return new Bitset(((1n << BigInt(total)) - 1n) ^ this.data);
  }

  *entries(): Generator<number> {
    for (let i = 0; i <= Bitset.max; i++) {
      if (this.data & (1n << BigInt(i))) {
        yield i;
      }
    }
  }

  count(): number {
    let count = 0;
    for (let i = 0; i <= Bitset.max; i++) {
      if (this.data & (1n << BigInt(i))) {
        count++;
      }
    }
    return count;
  }

  equals(other: Bitset): boolean {
    return this.data === other.data;
  }
}
