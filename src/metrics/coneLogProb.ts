import { metricLogProbs } from "../data/metricLogProbs.js";
import { LogNum } from "../lib/logNum.js";
import { interval } from "../lib/util.js";

type MetricCache = {
  maxVector: number;
  logProbs: Record<number, LogNum>;
};

class LogProbCache {
  useCache: boolean;
  metricLogProbs: Record<string, MetricCache>;
  wrapCompute: (
    name: string,
    fn: () => MetricCache,
    existing: MetricCache | undefined,
  ) => MetricCache;

  constructor(
    data: Record<
      string,
      {
        maxVector: number;
        logProbs: Record<number, number>;
      }
    >,
  ) {
    this.useCache = true;
    this.metricLogProbs = {};
    for (const [name, { maxVector, logProbs }] of Object.entries(data)) {
      this.metricLogProbs[name] = { maxVector, logProbs: {} };
      for (const [vector, logProb] of Object.entries(logProbs)) {
        this.metricLogProbs[name].logProbs[vector as unknown as number] =
          LogNum.fromExp(logProb);
      }
    }
    this.wrapCompute = (_, fn) => fn();
  }

  *dump(): Generator<string> {
    yield `export const metricLogProbs: Record<string, { maxVector: number; logProbs: Record<number, number>; }> = {`;
    for (const [name, { maxVector, logProbs }] of Object.entries(
      this.metricLogProbs,
    )) {
      yield `  "${name}": {`;
      yield `    "maxVector": ${maxVector.toString()},`;
      yield `    "logProbs": {`;
      for (const [vector, logProb] of Object.entries(logProbs)) {
        yield `      "${vector}": ${logProb.toLog().toString()},`;
      }
      yield `    },`;
      yield `  },`;
    }
    yield `};`;
  }

  fill(name: string, compute: () => MetricCache): void {
    const knownLogProbs = this.metricLogProbs[name];
    if (this.useCache && knownLogProbs) {
      return;
    }
    this.metricLogProbs[name] = this.wrapCompute(
      name,
      compute,
      this.metricLogProbs[name],
    );
  }

  total(name: string, vertex: number, strict: boolean): LogNum {
    const { maxVector, logProbs } = this.metricLogProbs[name] ?? {};
    if (!maxVector || !logProbs) {
      throw new Error(`Unknown metric: ${name}; should call fill() first`);
    }
    if (strict) {
      return logProbs[vertex] ?? LogNum.from(0);
    }
    return LogNum.sum(
      interval(vertex, maxVector).flatMap((i) =>
        logProbs[i] ? [logProbs[i]] : [],
      ),
    );
  }
}

/**
 * We wrap the log prob cache in a class so we can do stuff like print
 * debug output and whatever.
 */
export const ConeLogProbs = new LogProbCache(metricLogProbs);
