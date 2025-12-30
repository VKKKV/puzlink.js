import { describe, expect, test } from "vitest";
import { getFeatureCones } from "./index.js";

describe("metrics", () => {
  test("getFeatureCones", () => {
    const featureCones = getFeatureCones(
      new Map([
        [1, 1n],
        [3, 2n],
        [4, 4n],
        [7, 8n],
      ]),
    );
    // {}
    expect(featureCones.get(0n)).toEqual([
      { vertex: 2, strict: true },
      { vertex: 5, strict: true },
      { vertex: 6, strict: true },
      { vertex: 8, strict: false },
    ]);
    // { 1, 2, 3, 4 }
    expect(featureCones.get(15n)).toEqual([{ vertex: 1, strict: false }]);
    // { 3, 4 }
    expect(featureCones.get(12n)).toEqual([{ vertex: 4, strict: false }]);
  });
});
