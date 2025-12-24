import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { otherFeatures } from "./other.js";
import { makeFeatureGetter } from "./index.js";

describe("otherFeatures", () => {
  const featuresOf = makeFeatureGetter(otherFeatures(), Wordlist.from([]));

  test("other features", () => {
    expect(featuresOf("level")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "index(level, 1, 3) = lEvEl",
        "has morse code with 2 dots": "level has 2 dotss: .-.. . ...- . .-..",
        "has morse code with 2 dots/dashes": "level has 2 dots/dashess: .-.. . ...- . .-..",
        "has scrabble score 8": "level: 1+1+4+1+1 = 8",
        "is one deletion to a palindrome": "level delete v = leel",
        "is palindrome": "le|v|el",
      }
    `);
    expect(featuresOf("abca")).toMatchInlineSnapshot(`
      {
        "has morse code with 2 dots/dashes": "abca has 2 dots/dashess: .- -... -.-. .-",
        "has morse code with equal dot/dash count": "abca has 0 dots/dashes: .- -... -.-. .-",
        "has scrabble score 8": "abca: 1+3+3+1 = 8",
        "is a hill": "ab<c>a",
        "is one change to a palindrome": "ab|ca",
        "is one deletion to a palindrome": "abca delete b = aca",
      }
    `);
    expect(featuresOf("abda")).toMatchInlineSnapshot(`
      {
        "has morse code with 2 dots/dashes": "abda has 2 dots/dashess: .- -... -.. .-",
        "has morse code with equal dot/dash count": "abda has 0 dots/dashes: .- -... -.. .-",
        "has scrabble score 7": "abda: 1+3+2+1 = 7",
        "is a hill": "ab<d>a",
        "is one change to a palindrome": "ab|da",
        "is one deletion to a palindrome": "abda delete b = ada",
      }
    `);
    expect(featuresOf("enot")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "index(enot, 0, 2) = EnOt",
        "has morse code with 1 dashes": "enot has 1 dashess: . -. --- -",
        "has morse code with 1 dots": "enot has 1 dotss: . -. --- -",
        "has morse code with 2 dots/dashes": "enot has 2 dots/dashess: . -. --- -",
        "has morse code with equal dot/dash count": "enot has 1 dots/dashes: . -. --- -",
        "has scrabble score 4": "enot: 1+1+1+1 = 4",
        "is a hill": "eno<t>",
        "is a valley": ">e<not",
      }
    `);
    expect(featuresOf("abcca")).toMatchInlineSnapshot(`
      {
        "has morse code with 2 dots/dashes": "abcca has 2 dots/dashess: .- -... -.-. -.-. .-",
        "has morse code with equal dot/dash count": "abcca has 0 dots/dashes: .- -... -.-. -.-. .-",
        "has scrabble score 11": "abcca: 1+3+3+3+1 = 11",
        "is a hill": "ab<cc>a",
        "is one change to a palindrome": "ab|c|ca",
        "is one deletion to a palindrome": "abcca delete b = acca",
      }
    `);
    expect(featuresOf("cbaab")).toMatchInlineSnapshot(`
      {
        "has morse code with 2 dots/dashes": "cbaab has 2 dots/dashess: -.-. -... .- .- -...",
        "has morse code with equal dot/dash count": "cbaab has 0 dots/dashes: -.-. -... .- .- -...",
        "has scrabble score 11": "cbaab: 3+3+1+1+3 = 11",
        "is a valley": "cb>aa<b",
        "is one deletion to a palindrome": "cbaab delete c = baab",
      }
    `);
  });
});
