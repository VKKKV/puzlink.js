/** A map from items to counts. */
export class Counter<T extends PropertyKey> {
  private readonly counts: Map<T, number>;

  constructor(counts?: Map<T, number>, totalCache?: number) {
    this.counts = counts ?? new Map<T, number>();
    this.totalCache = totalCache;
  }

  static from(data: string): Counter<string>;
  static from<T extends PropertyKey>(data: Iterable<T>): Counter<T>;
  static from(data: string | Iterable<PropertyKey>) {
    const counts = new Map<PropertyKey, number>();
    let total = 0;

    for (const item of data) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
      total += 1;
    }

    return new Counter(counts, total);
  }

  /** Add the given item to the counter. */
  addOne(item: T): void {
    this.counts.set(item, (this.counts.get(item) ?? 0) + 1);
    if (this.totalCache !== undefined) {
      this.totalCache += 1;
    }
  }

  /** Add the given items to the counter. */
  addMany(data: Iterable<T>): void {
    this.totalCache = undefined;
    for (const item of data) {
      this.counts.set(item, (this.counts.get(item) ?? 0) + 1);
    }
  }

  /** The number of distinct items. */
  get distinct(): number {
    return this.counts.size;
  }

  private totalCache: number | undefined;

  /** The total number of all items. */
  get total(): number {
    return (this.totalCache ??= Array.from(this.counts.values()).reduce(
      (a, b) => a + b,
      0,
    ));
  }

  /** The count of the given item. */
  get(item: T): number {
    return this.counts.get(item) ?? 0;
  }

  /** Returns an iterable of [item, count] pairs. */
  entries(): IterableIterator<[T, number]> {
    return this.counts.entries();
  }

  /** Returns a list of items that satisfy the given predicate. */
  filterKeys(fn: (item: T, count: number) => boolean): T[] {
    return Array.from(this.counts.entries())
      .filter(([item, count]) => fn(item, count))
      .map(([item]) => item);
  }
}
