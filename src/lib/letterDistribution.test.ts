import { describe, expect, test } from "vitest";
import { LetterDistribution } from "./letterDistribution.js";

describe("LetterDistribution", () => {
  const dist = new LetterDistribution(
    [
      "aaaaaaaa",
      "bb",
      "ccc",
      "dddd",
      "eeeeeeeeeeeee",
      "ff",
      "gg",
      "hhhhhh",
      "iiiiiii",
      // .
      "k",
      "llll",
      "mm",
      "nnnnnnn",
      "oooooooo",
      "pp",
      // .
      "rrrrrr",
      "ssssss",
      "ttttttttt",
      "uuu",
      "v",
      "ww",
      // .
      "yy",
      // .
    ],
    false,
  );

  test("probUnordered", () => {
    expect(
      dist.probUnordered(Array.from("jjjjjqqqqqxxxxxzzzzz")).toNum(),
    ).toBeCloseTo(0);
    expect(
      dist.probUnordered(Array.from("alphabet")).toNum(),
    ).toMatchInlineSnapshot(`0.6628000000000001`);
  });

  test("outliers", () => {
    expect(dist.outliers(Array.from("jjjjjqqqqqxxxxxzzzzz"))).toEqual({
      high: ["j", "q", "x", "z"],
      low: [],
    });
  });

  test("probCommonOrdered", () => {
    expect(dist.probCommonOrdered(0, [3, 4, 5]).toNum()).toBe(1);
    expect(dist.probCommonOrdered(1, [3, 4, 5]).toNum()).toMatchInlineSnapshot(
      `0.28211077172174237`,
    );
    expect(dist.probCommonOrdered(3, [3, 4, 5]).toNum()).toMatchInlineSnapshot(
      `0.000006742477982379926`,
    );
  });
});
