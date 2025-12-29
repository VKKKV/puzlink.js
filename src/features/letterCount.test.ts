import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeFeatureGetter } from "./index.js";
import { letterCountFeatures } from "./letterCount.js";

describe("letterCountFeatures", () => {
  const featuresOf = makeFeatureGetter(
    letterCountFeatures(),
    Wordlist.from([]),
  );

  test("letter count features", () => {
    expect(featuresOf("salsas")).toMatchInlineSnapshot(`
      {
        "has 2 letters, each appearing at least twice": "SAlSAS | s | a",
        "has 2 unique consonants": "SaLSaS | s | 0, 3, 5 | l | 2",
        "has 3 unique letters": "SALSAS | sal | salsas",
        "has a bigram that appears at least twice": "SalSas | sa | (0) | (3)",
        "has a bigram that appears twice": "SalSas | sa | (0) | (3)",
        "has a consonant that appears at least twice": "SalSaS | s | 0, 3, 5",
        "has a letter that appears at least thrice": "SalSaS | s | (0) | (3) | (5)",
        "has a letter that appears thrice": "SalSaS | s | (0) | (3) | (5)",
        "has a letter that appears twice": "sAlsAs | a | (1) | (4)",
        "has a unique vowel": "sAlsAs | a | (1) | (4)",
        "has a vowel that appears at least twice": "sAlsAs | a | 1, 4",
        "has at least 1 a": "sAlsAs | 1 | (4)",
        "has at least 1 l": "saLsas | 2",
        "has at least 1 s": "SalSaS | 0 | (3) | (5)",
        "has at least 2 'a's": "sAlsAs | 1 | 4",
        "has at least 2 's's": "SalSaS | 0 | 3 | (5)",
        "has at least 3 's's": "SalSaS | 0 | 3 | 5",
        "has exactly 1 l": "saLsas | 2",
        "has exactly 2 'a's": "sAlsAs | 1 | 4",
        "has exactly 3 's's": "SalSaS | 0 | 3 | 5",
        "has letter counts in arithmetic sequence": "salsas | 1 | l | (2) | (a) | (3) | (s)",
      }
    `);
    expect(featuresOf("abba")).toMatchInlineSnapshot(`
      {
        "has 2 letters, each appearing at least twice": "ABBA | a | b",
        "has 2 letters, each appearing twice": "ABBA | a | b",
        "has 2 unique letters": "ABBA | a | 0, 3 | b | 1, 2",
        "has a consonant that appears at least twice": "aBBa | b | 1, 2",
        "has a unique consonant": "aBBa | b | (1) | (2)",
        "has a unique vowel": "AbbA | a | (0) | (3)",
        "has a vowel that appears at least twice": "AbbA | a | 0, 3",
        "has at least 1 a": "AbbA | 0 | (3)",
        "has at least 1 b": "aBBa | 1 | (2)",
        "has at least 2 'a's": "AbbA | 0 | 3",
        "has at least 2 'b's": "aBBa | 1 | 2",
        "has equal letter counts": "abba | 2",
        "has exactly 2 'a's": "AbbA | 0 | 3",
        "has exactly 2 'b's": "aBBa | 1 | 2",
      }
    `);
    expect(featuresOf("dresser")).toMatchInlineSnapshot(`
      {
        "has 3 letters, each appearing at least twice": "dRESSER | r | e | s",
        "has 3 letters, each appearing twice": "dRESSER | r | e | s",
        "has 3 unique consonants": "DReSSeR | drs | drssr",
        "has 4 unique letters": "DRESSER | dres | dresser",
        "has a consonant that appears at least twice": "dResseR | r | 1, 6 | (s) | (3, 4)",
        "has a unique vowel": "drEssEr | e | (2) | (5)",
        "has a vowel that appears at least twice": "drEssEr | e | 2, 5",
        "has at least 1 d": "Dresser | 0",
        "has at least 1 e": "drEssEr | 2 | (5)",
        "has at least 1 r": "dResseR | 1 | (6)",
        "has at least 1 s": "dreSSer | 3 | (4)",
        "has at least 2 'e's": "drEssEr | 2 | 5",
        "has at least 2 'r's": "dResseR | 1 | 6",
        "has at least 2 's's": "dreSSer | 3 | 4",
        "has exactly 1 d": "Dresser | 0",
        "has exactly 2 'e's": "drEssEr | 2 | 5",
        "has exactly 2 'r's": "dResseR | 1 | 6",
        "has exactly 2 's's": "dreSSer | 3 | 4",
        "has one of two letter counts": "dresser | 1 | d | 2 | ers",
      }
    `);
  });
});
