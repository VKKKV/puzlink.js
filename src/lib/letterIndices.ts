import { enumerate } from "./util.js";

/** A map from letters to their indices in a given slug. */
export class LetterIndices {
  private readonly indices: ReadonlyMap<string, number[]>;

  constructor(indices: ReadonlyMap<string, number[]>) {
    this.indices = indices;
  }

  static from(slug: string): LetterIndices {
    const indices = new Map<string, number[]>();

    for (const [i, letter] of enumerate(slug)) {
      if (!indices.has(letter)) {
        indices.set(letter, []);
      }
      indices.get(letter)!.push(i);
    }

    return new LetterIndices(indices);
  }

  *counts(): IterableIterator<[string, number]> {
    for (const [letter, indices] of this.indices.entries()) {
      yield [letter, indices.length];
    }
  }

  countSet(): Set<number> {
    return new Set(Array.from(this.counts(), ([, c]) => c));
  }

  entries(): IterableIterator<[string, number[]]> {
    return this.indices.entries();
  }

  filterKeys(fn: (letter: string, indices: number[]) => boolean): string[] {
    return Array.from(this.indices.entries())
      .filter(([letter, indices]) => fn(letter, indices))
      .map(([letter]) => letter);
  }

  get(letter: string): number[] {
    return this.indices.get(letter) ?? [];
  }

  keys(): IterableIterator<string> {
    return this.indices.keys();
  }
}
