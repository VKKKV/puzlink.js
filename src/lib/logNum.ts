import { zipfToLogProb } from "cromulence";
import { gammaln } from "simple-statistics";
import { memoize } from "./memoize.js";
import { interval } from "./util.js";

/**
 * A numerically-stable-ish log(1 - exp(x)).
 *
 * Follows the algorithm in <https://cran.r-project.org/web/packages/Rmpfr/vignettes/log1mexp-note.pdf>.
 */
function log1mExp(x: number): number {
  return x > -Math.log(2) ? Math.log1p(-Math.exp(x)) : Math.log(-Math.expm1(x));
}

/**
 * A numerically-stable-ish log of a non-negative number. Operations represent
 * operations on the numbers, not the log numbers.
 *
 * @example LogNum.from(2).add(LogNum.from(3)).toNum() // 5
 */
export class LogNum {
  private readonly data: number;

  /** Construct from the actual log number. */
  constructor(data: number) {
    this.data = data;
  }

  static from(value: number): LogNum {
    return new LogNum(Math.log(value));
  }

  static fromExp(value: number): LogNum {
    return new LogNum(value);
  }

  static fromFraction(numerator: number, denominator: number): LogNum {
    return new LogNum(Math.log(numerator) - Math.log(denominator));
  }

  @memoize(2)
  static fromBinomial(n: number, k: number): LogNum {
    if (n === 0 || k === 0 || k === n) {
      return LogNum.from(1);
    }

    return LogNum.fromBinomial(n - 1, k - 1).add(LogNum.fromBinomial(n - 1, k));
  }

  static fromZipf(zipf: number): LogNum {
    return new LogNum(zipfToLogProb(zipf));
  }

  static fromFactorial(n: number): LogNum {
    return new LogNum(gammaln(n + 1));
  }

  toNum(): number {
    return Math.exp(this.data);
  }

  toLog(): number {
    return this.data;
  }

  exp(): LogNum {
    return new LogNum(Math.exp(this.data));
  }

  log(): LogNum {
    return LogNum.from(this.data);
  }

  pow(power: number): LogNum {
    return new LogNum(this.data * power);
  }

  mul(other: LogNum): LogNum {
    return new LogNum(this.data + other.data);
  }

  div(other: LogNum): LogNum {
    return new LogNum(this.data - other.data);
  }

  add(other: LogNum): LogNum {
    let [max, min] = [this.data, other.data];
    if (max < min) {
      [max, min] = [min, max];
    }
    if (min === -Infinity) {
      return new LogNum(max);
    }
    return new LogNum(max + Math.log1p(Math.exp(min - max)));
  }

  absSub(other: LogNum): LogNum {
    let [max, min] = [this.data, other.data];
    if (max < min) {
      [max, min] = [min, max];
    }
    return new LogNum(max + log1mExp(min - max));
  }

  sub(other: LogNum): LogNum {
    if (this.lt(other)) {
      throw new Error(
        `log underflow: ${this.data.toString()} - ${other.data.toString()}`,
      );
    }
    const [max, min] = [this.data, other.data];
    return new LogNum(max + log1mExp(min - max));
  }

  gt(other: LogNum): boolean {
    return this.data > other.data;
  }

  lt(other: LogNum): boolean {
    return this.data < other.data;
  }

  static max(values: LogNum[]): LogNum {
    return new LogNum(Math.max(...values.map((x) => x.data)));
  }

  static min(values: LogNum[]): LogNum {
    return new LogNum(Math.min(...values.map((x) => x.data)));
  }

  static sum(values: LogNum[]): LogNum {
    // Strip zeroes first:
    values = values.filter((x) => x.data !== -Infinity);
    const max = Math.max(...values.map((x) => x.data));
    if (max === Infinity) {
      return new LogNum(Infinity);
    }
    const expSum = values.reduce((acc, x) => acc + Math.exp(x.data - max), 0);
    return new LogNum(max + Math.log(expSum));
  }

  static prod(values: LogNum[]): LogNum {
    return new LogNum(values.reduce((acc, x) => acc + x.data, 0));
  }

  static binomialProb(
    successes: number,
    trials: number,
    frequency: LogNum,
  ): LogNum {
    return LogNum.fromBinomial(trials, successes).mul(
      frequency.pow(successes).mul(
        LogNum.from(1)
          .sub(frequency)
          .pow(trials - successes),
      ),
    );
  }

  static binomialPValue(
    successes: number,
    trials: number,
    frequency: LogNum,
  ): LogNum {
    const expected = trials * frequency.toNum();
    const probs = [];

    if (successes > expected) {
      for (const i of interval(successes, trials)) {
        probs.push(LogNum.binomialProb(i, trials, frequency));
      }
    } else {
      for (const i of interval(0, successes)) {
        probs.push(LogNum.binomialProb(i, trials, frequency));
      }
    }

    return LogNum.sum(probs);
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `LogNum(${this.data.toFixed(3)}: ${this.toNum().toString()})`;
  }
}
