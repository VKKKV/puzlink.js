import { LogNum } from "./logNum.js";

function roundReplacer(_key: string, value: unknown): unknown {
  return typeof value === "number" ? Number(value.toFixed(3)) : value;
}

export abstract class KeyedCache<T> {
  useCache = true;
  cache: Record<string, T> = {};
  wrapCompute: (name: string, fn: () => T, existing: T | undefined) => T = (
    _,
    fn,
  ) => fn();

  abstract dump(): string;

  abstract repr(value: T): string;

  fill(name: string, compute: () => T): void {
    const known = this.cache[name];
    if (this.useCache && known) {
      return;
    }
    this.cache[name] = this.wrapCompute(name, compute, known);
  }
}

/** A feature's base rate conditioned on slug length. */
export class FeatureLogProbCache extends KeyedCache<LogNum[]> {
  constructor(data: Record<string, (number | null)[]>) {
    super();
    for (const [name, logProbs] of Object.entries(data)) {
      this.cache[name] = logProbs.map((logProb) => LogNum.fromJSON(logProb));
    }
  }

  dump() {
    return JSON.stringify(this.cache, roundReplacer, 2);
  }

  repr(value: LogNum[]): string {
    return `[${value.map((x) => x.toLog().toFixed(3)).join(", ")}]`;
  }

  get(name: string, length: number): LogNum {
    const logProbs = this.cache[name];
    if (!logProbs) {
      throw new Error(`Unknown feature: ${name}; should call fill() first`);
    }
    // logProbs[0] is the overall base rate:
    return logProbs[length] ?? logProbs[0]!;
  }
}

/** A metric's score distribution conditioned on slug length. */
export class MetricLogProbCache extends KeyedCache<LogNum[][]> {
  constructor(data: Record<string, (number | null)[][]>) {
    super();
    for (const [name, byLength] of Object.entries(data)) {
      this.cache[name] = byLength.map((logProbs) =>
        logProbs.map((logProb) => LogNum.fromJSON(logProb)),
      );
    }
  }

  dump() {
    return JSON.stringify(this.cache, roundReplacer, 2);
  }

  repr(value: LogNum[][]): string {
    return `[${value
      .map((row) => `[${row.map((x) => x.toLog().toFixed(3)).join(", ")}]`)
      .join(", ")}]`;
  }

  get(
    name: string,
    length: number,
    { vertex, strict }: { vertex: number; strict: boolean },
  ): LogNum {
    const byLength = this.cache[name];
    if (!byLength) {
      throw new Error(`Unknown metric: ${name}; should call fill() first`);
    }
    // byLength[0] is the overall base rate:
    const logProbs = byLength[length]?.length ? byLength[length] : byLength[0]!;
    if (strict) {
      return logProbs[vertex] ?? LogNum.from(0);
    }
    return LogNum.sum(logProbs.slice(vertex));
  }
}
