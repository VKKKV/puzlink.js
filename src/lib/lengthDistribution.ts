import { Distribution } from "./distribution.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { interval, windows } from "./util.js";

export class LengthDistribution extends Distribution<number> {
  /** Length such that 99.9% of answers have length less than this. */
  private readonly maxLength: number;

  constructor(frequencies: ReadonlyMap<number, LogNum>) {
    super(frequencies);

    this.maxLength = Infinity;
    let totalProb = LogNum.from(0);
    for (const [length, freq] of this.entries()) {
      totalProb = totalProb.add(freq);
      if (totalProb.gt(LogNum.from(0.999))) {
        this.maxLength = length;
        break;
      }
    }
  }

  static parseLengths(dumped: [number, number | null][]): LengthDistribution {
    return new LengthDistribution(Distribution.parse(dumped));
  }

  /** Distribution of lengths modulo n. */
  @memoize()
  private mod(n: number) {
    return this.mapItems((length) => length % n);
  }

  /** Log probability that k words have the same length modulo 2. */
  probEqualMod2(k: number): LogNum {
    return this.mod(2).probEqual(k);
  }

  /** Log probability that k words have the same length modulo 3. */
  probEqualMod3(k: number): LogNum {
    return this.mod(3).probEqual(k);
  }

  /** Log probability that k words have consecutive lengths. */
  @memoize()
  probConsecutive(k: number): LogNum {
    if (k <= 1) {
      return LogNum.from(1);
    } else if (k > this.maxLength) {
      return LogNum.from(0);
    }

    const range = interval(1, this.maxLength).map((i) => this.get(i));
    const partials = Array.from(windows(range, k), (window) =>
      LogNum.prod(window),
    );

    return LogNum.fromFactorial(k).mul(LogNum.sum(partials));
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
    for (const [length, freq] of this.entries()) {
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
