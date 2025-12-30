import { describe, expect, test } from "vitest";
import { Cone, Vector } from "./cone.js";
import { power } from "../lib/util.js";

describe("Cone", () => {
  test("equals", () => {
    const cone = Cone.from(2, [1, 2], [false, true]);
    expect(cone.equals(cone)).toBe(true);
    expect(cone.equals(Cone.from(2, [1, 2], [false, true]))).toBe(true);
    expect(cone.equals(Cone.from(2, [1, 2], [true, false]))).toBe(false);
  });

  test("includes", () => {
    const cone = Cone.from(2, [1, 2], [false, true]);
    expect(cone.includes(Vector.from(2, [0, 1]))).toBe(false);
    expect(cone.includes(Vector.from(2, [0, 2]))).toBe(false);
    expect(cone.includes(Vector.from(2, [0, 3]))).toBe(false);
    expect(cone.includes(Vector.from(2, [1, 1]))).toBe(false);
    expect(cone.includes(Vector.from(2, [1, 2]))).toBe(true);
    expect(cone.includes(Vector.from(2, [1, 3]))).toBe(false);
    expect(cone.includes(Vector.from(2, [2, 1]))).toBe(false);
    expect(cone.includes(Vector.from(2, [2, 2]))).toBe(true);
    expect(cone.includes(Vector.from(2, [2, 3]))).toBe(false);
  });

  test("contains", () => {
    const cones = Array.from(power([false, true], 3), (t) =>
      Cone.from(3, [1, 2, 3], t),
    );
    expect(
      cones.map((other) =>
        Cone.from(3, [1, 2, 3], [false, true, true]).contains(other),
      ),
    ).toEqual([
      false,
      false,
      false,
      true, // [false, true, true]
      false,
      false,
      false,
      true, // [true, true, true]
    ]);
    expect(
      cones.map((other) =>
        Cone.from(3, [1, 2, 3], [false, true, false]).contains(other),
      ),
    ).toEqual([
      false,
      false,
      true, // [false, true, false]
      true, // [false, true, true]
      false,
      false,
      true, // [true, true, false]
      true, // [true, true, true]
    ]);
  });

  test("extrema", () => {
    const cones = Array.from(power([false, true], 3), (t) =>
      Cone.from(3, [1, 2, 3], t),
    );

    expect(Cone.maxima(cones)).toEqual([
      Cone.from(3, [1, 2, 3], [false, false, false]),
    ]);
    expect(Cone.extrema(cones)).toEqual([
      Cone.from(3, [1, 2, 3], [false, false, false]),
      Cone.from(3, [1, 2, 3], [true, true, true]),
    ]);
  });
});
