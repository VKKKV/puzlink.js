import { describe, expect, test } from "vitest";
import { getFeatureCones } from "./index.js";
import { Cone, Vector } from "./cone.js";

describe("metrics", () => {
  test("getFeatureCones", () => {
    const featureCones = getFeatureCones(
      2,
      // This looks like:
      //   5
      //     3 4
      //   1 2
      new Map([
        [1n, Vector.from(2, [0, 0])],
        [2n, Vector.from(2, [1, 0])],
        [4n, Vector.from(2, [1, 1])],
        [8n, Vector.from(2, [2, 1])],
        [16n, Vector.from(2, [0, 2])],
      ]),
    );
    // {}
    expect(featureCones.get(0n)).toEqual([
      Cone.from(2, [0, 3], [false, false]),
      Cone.from(2, [1, 2], [false, false]),
      Cone.from(2, [3, 0], [false, false]),
      Cone.from(2, [2, 0], [false, true]),
      Cone.from(2, [0, 1], [true, true]),
    ]);
    // { 1, 2 }
    expect(featureCones.get(3n)).toEqual([Cone.from(2, [0, 0], [false, true])]);
    // { 3, 4, 5 }
    expect(featureCones.get(28n)).toEqual([
      Cone.from(2, [0, 1], [false, false]),
    ]);
    // { 1, 2, 3, 4, 5 }
    expect(featureCones.get(31n)).toEqual([
      Cone.from(2, [0, 0], [false, false]),
    ]);
  });
});
