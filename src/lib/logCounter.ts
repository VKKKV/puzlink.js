import { DefaultMap } from "./defaultMap.js";
import { LogNum } from "./logNum.js";

/** A map from items to log counts. */
export class LogCounter<T> extends DefaultMap<T, LogNum> {
  private totalCache: LogNum | undefined;

  constructor(
    entries?: Iterable<readonly [T, LogNum]> | null,
    totalCache?: LogNum,
  ) {
    super(() => LogNum.from(0), entries);
    this.totalCache = totalCache;
  }

  static from(data: string): LogCounter<string>;
  static from<T>(data: Iterable<T>): LogCounter<T>;
  static from<T, U>(data: Iterable<U>, map: (item: U) => T): LogCounter<T>;
  static from(data: string | Iterable<unknown>) {
    const counts = new DefaultMap<unknown, number>(() => 0);
    let total = 0;

    for (const item of data) {
      counts.set(item, counts.get(item) + 1);
      total++;
    }

    return new LogCounter(
      counts.mapValues((count) => LogNum.from(count)),
      LogNum.from(total),
    );
  }

  /** The total number of all items. */
  get total(): LogNum {
    return (this.totalCache ??= LogNum.sum(Array.from(this.values())));
  }

  /** The (relative) frequency of each item. */
  frequencies(): DefaultMap<T, LogNum> {
    return this.mapValues((count) => count.div(this.total));
  }
}
