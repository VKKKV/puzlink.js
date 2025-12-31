import { cumulativeStdNormalProbability as normCdf } from "simple-statistics";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { interval } from "./util.js";

/** A probability distribution of items. */
export class Distribution<T extends PropertyKey> {
  private readonly frequencies: ReadonlyMap<T, LogNum>;

  constructor(frequencies: ReadonlyMap<T, LogNum>) {
    this.frequencies = frequencies;
  }

  static from(data: string): Distribution<string>;
  static from<T extends PropertyKey>(data: readonly T[]): Distribution<T>;
  static from<T extends PropertyKey>(counter: LogCounter<T>): Distribution<T>;
  static from(data: string | readonly PropertyKey[] | LogCounter<PropertyKey>) {
    const counter =
      data instanceof LogCounter ? data : LogCounter.from(data as string);
    return new Distribution(new Map(counter.frequencies()));
  }

  static parse(dumped: Record<string, number | null>): Distribution<string> {
    const frequencies = new Map<string, LogNum>();
    for (const [item, freq] of Object.entries(dumped)) {
      frequencies.set(item, LogNum.fromJSON(freq));
    }
    return new Distribution(frequencies);
  }

  dump(): Record<T, number | null> {
    const result = {} as Record<T, number | null>;
    for (const [item, freq] of this.frequencies) {
      result[item] = freq.toJSON();
    }
    return result;
  }

  /** Get the frequency of the given item. */
  get(item: T): LogNum {
    return this.frequencies.get(item) ?? LogNum.from(0);
  }

  /** Returns an iterable of [item, log probability] pairs. */
  entries(): IterableIterator<[T, LogNum]> {
    return this.frequencies.entries();
  }

  /** k-th moment of the distribution. */
  @memoize()
  moment(k: number): LogNum {
    return LogNum.sum(
      Array.from(this.frequencies.values(), (freq) => freq.pow(k)),
    );
  }

  /** Log probability that k items drawn from the distribution are all equal. */
  probEqual(k: number): LogNum {
    if (k <= 0) {
      return LogNum.from(1);
    }
    return this.moment(k);
  }

  /**
   * Log probability that k items drawn from the distribution have two distinct
   * values.
   */
  @memoize()
  probTwoDistinct(k: number): LogNum {
    const probs = [];
    for (const i of interval(0, k)) {
      const j = k - i;
      probs.push(
        LogNum.fromBinomial(k, i).mul(this.probEqual(i)).mul(this.probEqual(j)),
      );
    }
    // Case where all are equal is counted 2^k times; others are counted twice:
    return LogNum.sum(probs)
      .sub(LogNum.from(2).pow(k).mul(this.probEqual(k)))
      .div(LogNum.from(2));
  }

  /**
   * Log probability that k items drawn from the distribution are all equal,
   * with exactly one exception.
   */
  @memoize()
  probAlmostEqual(k: number): LogNum {
    const probs = [];
    for (const [, freq] of this.frequencies) {
      probs.push(
        this.moment(k - 1)
          .sub(freq.pow(k - 1))
          .mul(freq)
          .mul(LogNum.from(k)),
      );
    }
    return LogNum.sum(probs);
  }

  /** Map the items of the distribution, returning the new distribution. */
  map<U extends PropertyKey>(fn: (item: T) => U): Distribution<U> {
    const frequencies = new Map<U, LogNum>();
    for (const [item, freq] of this.frequencies) {
      const mapped = fn(item);
      frequencies.set(
        mapped,
        (frequencies.get(mapped) ?? LogNum.from(0)).add(freq),
      );
    }
    return new Distribution(frequencies);
  }

  /** Chi-squared test statistic against an observed distribution. */
  chi2(observed: LogCounter<T>): LogNum {
    for (const [item] of observed.entries()) {
      if (!this.frequencies.has(item)) {
        return LogNum.from(Infinity);
      }
    }
    const n = observed.total;
    const partials = [];
    for (const [item, freq] of this.frequencies) {
      const expected = n.mul(freq);
      const actual = observed.get(item);
      // Under chi-squared assumptions, the (expected - actual)^2/expected
      // should be iid N(0, 1)^2.
      partials.push(expected.absSub(actual).pow(2).div(expected));
    }
    return LogNum.sum(partials);
  }

  /** Log probability that an unordered distribution is drawn from this. */
  probUnordered(observed: LogCounter<T>): LogNum {
    const df = this.frequencies.size - 1;
    const z = (this.chi2(observed).toNum() - df) / Math.sqrt(2 * df);
    return LogNum.from(1 - normCdf(z));
  }

  /** Over- and under-represented items, at the given sigma. */
  outliers(
    observed: LogCounter<T>,
    sigma = 2,
  ): {
    high: Record<T, LogNum>;
    low: Record<T, LogNum>;
  } {
    const n = observed.total;
    const low = {} as Record<T, LogNum>;
    const high = {} as Record<T, LogNum>;

    const keys = [
      ...this.frequencies.keys(),
      ...observed.filterKeys((key) => !this.frequencies.has(key)),
    ];
    const threshold = LogNum.from(sigma ** 2);

    for (const item of keys) {
      const freq = this.frequencies.get(item) ?? LogNum.from(0);
      const expected = n.mul(freq);
      const actual = observed.get(item);

      // We assume (expected - actual)^2/expected should be distributed as
      // N(0, 1)^2; thus if it's over sigma^2, it's an outlier.
      if (expected.absSub(actual).pow(2).div(expected).gt(threshold)) {
        if (expected.gt(actual)) {
          low[item] = expected.sub(actual);
        } else {
          high[item] = actual.sub(expected);
        }
      }
    }

    return { high, low };
  }
}
