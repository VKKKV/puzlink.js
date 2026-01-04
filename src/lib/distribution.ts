import { cumulativeStdNormalProbability as normCdf } from "simple-statistics";
import { DefaultMap, ReadonlyDefaultMap } from "./defaultMap.js";
import { LogCounter } from "./logCounter.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { interval } from "./util.js";

/** A probability distribution of items. */
export class Distribution<T> extends ReadonlyDefaultMap<T, LogNum> {
  constructor(frequencies: ReadonlyMap<T, LogNum>) {
    super(() => LogNum.from(0), frequencies);
  }

  static fromItems(data: string): Distribution<string>;
  static fromItems<T>(data: readonly T[]): Distribution<T>;
  static fromItems(data: string | readonly unknown[]) {
    const counter = LogCounter.from(data as string);
    return new Distribution(new Map(counter.frequencies()));
  }

  static fromCounts<T>(
    counter: ReadonlyMap<T, number> | ReadonlyMap<T, LogNum> | LogCounter<T>,
  ): Distribution<T> {
    if (counter instanceof LogCounter) {
      return new Distribution(new Map(counter.frequencies()));
    }

    const isLogNum = (
      counter: ReadonlyMap<T, number> | ReadonlyMap<T, LogNum>,
    ): counter is ReadonlyMap<T, LogNum> => {
      return (
        Array.from(
          counter.values() as MapIterator<number | LogNum>,
        )[0] instanceof LogNum
      );
    };

    const frequencies = new Map<T, LogNum>();
    if (isLogNum(counter)) {
      const total = LogNum.sum(Array.from(counter.values()));
      for (const [item, count] of counter) {
        frequencies.set(item, count.div(total));
      }
    } else {
      const total = Array.from(counter.values()).reduce((a, b) => a + b, 0);
      for (const [item, count] of counter) {
        frequencies.set(item, LogNum.fromFraction(count, total));
      }
    }
    return new Distribution(frequencies);
  }

  static parse<T>(dumped: [T, number | null][]): Distribution<T> {
    const frequencies = new Map<T, LogNum>();
    for (const [item, freq] of dumped) {
      frequencies.set(item, LogNum.fromJSON(freq));
    }
    return new Distribution(frequencies);
  }

  dump(): [T, number | null][] {
    return Array.from(this.entries(), ([item, freq]) => [item, freq.toJSON()]);
  }

  /** k-th moment of the distribution. */
  @memoize(1)
  moment(k: number): LogNum {
    return LogNum.sum(Array.from(this.values(), (freq) => freq.pow(k)));
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
  @memoize(1)
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
  @memoize(1)
  probAlmostEqual(k: number): LogNum {
    const probs = [];
    for (const freq of this.values()) {
      probs.push(
        this.moment(k - 1)
          .sub(freq.pow(k - 1))
          .mul(freq)
          .mul(LogNum.from(k)),
      );
    }
    return LogNum.sum(probs);
  }

  /**
   * Map the items of the distribution, keeping values constant, and summing
   * values mapped to the same item. Returns the new distribution.
   */
  mapItems<U>(fn: (item: T) => U): Distribution<U> {
    const frequencyPartials = new DefaultMap<U, LogNum[]>(() => []);
    for (const [item, freq] of this.entries()) {
      const mapped = fn(item);
      frequencyPartials.get(mapped).push(freq);
    }
    return new Distribution(
      frequencyPartials.mapValues((partials) => LogNum.sum(partials)),
    );
  }

  /**
   * Re-weight the distribution by multiplying each item's frequency by the
   * given function, then normalizing.
   */
  reweight(fn: (item: T) => LogNum): Distribution<T> {
    const unnormalized = new DefaultMap<T, LogNum>(() => LogNum.from(0));
    const partials: LogNum[] = [];
    for (const [item, freq] of this.entries()) {
      const weighed = freq.mul(fn(item));
      unnormalized.set(item, weighed);
      partials.push(weighed);
    }
    const total = LogNum.sum(partials);
    return new Distribution(unnormalized.mapValues((freq) => freq.div(total)));
  }

  /** Chi-squared test statistic against an observed distribution. */
  chi2(observed: LogCounter<T>): LogNum {
    for (const [item] of observed.entries()) {
      if (!this.has(item)) {
        return LogNum.from(Infinity);
      }
    }
    const n = observed.total;
    const partials = [];
    for (const [item, freq] of this.entries()) {
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
    const df = this.size - 1;
    const z = (this.chi2(observed).toNum() - df) / Math.sqrt(2 * df);
    return LogNum.from(1 - normCdf(z));
  }

  /** Over- and under-represented items, at the given sigma. */
  outliers(
    observed: LogCounter<T>,
    sigma = 2,
  ): {
    high: Map<T, LogNum>;
    low: Map<T, LogNum>;
  } {
    const n = observed.total;
    const low = new Map<T, LogNum>();
    const high = new Map<T, LogNum>();

    const keys = [
      ...this.keys(),
      ...Array.from(observed.keys()).filter((key) => !this.has(key)),
    ];
    const threshold = LogNum.from(sigma ** 2);

    for (const item of keys) {
      const freq = this.get(item);
      const expected = n.mul(freq);
      const actual = observed.get(item);

      // We assume (expected - actual)^2/expected should be distributed as
      // N(0, 1)^2; thus if it's over sigma^2, it's an outlier.
      if (expected.absSub(actual).pow(2).div(expected).gt(threshold)) {
        if (expected.gt(actual)) {
          low.set(item, expected.sub(actual));
        } else {
          high.set(item, actual.sub(expected));
        }
      }
    }

    return { high, low };
  }
}
