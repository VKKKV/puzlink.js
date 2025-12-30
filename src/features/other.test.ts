import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { otherFeatures } from "./other.js";
import { makeFeatureGetter } from "./index.js";

describe("otherFeatures", () => {
  const featuresOf = makeFeatureGetter(otherFeatures(), Wordlist.from([]));

  test("other features", () => {
    expect(featuresOf("level")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "lEvEl | 1",
        "is one deletion to a palindrome": "leVel | 2 | v | lEEl | (2) | (e)",
        "is palindrome": "leVel | 2 | v",
      }
    `);
    expect(featuresOf("abca")).toMatchInlineSnapshot(`
      {
        "is a hill": "abCa | 2 | c",
        "is one change to a palindrome": "aBCa | 1 | b | 2 | c",
        "is one deletion to a palindrome": "aBca | 1 | b | aCa | (1) | (c)",
      }
    `);
    expect(featuresOf("abda")).toMatchInlineSnapshot(`
      {
        "is a hill": "abDa | 2 | d",
        "is one change to a palindrome": "aBDa | 1 | b | 2 | d",
        "is one deletion to a palindrome": "aBda | 1 | b | aDa | (1) | (d)",
      }
    `);
    expect(featuresOf("enot")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "EnOt | 0",
        "is a hill": "enoT | 3 | t",
        "is a valley": "Enot | 0 | e",
      }
    `);
    expect(featuresOf("abcca")).toMatchInlineSnapshot(`
      {
        "is a hill": "abCCa | 2 | c | 3",
        "is one change to a palindrome": "aBCca | 1 | b | 3 | c",
        "is one deletion to a palindrome": "aBcca | 1 | b | aCCa | (2) | (c)",
      }
    `);
    expect(featuresOf("cbaab")).toMatchInlineSnapshot(`
      {
        "is a valley": "cbAAb | 2 | a | 3",
        "is one deletion to a palindrome": "Cbaab | 0 | c | bAAb | (2) | (a)",
      }
    `);
  });
});
