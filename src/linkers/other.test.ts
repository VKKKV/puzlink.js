import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { testLinkOptions } from "./index.js";
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
  const link = (slugs: string[]) =>
    otherLinker(wordlist)
      .eval(slugs, testLinkOptions)
      .map((l) => [l.name, l.description]);

  test("other links", () => {
    expect(link(["jjjjjqqqqqxxxxxzzzzz"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          [
            "over-represented: j, q, x, z",
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

    expect(link(["abcdef", "defghi", "ghijkl"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          [
            "over-represented: f, g, j",
          ],
        ],
        [
          "multiple shared suffixes and prefixes",
          [
            "abcDEF DEFghi",
            "defGHI GHIjkl",
          ],
        ],
      ]
    `);
  });
});
