import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeMetricGetter } from "./index.js";
import { letterSequenceMetrics } from "./letterSequence.js";

describe("letterSequenceMetrics", () => {
  const metricsOf = makeMetricGetter(
    letterSequenceMetrics(),
    Wordlist.from([]),
  );

  test("letter sequence metrics", () => {
    expect(metricsOf("lefellele")).toMatchInlineSnapshot(`
      {
        "has 1 consecutive vowel": "lEfellele | e | 1",
        "has 1 double l": "lefeLLele | 4",
        "has 1 pair of equal letters, separated by 3 letters": "LEFELlele | l | 0 | efe",
        "has 1 reverse sequential bigram": "leFEllele | fe | 2",
        "has 1 sequential bigram": "lEFellele | ef | 1",
        "has 2 consecutive consonants": "lefeLLele | ll | 4",
        "has 2 pairs of equal letters, separated by 2 letters": "lefELlELe | elle | llel",
        "has 3 alphabetical bigrams": "lEFELlELe | ef | 1 | el | 3 | el | 6",
        "has 3 pairs of equal letters, separated by 1 letter": "lEfElLELE | efe | lel | ele",
        "has 4 reverse alphabetical bigrams": "LEFElLELE | le | 0 | fe | 2 | le | 5 | le | 7",
        "has e??e as a substring": "lefELLEle | 3 | ll",
        "has e?e as a substring, twice": "lEfEllElE | 1 | f | 6 | l",
        "has exactly 1 double letter": "lefeLLele | l | 4",
        "has l???l as a substring": "LEFELlele | 0 | efe",
        "has l??l as a substring": "lefeLLELe | 4 | le",
        "has l?l as a substring": "lefelLELe | 5 | e",
      }
    `);
    expect(metricsOf("bcdfgaeiou")).toMatchInlineSnapshot(`
      {
        "has 1 reverse alphabetical bigram": "bcdfGAeiou | ga | 4",
        "has 3 sequential bigrams": "BCDFGaeiou | bc | 0 | cd | 1 | fg | 3",
        "has 5 consecutive consonants": "BCDFGaeiou | bcdfg | 0",
        "has 5 consecutive vowels": "bcdfgAEIOU | aeiou | 5",
        "has 8 alphabetical bigrams": "BCDFGAEIOU | bc | 0 | cd | 1 | df | 2 | fg | 3 | ae | 5 | ei | 6 | io | 7 | ou | 8",
      }
    `);
  });
});
