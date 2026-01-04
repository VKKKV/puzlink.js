import { describe, expect, test } from "vitest";
import { answerLengthLogProbs } from "../data/answerLengths.js";
import { LengthDistribution } from "../lib/lengthDistribution.js";
import { testLinker } from "./index.js";
import { lengthLinker } from "./length.js";

describe("lengthLinker", () => {
  const link = testLinker(
    lengthLinker,
    LengthDistribution.parseLengths(answerLengthLogProbs),
  );

  test("length links", () => {
    expect(link(["aa", "bb", "cc"])).toMatchInlineSnapshot(`
      [
        [
          "all lengths equal",
          "aa 2
      bb 2
      cc 2",
        ],
        [
          "all lengths are even",
          "aa 2
      bb 2
      cc 2",
        ],
        [
          "all lengths are equal mod 3",
          "aa 2
      bb 2
      cc 2",
        ],
      ]
    `);
    expect(link(["a", "b", "cc", "dd"])).toMatchInlineSnapshot(`
      [
        [
          "only two lengths",
          "a  1
      b  1
      cc 2
      dd 2",
        ],
        [
          "lengths can be paired",
          "a  b  1
      cc dd 2",
        ],
      ]
    `);
    expect(link(["a", "bbbb", "fffffff"])).toMatchInlineSnapshot(`
      [
        [
          "all lengths are equal mod 3",
          "a       1
      bbbb    4
      fffffff 7",
        ],
      ]
    `);
    expect(link(["aa", "cccc", "bbb"])).toMatchInlineSnapshot(`
      [
        [
          "lengths are consecutive",
          "aa   2
      bbb  3
      cccc 4",
        ],
      ]
    `);
  });
});
