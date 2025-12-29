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
        "has morse code with 11 dots": "level | 11 | .-.. . ...- . .-..",
        "has morse code with 14 dots and dashes": "level | 14 | .-.. . ...- . .-..",
        "has morse code with 3 dashes": "level | 3 | .-.. . ...- . .-..",
        "has scrabble score 8": "level | 8 | 1 | 1 | 4 | 1 | 1",
        "is one deletion to a palindrome": "leVel | 2 | v | lEEl | (2) | (e)",
        "is palindrome": "leVel | 2 | v",
      }
    `);
    expect(featuresOf("abca")).toMatchInlineSnapshot(`
      {
        "has morse code with 12 dots and dashes": "abca | 12 | .- -... -.-. .-",
        "has morse code with 5 dashes": "abca | 5 | .- -... -.-. .-",
        "has morse code with 7 dots": "abca | 7 | .- -... -.-. .-",
        "has scrabble score 8": "abca | 8 | 1 | 3 | 3 | 1",
        "is a hill": "abCa | 2 | c",
        "is one change to a palindrome": "aBCa | 1 | b | 2 | c",
        "is one deletion to a palindrome": "aBca | 1 | b | aCa | (1) | (c)",
      }
    `);
    expect(featuresOf("abda")).toMatchInlineSnapshot(`
      {
        "has morse code with 11 dots and dashes": "abda | 11 | .- -... -.. .-",
        "has morse code with 4 dashes": "abda | 4 | .- -... -.. .-",
        "has morse code with 7 dots": "abda | 7 | .- -... -.. .-",
        "has scrabble score 7": "abda | 7 | 1 | 3 | 2 | 1",
        "is a hill": "abDa | 2 | d",
        "is one change to a palindrome": "aBDa | 1 | b | 2 | d",
        "is one deletion to a palindrome": "aBda | 1 | b | aDa | (1) | (d)",
      }
    `);
    expect(featuresOf("enot")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "EnOt | 0",
        "has morse code with 2 dots": "enot | 2 | . -. --- -",
        "has morse code with 5 dashes": "enot | 5 | . -. --- -",
        "has morse code with 7 dots and dashes": "enot | 7 | . -. --- -",
        "has scrabble score 4": "enot | 4 | 1 | 1 | 1 | 1",
        "is a hill": "enoT | 3 | t",
        "is a valley": "Enot | 0 | e",
      }
    `);
    expect(featuresOf("abcca")).toMatchInlineSnapshot(`
      {
        "has morse code with 16 dots and dashes": "abcca | 16 | .- -... -.-. -.-. .-",
        "has morse code with 7 dashes": "abcca | 7 | .- -... -.-. -.-. .-",
        "has morse code with 9 dots": "abcca | 9 | .- -... -.-. -.-. .-",
        "has scrabble score 11": "abcca | 11 | 1 | 3 | 3 | 3 | 1",
        "is a hill": "abCCa | 2 | c | 3",
        "is one change to a palindrome": "aBCca | 1 | b | 3 | c",
        "is one deletion to a palindrome": "aBcca | 1 | b | aCCa | (2) | (c)",
      }
    `);
    expect(featuresOf("cbaab")).toMatchInlineSnapshot(`
      {
        "has morse code with 10 dots": "cbaab | 10 | -.-. -... .- .- -...",
        "has morse code with 16 dots and dashes": "cbaab | 16 | -.-. -... .- .- -...",
        "has morse code with 6 dashes": "cbaab | 6 | -.-. -... .- .- -...",
        "has scrabble score 11": "cbaab | 11 | 3 | 3 | 1 | 1 | 3",
        "is a valley": "cbAAb | 2 | a | 3",
        "is one deletion to a palindrome": "Cbaab | 0 | c | bAAb | (2) | (a)",
      }
    `);
  });
});
