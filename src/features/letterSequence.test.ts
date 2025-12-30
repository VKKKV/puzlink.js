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
        "has e?l as a substring": "lefELLele | 3 | l",
        "has ef as a substring": "lEFellele | 1",
        "has el as a substring": "lefELlELe | 3 | 6",
        "has f?l as a substring": "leFELlele | 2 | e",
        "has fe as a substring": "leFEllele | 2",
        "has l?e as a substring": "lefeLLEle | 4 | l",
        "has l?f as a substring": "LEFellele | 0 | e",
        "has le as a substring": "LEfelLELE | 0 | 5 | 7",
        "starts and ends with the same 2 letters": "LEfelleLE | le",
      }
    `);
    expect(featuresOf("bcdfgaeiou")).toMatchInlineSnapshot(`
      {
        "has a?i as a substring": "bcdfgAEIou | 5 | e",
        "has ae as a substring": "bcdfgAEiou | 5",
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
