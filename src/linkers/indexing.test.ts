import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { testLinker } from "./index.js";
import { indexingLinker } from "./indexing.js";

describe("LetterDistribution", () => {
  const link = testLinker(
    indexingLinker,
    Wordlist.from(["jhy", "owo", "hen", "mej"]),
  );

  test("letter distribution links", () => {
    expect(link(["hemlo", "yellow", "jenlo"])).toMatchInlineSnapshot(`
      [
        [
          "-4th letters are almost equal",
          "yeLlow -4 l
      hEmlo  -4 e
      jEnlo  -4 e",
        ],
        [
          "-4th letters have two distinct values",
          "hEmlo  -4 e
      jEnlo  -4 e
      yeLlow -4 l",
        ],
        [
          "-3rd letters are consecutive",
          "yelLow -3 l
      heMlo  -3 m
      jeNlo  -3 n",
        ],
        [
          "-2nd letters are almost equal",
          "yellOw -2 o
      hemLo  -2 l
      jenLo  -2 l",
        ],
        [
          "-2nd letters have two distinct values",
          "hemLo  -2 l
      jenLo  -2 l
      yellOw -2 o",
        ],
        [
          "-1st letters are almost equal",
          "yelloW -1 w
      hemlO  -1 o
      jenlO  -1 o",
        ],
        [
          "-1st letters have two distinct values",
          "hemlO  -1 o
      jenlO  -1 o
      yelloW -1 w",
        ],
        [
          "-1st letters form a word",
          "hemlO  -1 o
      yelloW -1 w
      jenlO  -1 o",
        ],
        [
          "0th letters anagram to a word",
          "Jenlo  0 j
      Hemlo  0 h
      Yellow 0 y",
        ],
        [
          "1st letters are equal",
          "hEmlo  1 e
      yEllow 1 e
      jEnlo  1 e",
        ],
        [
          "2nd letters are consecutive",
          "yeLlow 2 l
      heMlo  2 m
      jeNlo  2 n",
        ],
        [
          "3rd letters are equal",
          "hemLo  3 l
      yelLow 3 l
      jenLo  3 l",
        ],
        [
          "4th letters are equal",
          "hemlO  4 o
      yellOw 4 o
      jenlO  4 o",
        ],
        [
          "diagonal letters form a word",
          "Hemlo  0 h
      yEllow 1 e
      jeNlo  2 n",
        ],
        [
          "antidiagonal letters form a word",
          "heMlo  2 m
      yEllow 1 e
      Jenlo  0 j",
        ],
      ]
    `);

    expect(link(["ceriam", "sodjum", "magneskul", "dimension"]))
      .toMatchInlineSnapshot(`
        [
          [
            "5th letters have two distinct values",
            "ceriaM    5 m
        sodjuM    5 m
        magneSkul 5 s
        dimenSion 5 s",
          ],
          [
            "5th letters can be paired",
            "ceriam    5 sodjum    5 m
        magneskul 5 dimension 5 s",
          ],
        ]
      `);
  });
});
