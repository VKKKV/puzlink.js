import { describe, expect, test } from "vitest";
import { LetterDistribution, LETTERS } from "../lib/letterDistribution.js";
import { indexingLinker } from "./indexing.js";

describe("LetterDistribution", () => {
  const link = (slugs: string[]) =>
    indexingLinker(LetterDistribution.from(Array.from(LETTERS)))
      .eval(slugs)
      .map((l) => [l.name, ...l.description]);

  test("letter distribution links", () => {
    expect(link(["hello", "yellow", "jello"])).toMatchInlineSnapshot(`
      [
        [
          "-6th letters are equal",
          "-6th letters are y",
        ],
        [
          "-4th letters are almost equal",
          "'yellow' -4th letters is 'l'",
          "others -4th letters are 'e'",
        ],
        [
          "-3rd letters are equal",
          "-3rd letters are l",
        ],
        [
          "-2nd letters are almost equal",
          "'yellow' -2nd letters is 'o'",
          "others -2nd letters are 'l'",
        ],
        [
          "-1st letters are almost equal",
          "'yellow' -1st letters is 'w'",
          "others -1st letters are 'o'",
        ],
        [
          "2nd letters are equal",
          "2nd letters are e",
        ],
        [
          "3rd letters are equal",
          "3rd letters are l",
        ],
        [
          "4th letters are equal",
          "4th letters are l",
        ],
        [
          "5th letters are equal",
          "5th letters are o",
        ],
        [
          "6th letters are equal",
          "6th letters are w",
        ],
      ]
    `);
  });
});
