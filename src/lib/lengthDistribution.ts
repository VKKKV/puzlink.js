import { Distribution } from "./distribution.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { interval, windows } from "./util.js";

export class LengthDistribution {
  readonly distribution: Distribution<number>;
  private readonly distMod2: Distribution<number>;
  private readonly distMod3: Distribution<number>;
  /** Length such that 99.9% of answers have length less than this. */
  private readonly maxLength: number;

  constructor(distribution: Distribution<number>) {
    this.distribution = distribution;
    this.distMod2 = this.distribution.map((length) => length % 2);
    this.distMod3 = this.distribution.map((length) => length % 3);

    this.maxLength = Infinity;
    let totalProb = LogNum.from(0);
    for (const [length, freq] of distribution.entries()) {
      totalProb = totalProb.add(freq);
      if (totalProb.gt(LogNum.from(0.999))) {
        this.maxLength = length;
        break;
      }
    }
  }

  static from(data: [number, number][]): LengthDistribution {
    const map = new Map(
      data.map(([length, freq]) => [length, LogNum.fromExp(freq)]),
    );
    return new LengthDistribution(new Distribution(map));
  }

  /** Log probability that k words have the same length. */
  probEqual(k: number): LogNum {
    return this.distribution.probEqual(k);
  }

  /** Log probability that k words have the same length, except for one. */
  probAlmostEqual(k: number): LogNum {
    return this.distribution.probAlmostEqual(k);
  }

  /** Log probability that k words have the same length modulo 2. */
  probEqualMod2(k: number): LogNum {
    return this.distMod2.probEqual(k);
  }

  /** Log probability that k words have the same length modulo 3. */
  probEqualMod3(k: number): LogNum {
    return this.distMod3.probEqual(k);
  }

  /** Log probability that k words have consecutive lengths. */
  @memoize()
  probConsecutive(k: number): LogNum {
    if (k <= 1) {
      return LogNum.from(1);
    } else if (k > this.maxLength) {
      return LogNum.from(0);
    }

    const range = interval(1, this.maxLength).map((i) =>
      this.distribution.get(i),
    );
    const partials = Array.from(windows(range, k), (window) =>
      LogNum.prod(window),
    );

    return LogNum.fromFactorial(k).mul(LogNum.sum(partials));
  }

  /** Log probability that k words have exactly two distinct lengths. */
  probTwoDistinct(k: number): LogNum {
    return this.distribution.probTwoDistinct(k);
  }

  /**
   * Log probability that k words have distinct lengths, all at least min.
   */
  @memoize(2)
  probDistinct(k: number, min = 0): LogNum {
    if (k <= 0) {
      return LogNum.from(1);
    } else if (min > this.maxLength) {
      return LogNum.from(0);
    }

    const probs = [];
    for (const [length, freq] of this.distribution.entries()) {
      if (length < min) {
        continue;
      }
      probs.push(freq.mul(this.probDistinct(k - 1, length + 1)));
    }

    return probs.length === 0
      ? LogNum.from(0)
      : LogNum.from(k).mul(LogNum.sum(probs));
  }

  /** Log probability that k words can be paired by length. */
  probPaired(k: number): LogNum {
    if (k % 2 !== 0) {
      return LogNum.from(0);
    }
    return this.probDistinct(Math.floor(k / 2));
  }
}
