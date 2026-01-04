import { describe, expect, test } from "vitest";
import { Distribution } from "./distribution.js";
import { LengthDistribution } from "./lengthDistribution.js";

describe("LengthDistribution", () => {
  const dist = new LengthDistribution(Distribution.fromItems([2, 3, 3, 4]));

  test("probEqual", () => {
    expect(dist.probEqual(2).toNum()).toBeCloseTo(3 / 8);
    expect(dist.probEqualMod2(2).toNum()).toBeCloseTo(1 / 2);
    expect(dist.probEqualMod3(2).toNum()).toBeCloseTo(3 / 8);
  });

  test("probConsecutive", () => {
    // 2 and 3, in either order: 2! * 1/4 * 1/2 = 1/4
    // 3 and 4, in either order: 2! * 1/2 * 1/4 = 1/4
    expect(dist.probConsecutive(2).toNum()).toBeCloseTo(1 / 2);
    // 2, 3, and 4, in any order: 3! * 1/4 * 1/2 * 1/4 = 3/16
    expect(dist.probConsecutive(3).toNum()).toBeCloseTo(3 / 16);
  });

  test("probTwoDistinct", () => {
    // 2 and 3, in either order: 2! * 1/4 * 1/2 = 1/4
    // 3 and 4, in either order: 2! * 1/2 * 1/4 = 1/4
    // 2 and 4, in either order: 2! * 1/4 * 1/4 = 1/8
    expect(dist.probTwoDistinct(2).toNum()).toBeCloseTo(5 / 8);
    expect(dist.probTwoDistinct(3).toNum()).toBeCloseTo(21 / 32);
  });

  test("probDistinct", () => {
    // same as probTwoDistinct(2):
    expect(dist.probDistinct(2).toNum()).toBeCloseTo(5 / 8);
    // 2, 3, and 4, in any order: 3! * 1/4 * 1/2 * 1/4 = 3/16
    expect(dist.probDistinct(3).toNum()).toBeCloseTo(3 / 16);
    expect(dist.probDistinct(4).toNum()).toBeCloseTo(0);
  });
});
