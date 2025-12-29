import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeFeatureGetter } from "./index.js";
import { substringFeatures } from "./substring.js";

describe("substringFeatures", () => {
  const featuresOf = makeFeatureGetter(substringFeatures(), Wordlist.from([]));

  test("containsOne", () => {
    expect(featuresOf("alfalpah")).toMatchInlineSnapshot(`
      {
        "can be broken into element symbols": "alfalpah | al | (f) | (al) | (pa) | (h)",
        "ends with element symbols": "alfalpaH | h | 7",
        "has 2 roman numerals substrings": "aLfaLpah | l | 1 | (l) | (4)",
        "has 3 iso 2-letter country codes substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has 3 us state abbreviations substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has 5 element symbols substrings": "ALFALPAH | al | 0 | (f) | (2) | (al) | (3) | (pa) | (5) | (h) | (7)",
        "has at least 2 element symbols substrings": "ALFALPAH | al | 0 | (f) | (2) | (al) | (3) | (pa) | (5) | (h) | (7)",
        "has at least 2 iso 2-letter country codes substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has at least 2 roman numerals substrings": "aLfaLpah | l | 1 | (l) | (4)",
        "has at least 2 us state abbreviations substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has at least 3 element symbols substrings": "ALFALPAH | al | 0 | (f) | (2) | (al) | (3) | (pa) | (5) | (h) | (7)",
        "has at least 3 iso 2-letter country codes substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has at least 3 us state abbreviations substrings": "ALfALPAh | al | 0 | (al) | (3) | (pa) | (5)",
        "has at least 4 element symbols substrings": "ALFALPAH | al | 0 | (f) | (2) | (al) | (3) | (pa) | (5) | (h) | (7)",
        "has at least 5 element symbols substrings": "ALFALPAH | al | 0 | (f) | (2) | (al) | (3) | (pa) | (5) | (h) | (7)",
        "has element symbols substring": "ALfalpah | al | 0",
        "has greek letters anagram substring": "alfALPAH | alpha | 3 | alpah",
        "has greek letters with 1 change as substring": "alfalPAh | pi | pa | i",
        "has iso 2-letter country codes substring": "ALfalpah | al | 0",
        "has nato alphabet anagram substring": "ALFAlpah | alfa | 0 | alfa",
        "has nato alphabet substring": "ALFAlpah | alfa | 0",
        "has nato alphabet with 1 change as substring": "ALFAlpah | alfa |  | ",
        "has roman numerals substring": "aLfalpah | l | 1",
        "has solfege substring": "alFAlpah | fa | 2",
        "has us state abbreviations substring": "ALfalpah | al | 0",
        "starts with element symbols": "ALfalpah | al | 1",
        "starts with iso 2-letter country codes": "ALfalpah | al | 1",
        "starts with nato alphabet": "ALFAlpah | alfa | 3",
        "starts with us state abbreviations": "ALfalpah | al | 1",
      }
    `);

    expect(featuresOf("carpal")).toMatchInlineSnapshot(`
      {
        "can be broken into element symbols": "carpal | c | (ar) | (p) | (al)",
        "ends with element symbols": "carpAL | al | 4",
        "ends with iso 2-letter country codes": "carpAL | al | 4",
        "ends with roman numerals": "carpaL | l | 5",
        "ends with us state abbreviations": "carpAL | al | 4",
        "has 2 element symbols substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has 2 iso 2-letter country codes substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has 2 roman numerals substrings": "CarpaL | c | 0 | (l) | (5)",
        "has 2 us state abbreviations substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has at least 2 element symbols substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has at least 2 iso 2-letter country codes substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has at least 2 roman numerals substrings": "CarpaL | c | 0 | (l) | (5)",
        "has at least 2 us state abbreviations substrings": "CArPAl | ca | 0 | (pa) | (3)",
        "has element symbols substring": "CArpal | ca | 0",
        "has greek letters with 1 change as substring": "carPAl | pi | pa | i",
        "has iso 2-letter country codes substring": "CArpal | ca | 0",
        "has roman numerals substring": "Carpal | c | 0",
        "has us state abbreviations substring": "CArpal | ca | 0",
        "starts with element symbols": "CArpal | ca | 1",
        "starts with iso 2-letter country codes": "CArpal | ca | 1",
        "starts with roman numerals": "Carpal | c | 0",
        "starts with us state abbreviations": "CArpal | ca | 1",
      }
    `);
  });
});
