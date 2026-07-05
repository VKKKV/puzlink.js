/** A subset of the non-negative integers, backed by a bigint. */
export class Bitset {
  readonly data: bigint;

  constructor(data: bigint) {
    this.data = data;
  }

  static from(set: Iterable<number>): Bitset {
    let data = 0n;
    for (const i of set) {
      data |= 1n << BigInt(i);
    }
    return new Bitset(data);
  }

  complement(total: number): Bitset {
    return new Bitset(((1n << BigInt(total)) - 1n) ^ this.data);
  }

  *entries(): Generator<number> {
    let data = this.data;
    for (let i = 0; data > 0n; i++, data >>= 1n) {
      if (data & 1n) {
        yield i;
      }
    }
  }

  count(): number {
    let count = 0;
    for (let data = this.data; data > 0n; data >>= 1n) {
      if (data & 1n) {
        count++;
      }
    }
    return count;
  }

  equals(other: Bitset): boolean {
    return this.data === other.data;
  }
}
