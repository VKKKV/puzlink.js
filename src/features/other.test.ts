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
        "has morse code with 11 dots": "level has 11 dots: .-.. . ...- . .-..",
        "has morse code with 14 dots and dashes": "level has 14 dots and dashes: .-.. . ...- . .-..",
        "has morse code with 3 dashes": "level has 3 dashes: .-.. . ...- . .-..",
        "has scrabble score 8": "level: 1+1+4+1+1 = 8",
        "is one deletion to a palindrome": "level delete v = leel",
        "is palindrome": "le|v|el",
      }
    `);
    expect(featuresOf("abca")).toMatchInlineSnapshot(`
      {
        "has morse code with 12 dots and dashes": "abca has 12 dots and dashes: .- -... -.-. .-",
        "has morse code with 5 dashes": "abca has 5 dashes: .- -... -.-. .-",
        "has morse code with 7 dots": "abca has 7 dots: .- -... -.-. .-",
        "has scrabble score 8": "abca: 1+3+3+1 = 8",
        "is a hill": "ab<c>a",
        "is one change to a palindrome": "ab|ca",
        "is one deletion to a palindrome": "abca delete b = aca",
      }
    `);
    expect(featuresOf("abda")).toMatchInlineSnapshot(`
      {
        "has morse code with 11 dots and dashes": "abda has 11 dots and dashes: .- -... -.. .-",
        "has morse code with 4 dashes": "abda has 4 dashes: .- -... -.. .-",
        "has morse code with 7 dots": "abda has 7 dots: .- -... -.. .-",
        "has scrabble score 7": "abda: 1+3+2+1 = 7",
        "is a hill": "ab<d>a",
        "is one change to a palindrome": "ab|da",
        "is one deletion to a palindrome": "abda delete b = ada",
      }
    `);
    expect(featuresOf("enot")).toMatchInlineSnapshot(`
      {
        "alternates vowels and consonants": "index(enot, 0, 2) = EnOt",
        "has morse code with 2 dots": "enot has 2 dots: . -. --- -",
        "has morse code with 5 dashes": "enot has 5 dashes: . -. --- -",
        "has morse code with 7 dots and dashes": "enot has 7 dots and dashes: . -. --- -",
        "has scrabble score 4": "enot: 1+1+1+1 = 4",
        "is a hill": "eno<t>",
        "is a valley": ">e<not",
      }
    `);
    expect(featuresOf("abcca")).toMatchInlineSnapshot(`
      {
        "has morse code with 16 dots and dashes": "abcca has 16 dots and dashes: .- -... -.-. -.-. .-",
        "has morse code with 7 dashes": "abcca has 7 dashes: .- -... -.-. -.-. .-",
        "has morse code with 9 dots": "abcca has 9 dots: .- -... -.-. -.-. .-",
        "has scrabble score 11": "abcca: 1+3+3+3+1 = 11",
        "is a hill": "ab<cc>a",
        "is one change to a palindrome": "ab|c|ca",
        "is one deletion to a palindrome": "abcca delete b = acca",
      }
    `);
    expect(featuresOf("cbaab")).toMatchInlineSnapshot(`
      {
        "has morse code with 10 dots": "cbaab has 10 dots: -.-. -... .- .- -...",
        "has morse code with 16 dots and dashes": "cbaab has 16 dots and dashes: -.-. -... .- .- -...",
        "has morse code with 6 dashes": "cbaab has 6 dashes: -.-. -... .- .- -...",
        "has scrabble score 11": "cbaab: 3+3+1+1+3 = 11",
        "is a valley": "cb>aa<b",
        "is one deletion to a palindrome": "cbaab delete c = baab",
      }
    `);
  });
});
