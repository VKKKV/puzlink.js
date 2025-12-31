import { LogNum } from "./logNum.js";

/** A map from items to log counts. */
export class LogCounter<T extends PropertyKey> {
  private readonly counts: ReadonlyMap<T, LogNum>;

  constructor(counts: ReadonlyMap<T, LogNum>, totalCache?: LogNum) {
    this.counts = counts;
    this.totalCache = totalCache;
  }

  static from(data: string): LogCounter<string>;
  static from<T extends PropertyKey>(data: Iterable<T>): LogCounter<T>;
  static from<T extends PropertyKey, U>(
    data: Iterable<U>,
    map: (item: U) => T,
  ): LogCounter<T>;
  static from(data: string | Iterable<PropertyKey>) {
    const counts = new Map<PropertyKey, number>();
    let total = 0;

    for (const item of data) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
      total++;
    }

    return new LogCounter(
      new Map(
        Array.from(counts).map(([item, count]) => [item, LogNum.from(count)]),
      ),
      LogNum.from(total),
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

  /** Returns a list of items that satisfy the given predicate. */
  filterKeys(fn: (item: T, count: LogNum) => boolean): T[] {
    return Array.from(this.counts.entries())
      .filter(([item, count]) => fn(item, count))
      .map(([item]) => item);
  }

  /** Returns an iterable of [item, log probability] pairs. */
  *frequencies(): IterableIterator<[T, LogNum]> {
    for (const [item, count] of this.counts) {
      yield [item, count.div(this.total)];
    }
  }
}
