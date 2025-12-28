import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { testLinkOptions } from "./index.js";
import { indexingLinker } from "./indexing.js";

describe("LetterDistribution", () => {
  const link = (slugs: string[]) =>
    indexingLinker(Wordlist.from(["jhy", "owo", "hen", "mej"]))
      .eval(slugs, testLinkOptions)
      .map((l) => [l.name, l.description]);

  test("letter distribution links", () => {
    expect(link(["hemlo", "yellow", "jenlo"])).toMatchInlineSnapshot(`
      [
        [
          "-4th letters are almost equal",
          [
            "'yellow' -4th letters is 'l'",
            "others -4th letters are 'e'",
          ],
        ],
        [
          "-4th letters have only two values",
          [
            "'hemlo', 'jenlo' -4th letters are 'e'",
            "'yellow' -4th letters are 'l'",
          ],
        ],
        [
          "-3rd letters are consecutive",
          [
            "-3rd letters are m, l, n",
          ],
        ],
        [
          "-2nd letters are almost equal",
          [
            "'yellow' -2nd letters is 'o'",
            "others -2nd letters are 'l'",
          ],
        ],
        [
          "-2nd letters have only two values",
          [
            "'hemlo', 'jenlo' -2nd letters are 'l'",
            "'yellow' -2nd letters are 'o'",
          ],
        ],
        [
          "-1st letters are almost equal",
          [
            "'yellow' -1st letters is 'w'",
            "others -1st letters are 'o'",
          ],
        ],
        [
          "-1st letters have only two values",
          [
            "'hemlo', 'jenlo' -1st letters are 'o'",
            "'yellow' -1st letters are 'w'",
          ],
        ],
        [
          "-1st letters are a word",
          [
            "-1st letters are 'owo'",
          ],
        ],
        [
          "1st letters anagram to a word",
          [
            "1st letters anagram to jhy",
          ],
        ],
        [
          "2nd letters are equal",
          [
            "2nd letters are e",
          ],
        ],
        [
          "3rd letters are consecutive",
          [
            "3rd letters are m, l, n",
          ],
        ],
        [
          "4th letters are equal",
          [
            "4th letters are l",
          ],
        ],
        [
          "5th letters are equal",
          [
            "5th letters are o",
          ],
        ],
        [
          "diagonal are a word",
          [
            "diagonal are 'hen'",
          ],
        ],
        [
          "antidiagonal are a word",
          [
            "antidiagonal are 'mej'",
          ],
        ],
      ]
    `);

    expect(link(["ceriam", "sodjum", "magneskul", "dimension"]))
      .toMatchInlineSnapshot(`
        [
          [
            "6th letters have only two values",
            [
              "'ceriam', 'sodjum' 6th letters are 'm'",
              "'magneskul', 'dimension' 6th letters are 's'",
            ],
          ],
          [
            "6th letters can be paired",
            [
              "'ceriam', 'sodjum' 6th letters are 'm'",
              "'magneskul', 'dimension' 6th letters are 's'",
            ],
          ],
        ]
      `);
  });
});
