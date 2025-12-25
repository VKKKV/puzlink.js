import { describe, expect, test } from "vitest";
import { LetterDistribution } from "../lib/letterDistribution.js";
import { Wordlist } from "../lib/wordlist.js";
import { nGramLinker } from "./nGram.js";

describe("n-gram linker", () => {
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
  const link = (slugs: string[]) =>
    nGramLinker(dist)
      .eval(slugs)
      .map((l) => [l.name, l.description]);

  test("n-gram links", () => {
    expect(link(["jjjjjqqqqqxxxxxzzzzz"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          [
            "over-represented: jqxz",
          ],
        ],
        [
          "start with the same vowel-consonant pattern",
          [
            "all start with CCCCCCCCCCCCCCCCCCCC",
          ],
        ],
        [
          "end with the same vowel-consonant pattern",
          [
            "all end with CCCCCCCCCCCCCCCCCCCC",
          ],
        ],
      ]
    `);
  });
});
