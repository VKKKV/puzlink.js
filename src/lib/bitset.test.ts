import { describe, expect, test } from "vitest";
import { Bitset } from "./bitset.js";

describe("Bitset", () => {
  test("from, equals", () => {
    const a = Bitset.from(new Set([0, 1, 2, 3]));
    const b = Bitset.from([3, 1, 0, 2]);
    const c = Bitset.from(new Set([0, 1, 2, 3, 4]));

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  test("count", () => {
    const a = Bitset.from(new Set([0, 1, 3]));
    expect(a.count()).toBe(3);
  });

  test("complement", () => {
    const a = Bitset.from(new Set([0, 1, 3]));
    expect(a.complement(4).count()).toBe(1);
    expect(a.complement(5).count()).toBe(2);
  });
});
