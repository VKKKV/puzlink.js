import { LogNum } from "../lib/logNum.js";
import { interval, product, type TupleOf } from "../lib/util.js";
import { Vector, type Cone } from "./cone.js";

type MetricCache = {
  maxVector: number[];
  logProbs: Record<string, LogNum>;
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
        maxVector: number[];
        logProbs: Record<string, number>;
      }
    >,
  ) {
    this.useCache = true;
    this.metricLogProbs = {};
    for (const [name, { maxVector, logProbs }] of Object.entries(data)) {
      this.metricLogProbs[name] = { maxVector, logProbs: {} };
      for (const [vector, logProb] of Object.entries(logProbs)) {
        this.metricLogProbs[name].logProbs[vector] = LogNum.fromExp(logProb);
      }
    }
    this.wrapCompute = (_, fn) => fn();
  }

  *dump(): Generator<string> {
    yield `export const metricLogProbs: Record<string, Record<string, number>> = {`;
    for (const [name, { maxVector, logProbs }] of Object.entries(
      this.metricLogProbs,
    )) {
      yield `  "${name}": {`;
      yield `    "maxVector": [${maxVector.join(", ")}],`;
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

  total<Dimension extends number>(name: string, cone: Cone<Dimension>): LogNum {
    const { maxVector, logProbs } = this.metricLogProbs[name] ?? {};
    if (!maxVector || !logProbs) {
      throw new Error(`Unknown metric: ${name}; should call fill() first`);
    }
    const ranges = [];
    for (const d of interval(0, cone.vertex.dimension - 1)) {
      if (cone.strict[d]) {
        ranges.push([cone.vertex.get(d)]);
      } else {
        ranges.push(interval(cone.vertex.get(d), maxVector[d]!));
      }
    }
    const partials = [];
    for (const tuple of product(ranges)) {
      const vector = Vector.from(
        cone.vertex.dimension,
        tuple as TupleOf<Dimension, number>,
      );
      const logProb = logProbs[vector.toString()];
      if (logProb) {
        partials.push(logProb);
      }
    }
    return LogNum.sum(partials);
  }
}

/**
 * We wrap the log prob cache in a class so we can do stuff like print
 * debug output and whatever.
 */
export const ConeLogProbs = new LogProbCache({});
