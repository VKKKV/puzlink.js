import { cumulativeStdNormalProbability as normCdf } from "simple-statistics";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";

/** A probability distribution of items. */
export class Distribution<T extends PropertyKey> {
  private readonly frequencies: ReadonlyMap<T, LogNum>;
  private readonly momentCache = new Map<number, LogNum>();

  constructor(frequencies: ReadonlyMap<T, LogNum>) {
    this.frequencies = frequencies;
    this.momentCache = new Map();
  }

  static from(data: string): Distribution<string>;
  static from<T extends PropertyKey>(data: readonly T[]): Distribution<T>;
  static from<T extends PropertyKey>(counter: LogCounter<T>): Distribution<T>;
  static from(data: string | readonly PropertyKey[] | LogCounter<PropertyKey>) {
    const counter =
      data instanceof LogCounter ? data : LogCounter.from(data as string);
    return new Distribution(new Map(counter.frequencies()));
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
  moment(k: number): LogNum {
    const cached = this.momentCache.get(k);
    if (cached) {
      return cached;
    }

    const result = LogNum.sum(
      Array.from(this.frequencies.values(), (freq) => freq.pow(k)),
    );

    this.momentCache.set(k, result);
    return result;
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
  probTwoDistinct(k: number): LogNum {
    const probs = [];
    for (let i = 0; i <= k; i++) {
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
      const nfreq = n.mul(freq);
      partials.push(nfreq.absSub(observed.get(item)).pow(2).div(nfreq));
    }
    return LogNum.sum(partials);
  }

  /** Log probability of an observed distribution, via chi-squared. */
  prob(observed: LogCounter<T>): LogNum {
    const df = this.frequencies.size - 1;
    const z = (this.chi2(observed).toNum() - df) / Math.sqrt(2 * df);
    return LogNum.from(1 - normCdf(z));
  }

  /** Over- and under-represented items, at 3 sigma. */
  outliers(observed: LogCounter<T>): {
    high: Record<T, LogNum>;
    low: Record<T, LogNum>;
  } {
    const n = observed.total;
    const low = {} as Record<T, LogNum>;
    const high = {} as Record<T, LogNum>;

    for (const [item, freq] of this.frequencies) {
      const expected = n.mul(freq);
      const actual = observed.get(item);

      if (expected.absSub(actual).pow(2).gt(LogNum.from(4))) {
        if (expected.gt(actual)) {
          low[item] = expected.sub(actual);
        } else {
          high[item] = actual.sub(expected);
        }
      }
    }

    const difference = observed.difference(Array.from(this.frequencies.keys()));
    for (const item of difference) {
      const expected = LogNum.from(0);
      const actual = observed.get(item);

      if (expected.absSub(actual).pow(2).gt(LogNum.from(4))) {
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
