import { describe, expect, test } from "vitest";
import { caesar, interval, mapProduct, windows } from "./util.js";

describe("util", () => {
  test("mapProduct, interval", () => {
    expect(interval(0, 5, 2)).toEqual([0, 2, 4]);

    const fn = (a: number, b: number) => a + b;
    expect(Array.from(mapProduct(fn, [0, 5], interval(0, 4)))).toEqual(
      interval(0, 9),
    );
  });

  test("caesar", () => {
    expect(caesar("abcxyz", 1)).toBe("bcdyza");
    expect(caesar("abcxyz", 27)).toBe("bcdyza");
    expect(caesar("abcxyz", -1)).toBe("zabwxy");
    expect(caesar("abcxyz", -27)).toBe("zabwxy");
  });

  test("windows", () => {
    expect(Array.from(windows("abcdef", 3), (w) => w.join(""))).toEqual([
      "abc",
      "bcd",
      "cde",
      "def",
    ]);
  });
});
