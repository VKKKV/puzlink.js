import { LogNum } from "./logNum.js";

/** A map from items to log counts. */
export class LogCounter<T extends PropertyKey> {
  private readonly counts: ReadonlyMap<T, LogNum>;

  constructor(counts: ReadonlyMap<T, LogNum>, totalCache?: LogNum) {
    this.counts = counts;
    this.totalCache = totalCache;
  }

  static from(data: string): LogCounter<string>;
  static from<T extends PropertyKey>(data: readonly T[]): LogCounter<T>;
  static from(data: string | readonly PropertyKey[]) {
    const counts = new Map<PropertyKey, number>();

    for (const item of data) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    return new LogCounter(
      new Map(
        Array.from(counts).map(([item, count]) => [item, LogNum.from(count)]),
      ),
      LogNum.from(data.length),
    );
  }

  /** The number of distinct items. */
  get distinct(): LogNum {
    return LogNum.from(this.counts.size);
  }

  private totalCache: LogNum | undefined;

  /** The total number of all items. */
  get total(): LogNum {
    return (this.totalCache ??= LogNum.sum(Array.from(this.counts.values())));
  }

  /** The log count of the given item. */
  get(item: T): LogNum {
    return this.counts.get(item) ?? LogNum.from(0);
  }

  /** Returns an iterable of [item, log count] pairs. */
  entries(): IterableIterator<[T, LogNum]> {
    return this.counts.entries();
  }

  /** Returns an iterable of [item, log probability] pairs. */
  *frequencies(): IterableIterator<[T, LogNum]> {
    for (const [item, count] of this.counts) {
      yield [item, count.div(this.total)];
    }
  }

  /** Returns a list of items in this that are not in other. */
  difference(other: T[]): T[] {
    const result: T[] = [];
    for (const item of this.counts.keys()) {
      if (!other.includes(item)) {
        result.push(item);
      }
    }
    return result;
  }
}
