import { describe, expect, test } from "vitest";
import { LetterDistribution } from "./letterDistribution.js";
import { Wordlist } from "./wordlist.js";

describe("LetterDistribution", () => {
  const dist = new LetterDistribution(
    Wordlist.from([
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
    ]),
  );

  test("prob", () => {
    expect(dist.prob("jjjjjqqqqqxxxxxzzzzz").toNum()).toBeCloseTo(0);
    expect(dist.prob("alphabet").toNum()).toMatchInlineSnapshot(`NaN`);
  });

  test("outliers", () => {
    expect(dist.outliers("jjjjjqqqqqxxxxxzzzzz")).toEqual({
      high: "jqxz",
      low: "",
    });
  });

  test("probCommonOrdered", () => {
    expect(dist.probCommonOrdered(0, [3, 4, 5]).toNum()).toBe(1);
    expect(dist.probCommonOrdered(1, [3, 4, 5]).toNum()).toMatchInlineSnapshot(
      `0.11659095599518708`,
    );
    expect(dist.probCommonOrdered(3, [3, 4, 5]).toNum()).toMatchInlineSnapshot(
      `3.527961440763506e-7`,
    );
  });
});
