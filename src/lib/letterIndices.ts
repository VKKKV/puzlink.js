import { DefaultMap, ReadonlyDefaultMap } from "./defaultMap.js";
import { enumerate } from "./util.js";

/** A map from letters to their indices in a given slug. */
export class LetterIndices extends ReadonlyDefaultMap<
  string,
  readonly number[]
> {
  constructor(entries?: Iterable<readonly [string, readonly number[]]> | null) {
    super(() => [], entries);
  }

  static from(slug: string): LetterIndices {
    const indices = new DefaultMap<string, number[]>(() => []);
    for (const [i, letter] of enumerate(slug)) {
      indices.get(letter).push(i);
    }
    return new LetterIndices(indices);
  }

  counts() {
    return this.mapValues((indices) => indices.length);
  }

  countSet(): Set<number> {
    return new Set(Array.from(this.counts(), ([, c]) => c));
  }

  filterKeys(
    fn: (letter: string, indices: readonly number[]) => boolean,
  ): string[] {
    return Array.from(this.entries())
      .filter(([letter, indices]) => fn(letter, indices))
      .map(([letter]) => letter);
  }
}
