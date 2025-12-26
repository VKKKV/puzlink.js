import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeFeatureGetter } from "./index.js";
import { substringFeatures } from "./substring.js";

describe("substringFeatures", () => {
  const featuresOf = makeFeatureGetter(substringFeatures(), Wordlist.from([]));

  test("containsOne", () => {
    expect(featuresOf("alfalpah")).toMatchInlineSnapshot(`
      {
        "can be broken into element symbols": "alfalpah = al f al pa h",
        "ends with element symbols": "alfalpah ends with h",
        "has element symbols substring": "alfalpah contains al: ALfalpah",
        "has element symbols substring, 5 times": "alfalpah contains al, f, al, pa, h: ALFALPAH",
        "has element symbols substring, at least 2 times": "alfalpah contains al, f, al, pa, h: ALFALPAH",
        "has element symbols substring, at least 3 times": "alfalpah contains al, f, al, pa, h: ALFALPAH",
        "has element symbols substring, at least 4 times": "alfalpah contains al, f, al, pa, h: ALFALPAH",
        "has element symbols substring, at least 5 times": "alfalpah contains al, f, al, pa, h: ALFALPAH",
        "has greek letters anagram substring": "alfalpah has anagram alpha: alfALPAH",
        "has greek letters change 1 substring": "alfalpah has change 1 of pi: alfalPAh",
        "has iso 2-letter country codes substring": "alfalpah contains al: ALfalpah",
        "has iso 2-letter country codes substring, 3 times": "alfalpah contains al, al, pa: ALfALPAh",
        "has iso 2-letter country codes substring, at least 2 times": "alfalpah contains al, al, pa: ALfALPAh",
        "has iso 2-letter country codes substring, at least 3 times": "alfalpah contains al, al, pa: ALfALPAh",
        "has nato alphabet anagram substring": "alfalpah has anagram alfa: ALFAlpah",
        "has nato alphabet change 1 substring": "alfalpah has change 1 of alfa: ALFAlpah",
        "has nato alphabet substring": "alfalpah contains alfa: ALFAlpah",
        "has roman numerals substring": "alfalpah contains l: aLfalpah",
        "has roman numerals substring, 2 times": "alfalpah contains l, l: aLfaLpah",
        "has roman numerals substring, at least 2 times": "alfalpah contains l, l: aLfaLpah",
        "has solfege substring": "alfalpah contains fa: alFAlpah",
        "has us state abbreviations substring": "alfalpah contains al: ALfalpah",
        "has us state abbreviations substring, 3 times": "alfalpah contains al, al, pa: ALfALPAh",
        "has us state abbreviations substring, at least 2 times": "alfalpah contains al, al, pa: ALfALPAh",
        "has us state abbreviations substring, at least 3 times": "alfalpah contains al, al, pa: ALfALPAh",
        "starts with element symbols": "alfalpah starts with al",
        "starts with iso 2-letter country codes": "alfalpah starts with al",
        "starts with nato alphabet": "alfalpah starts with alfa",
        "starts with us state abbreviations": "alfalpah starts with al",
      }
    `);

    expect(featuresOf("carpal")).toMatchInlineSnapshot(`
      {
        "can be broken into element symbols": "carpal = c ar p al",
        "ends with element symbols": "carpal ends with al",
        "ends with iso 2-letter country codes": "carpal ends with al",
        "ends with roman numerals": "carpal ends with l",
        "ends with us state abbreviations": "carpal ends with al",
        "has element symbols substring": "carpal contains ca: CArpal",
        "has element symbols substring, 2 times": "carpal contains ca, pa: CArPAl",
        "has element symbols substring, at least 2 times": "carpal contains ca, pa: CArPAl",
        "has greek letters change 1 substring": "carpal has change 1 of pi: carPAl",
        "has iso 2-letter country codes substring": "carpal contains ca: CArpal",
        "has iso 2-letter country codes substring, 2 times": "carpal contains ca, pa: CArPAl",
        "has iso 2-letter country codes substring, at least 2 times": "carpal contains ca, pa: CArPAl",
        "has roman numerals substring": "carpal contains c: Carpal",
        "has roman numerals substring, 2 times": "carpal contains c, l: CarpaL",
        "has roman numerals substring, at least 2 times": "carpal contains c, l: CarpaL",
        "has us state abbreviations substring": "carpal contains ca: CArpal",
        "has us state abbreviations substring, 2 times": "carpal contains ca, pa: CArPAl",
        "has us state abbreviations substring, at least 2 times": "carpal contains ca, pa: CArPAl",
        "starts with element symbols": "carpal starts with ca",
        "starts with iso 2-letter country codes": "carpal starts with ca",
        "starts with roman numerals": "carpal starts with c",
        "starts with us state abbreviations": "carpal starts with ca",
      }
    `);
  });
});
