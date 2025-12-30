import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeMetricGetter } from "./index.js";
import { letterCountMetrics } from "./letterCount.js";

describe("letterCountMetrics", () => {
  const metricsOf = makeMetricGetter(letterCountMetrics(), Wordlist.from([]));

  test("letter count metrics", () => {
    expect(metricsOf("salsas")).toMatchInlineSnapshot(`
      {
        "has 1 unique vowel": "sAlsAs | a | (1) | (4)",
        "has 2 unique consonants": "SaLSaS | s | 0, 3, 5 | l | 2",
        "has 3 unique letters": "SALSAS | sal | salsas",
        "has exactly 1 bigram that appears at least twice": "SalSas | sa | (0) | (3)",
        "has exactly 1 bigram that appears twice": "SalSas | sa | (0) | (3)",
        "has exactly 1 consonant that appears at least twice": "SalSaS | s | 0, 3, 5",
        "has exactly 1 l": "saLsas | 2",
        "has exactly 1 letter that appears at least thrice": "SalSaS | s | (0) | (3) | (5)",
        "has exactly 1 letter that appears thrice": "SalSaS | s | (0) | (3) | (5)",
        "has exactly 1 letter that appears twice": "sAlsAs | a | (1) | (4)",
        "has exactly 1 vowel that appears at least twice": "sAlsAs | a | 1, 4",
        "has exactly 2 'a's": "sAlsAs | 1 | 4",
        "has exactly 2 letters that appear at least twice": "SAlSAS | s | a",
        "has exactly 3 's's": "SalSaS | 0 | 3 | 5",
      }
    `);
    expect(metricsOf("abba")).toMatchInlineSnapshot(`
      {
        "has 1 unique consonant": "aBBa | b | (1) | (2)",
        "has 1 unique vowel": "AbbA | a | (0) | (3)",
        "has 2 unique letters": "ABBA | a | 0, 3 | b | 1, 2",
        "has exactly 1 consonant that appears at least twice": "aBBa | b | 1, 2",
        "has exactly 1 vowel that appears at least twice": "AbbA | a | 0, 3",
        "has exactly 2 'a's": "AbbA | 0 | 3",
        "has exactly 2 'b's": "aBBa | 1 | 2",
        "has exactly 2 letters that appear at least twice": "ABBA | a | b",
        "has exactly 2 letters that appear twice": "ABBA | a | b",
      }
    `);
    expect(metricsOf("dresser")).toMatchInlineSnapshot(`
      {
        "has 1 unique vowel": "drEssEr | e | (2) | (5)",
        "has 3 unique consonants": "DReSSeR | drs | drssr",
        "has 4 unique letters": "DRESSER | dres | dresser",
        "has exactly 1 d": "Dresser | 0",
        "has exactly 1 vowel that appears at least twice": "drEssEr | e | 2, 5",
        "has exactly 2 'e's": "drEssEr | 2 | 5",
        "has exactly 2 'r's": "dResseR | 1 | 6",
        "has exactly 2 's's": "dreSSer | 3 | 4",
        "has exactly 2 consonants that appear at least twice": "dResseR | r | 1, 6 | (s) | (3, 4)",
        "has exactly 3 letters that appear at least twice": "dRESSER | r | e | s",
        "has exactly 3 letters that appear twice": "dRESSER | r | e | s",
      }
    `);
  });
});
