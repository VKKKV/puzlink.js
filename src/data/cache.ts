import featureLogProbs from "./cache/featureLogProbs.json" with { type: "json" };
import letterDistribution from "./cache/letterDistribution.json" with { type: "json" };
import metricLogProbs from "./cache/metricLogProbs.json" with { type: "json" };

export const cache = {
  featureLogProbs,
  letterDistribution,
  metricLogProbs,
} as unknown as {
  // Loosen types for TS speed.
  featureLogProbs?: Record<string, number | null>;
  letterDistribution?: {
    letterCount: Record<string, number | null>;
    lengthToProbs: [number, { word: number | null; anagram: number | null }][];
  };
  metricLogProbs?: Record<string, (number | null)[]>;
};
