import { LogNum } from "./logNum.js";

export abstract class LogProbCache<T> {
  useCache = true;
  cache: Record<string, T> = {};
  wrapCompute: (name: string, fn: () => T, existing: T | undefined) => T = (
    _,
    fn,
  ) => fn();

  abstract dump(): Generator<string>;

  abstract repr(value: T): string;

  fill(name: string, compute: () => T): void {
    const known = this.cache[name];
    if (this.useCache && known) {
      return;
    }
    this.cache[name] = this.wrapCompute(name, compute, known);
  }
}

export class FeatureLogProbCache extends LogProbCache<LogNum> {
  constructor(data: Record<string, number>) {
    super();
    for (const [name, logProb] of Object.entries(data)) {
      this.cache[name] = LogNum.fromExp(logProb);
    }
  }

  *dump(): Generator<string> {
    yield `export const featureLogProbs: Record<string, number> = {`;
    for (const [name, logProb] of Object.entries(this.cache)) {
      yield `  "${name}": ${logProb.toLog().toString()},`;
    }
    yield `};`;
  }

  repr(value: LogNum): string {
    return value.toLog().toFixed(3);
  }

  get(name: string): LogNum {
    const logProb = this.cache[name];
    if (!logProb) {
      throw new Error(`Unknown feature: ${name}; should call fill() first`);
    }
    return logProb;
  }
}

export class MetricLogProbCache extends LogProbCache<LogNum[]> {
  constructor(data: Record<string, number[]>) {
    super();
    for (const [name, logProbs] of Object.entries(data)) {
      this.cache[name] = logProbs.map((logProb) => LogNum.fromExp(logProb));
    }
  }

  *dump(): Generator<string> {
    yield `export const metricLogProbs: Record<string, number[]> = {`;
    for (const [name, logProbs] of Object.entries(this.cache)) {
      yield `  "${name}": [`;
      for (const logProb of logProbs) {
        yield `    ${logProb.toLog().toString()},`;
      }
      yield `  ],`;
    }
    yield `};`;
  }

  repr(value: LogNum[]): string {
    return `[${value.map((x) => x.toLog().toFixed(3)).join(", ")}]`;
  }

  get(name: string, vertex: number, strict: boolean): LogNum {
    const logProbs = this.cache[name];
    if (!logProbs) {
      throw new Error(`Unknown metric: ${name}; should call fill() first`);
    }
    if (strict) {
      return logProbs[vertex] ?? LogNum.from(0);
    }
    return LogNum.sum(logProbs.slice(vertex));
  }
}
