import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeFeatureGetter } from "./index.js";
import { letterSequenceFeatures } from "./letterSequence.js";

describe("letterSequenceFeatures", () => {
  const featuresOf = makeFeatureGetter(
    letterSequenceFeatures(),
    Wordlist.from([]),
  );

  test("letter sequence features", () => {
    expect(featuresOf("lefellele")).toMatchInlineSnapshot(`
      {
        "has 1 pair of equal letters, separated by 1 letter": "lEFEllele | e | 1 | f",
        "has 1 pair of equal letters, separated by 2 letters": "lefELLEle | e | 3 | ll",
        "has 1 pair of equal letters, separated by 3 letters": "LEFELlele | l | 0 | efe",
        "has 1 reverse sequential bigram": "leFEllele | fe | 2",
        "has 1 sequential bigram": "lEFellele | ef | 1",
        "has 2 consecutive consonants": "lefeLLele | l | 4",
        "has 2 pairs of equal letters, separated by 1 letter": "lEfElLELE | efe | (lel) | (ele)",
        "has 2 pairs of equal letters, separated by 2 letters": "lefELlELe | elle | (llel)",
        "has 3 alphabetical bigrams": "lEFELlELe | ef | 1 | el | 3 | el | 6",
        "has 3 pairs of equal letters, separated by 1 letter": "lEfElLELE | efe | (lel) | (ele)",
        "has 4 reverse alphabetical bigrams": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has a double l": "lefeLLele | 4",
        "has at least 1 alphabetical bigram": "lEFELlELe | ef | 1 | el | 3 | el | 6",
        "has at least 1 double letter": "lefeLLele | l | 4",
        "has at least 1 reverse alphabetical bigram": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has at least 1 reverse sequential bigram": "leFEllele | fe | 2",
        "has at least 1 sequential bigram": "lEFellele | ef | 1",
        "has at least 2 alphabetical bigrams": "lEFELlELe | ef | 1 | el | 3 | el | 6",
        "has at least 2 consecutive consonants": "lefeLLele | l | 4",
        "has at least 2 reverse alphabetical bigrams": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has at least 3 alphabetical bigrams": "lEFELlELe | ef | 1 | el | 3 | el | 6",
        "has at least 3 reverse alphabetical bigrams": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has at least 4 reverse alphabetical bigrams": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has e??e as a substring": "lefELLEle | 3 | ll",
        "has e?e as a substring, twice": "lEfEllElE | 1 | f | 6 | l",
        "has e?l as a substring": "lefELLele | 3 | l",
        "has ef as a substring": "lEFellele | 1",
        "has el as a substring": "lefELlELe | 3 | 6",
        "has exactly 1 double letter": "lefeLLele | l | 4",
        "has f?l as a substring": "leFELlele | 2 | e",
        "has fe as a substring": "leFEllele | 2",
        "has l???l as a substring": "LEFELlele | 0 | efe",
        "has l??l as a substring": "lefeLLELe | 4 | le",
        "has l?e as a substring": "lefeLLEle | 4 | l",
        "has l?f as a substring": "LEFellele | 0 | e",
        "has l?l as a substring": "lefelLELe | 5 | e",
        "has le as a substring": "LEfelLELE | 0 | 5 | 7",
        "starts and ends with the same 2 letters": "LEfelleLE | le",
      }
    `);
    expect(featuresOf("bcdfgaeiou")).toMatchInlineSnapshot(`
      {
        "has 0 reverse sequential bigrams": "bcdfgaeiou",
        "has 1 reverse alphabetical bigram": "bcdfGAeiou | ga | 4",
        "has 3 sequential bigrams": "BCDFGaeiou | bc | 0 | cd | 1 | fg | 3",
        "has 5 consecutive consonants": "BCDFGaeiou | bcdf | 0",
        "has 5 consecutive vowels": "bcdfgAEIOU | aeio | 5",
        "has 8 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has a?i as a substring": "bcdfgAEIou | 5 | e",
        "has ae as a substring": "bcdfgAEiou | 5",
        "has at least 1 alphabetical bigram": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 1 reverse alphabetical bigram": "bcdfGAeiou | ga | 4",
        "has at least 1 sequential bigram": "BCDFGaeiou | bc | 0 | cd | 1 | fg | 3",
        "has at least 2 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 2 consecutive consonants": "BCDFGaeiou | bcdf | 0",
        "has at least 2 consecutive vowels": "bcdfgAEIOU | aeio | 5",
        "has at least 2 sequential bigrams": "BCDFGaeiou | bc | 0 | cd | 1 | fg | 3",
        "has at least 3 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 3 consecutive consonants": "BCDFGaeiou | bcdf | 0",
        "has at least 3 consecutive vowels": "bcdfgAEIOU | aeio | 5",
        "has at least 3 sequential bigrams": "BCDFGaeiou | bc | 0 | cd | 1 | fg | 3",
        "has at least 4 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 4 consecutive consonants": "BCDFGaeiou | bcdf | 0",
        "has at least 4 consecutive vowels": "bcdfgAEIOU | aeio | 5",
        "has at least 5 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 5 consecutive consonants": "BCDFGaeiou | bcdf | 0",
        "has at least 5 consecutive vowels": "bcdfgAEIOU | aeio | 5",
        "has at least 6 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 7 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has at least 8 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
        "has b?d as a substring": "BCDfgaeiou | 0 | c",
        "has bc as a substring": "BCdfgaeiou | 0",
        "has c?f as a substring": "bCDFgaeiou | 1 | d",
        "has cd as a substring": "bCDfgaeiou | 1",
        "has d?g as a substring": "bcDFGaeiou | 2 | f",
        "has df as a substring": "bcDFgaeiou | 2",
        "has e?o as a substring": "bcdfgaEIOu | 6 | i",
        "has ei as a substring": "bcdfgaEIou | 6",
        "has f?a as a substring": "bcdFGAeiou | 3 | g",
        "has fg as a substring": "bcdFGaeiou | 3",
        "has g?e as a substring": "bcdfGAEiou | 4 | a",
        "has ga as a substring": "bcdfGAeiou | 4",
        "has i?u as a substring": "bcdfgaeIOU | 7 | o",
        "has io as a substring": "bcdfgaeIOu | 7",
        "has ou as a substring": "bcdfgaeiOU | 8",
      }
    `);
  });
});
