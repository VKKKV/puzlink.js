import { describe, expect, test } from "vitest";
import { answerLengthLogProbs } from "../data/answerLengths.js";
import { Distribution } from "../lib/distribution.js";
import { LengthDistribution } from "../lib/lengthDistribution.js";
import { testLinkOptions } from "./index.js";
import { lengthLinker } from "./length.js";

describe("lengthLinker", () => {
  const link = (slugs: string[]) =>
    lengthLinker(new LengthDistribution(new Distribution(answerLengthLogProbs)))
      .eval(slugs, testLinkOptions)
      .map((l) => [l.name, ...l.description]);

  test("length links", () => {
    expect(link(["aa", "bb", "cc"])).toMatchInlineSnapshot(`
      [
        [
          "all lengths equal",
          "all lengths are 2",
        ],
        [
          "all lengths are even",
          "all lengths are even",
        ],
        [
          "all lengths are equal mod 3",
          "all lengths are equal mod 3",
        ],
      ]
    `);
    expect(link(["a", "b", "cc", "dd"])).toMatchInlineSnapshot(`
      [
        [
          "only two lengths",
          "length 1: a, b",
          "length 2: cc, dd",
        ],
        [
          "lengths can be paired",
          "a and b",
          "cc and dd",
        ],
      ]
    `);
    expect(link(["a", "bbbb", "fffffff"])).toMatchInlineSnapshot(`
      [
        [
          "all lengths are equal mod 3",
          "all lengths are equal mod 3",
        ],
      ]
    `);
    expect(link(["aa", "bbb", "cccc"])).toMatchInlineSnapshot(`
      [
        [
          "lengths are consecutive",
          "lengths are 2, 3, 4",
        ],
      ]
    `);
  });
});
