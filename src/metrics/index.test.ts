import { describe, expect, test } from "vitest";
import { getFeatureRanges, type Metric } from "./index.js";

describe("getFeatureRanges", () => {
  test("usual", () => {
    const featureRanges = getFeatureRanges({} as Metric, [1, 3, 4, 7]);
    // {}
    expect(featureRanges.get(0n)).toEqual([
      { vertex: 2, strict: true },
      { vertex: 5, strict: true },
      { vertex: 6, strict: true },
      { vertex: 8, strict: false },
    ]);
    // { 1, 2, 3, 4 }
    expect(featureRanges.get(15n)).toEqual([{ vertex: 1, strict: false }]);
    // { 3, 4 }
    expect(featureRanges.get(12n)).toEqual([{ vertex: 4, strict: false }]);
  });

  test("special case", () => {
    expect(getFeatureRanges({} as Metric, [0, 0, 0, 0, 0])).toEqual(
      new Map([[31n, [{ vertex: 0, strict: true }]]]),
    );
  });
});
