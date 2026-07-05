import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { testLinker } from "./index.js";
import { otherLinker } from "./other.js";

describe("other linker", () => {
  const wordlist = Wordlist.from([
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
  ]);
  const link = testLinker(otherLinker, wordlist);

  test("other links", () => {
    expect(link(["jjjjjqqqqqxxxxxzzzzz"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          "over-represented j x q z",
        ],
        [
          "start with the same vowel-consonant pattern",
          "CCCCCCCCCCCCCCCCCCCC
      JJJJJQQQQQXXXXXZZZZZ",
        ],
        [
          "end with the same vowel-consonant pattern",
          "CCCCCCCCCCCCCCCCCCCC
      JJJJJQQQQQXXXXXZZZZZ",
        ],
      ]
    `);

    expect(link(["abcdef", "defghi", "ghijkl"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          "over-represented f j g",
        ],
        [
          "multiple shared suffixes and prefixes",
          "abcDEF DEFghi
      defGHI GHIjkl",
        ],
      ]
    `);
  });
});
