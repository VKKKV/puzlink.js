import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import * as T from "../templating/index.js";
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
      .map((l) => [
        l.name,
        T.renderToText((l.description as T.Table | undefined) ?? T.Text("")),
      ]);

  test("other links", () => {
    expect(link(["jjjjjqqqqqxxxxxzzzzz"])).toMatchInlineSnapshot(`
      [
        [
          "unusual letter distribution",
          "over-represented  j, q, x, z
      under-represented",
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
          "over-represented  f, g, j
      under-represented",
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
