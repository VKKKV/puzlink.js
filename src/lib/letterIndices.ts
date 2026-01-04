import { DefaultMap } from "./defaultMap.js";
import { memoize } from "./memoize.js";
import { enumerate } from "./util.js";

/** A map from letters to their indices in a given slug. */
export class LetterIndices extends DefaultMap<string, number[]> {
  constructor(entries?: Iterable<readonly [string, number[]]> | null) {
    super(() => [], entries);
  }

  static from(slug: string): LetterIndices {
    const indices = new LetterIndices();
    for (const [i, letter] of enumerate(slug)) {
      indices.get(letter).push(i);
    }
    return indices;
  }

  @memoize()
  counts() {
    return this.mapValues((indices) => indices.length);
  }

  countSet(): Set<number> {
    return new Set(Array.from(this.counts(), ([, c]) => c));
  }

  filterKeys(fn: (letter: string, indices: number[]) => boolean): string[] {
    return Array.from(this.entries())
      .filter(([letter, indices]) => fn(letter, indices))
      .map(([letter]) => letter);
  }
}
