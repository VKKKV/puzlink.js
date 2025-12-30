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
        "has greek letters anagram substring": "alfALPAH | alpha | 3 | alpah",
        "has greek letters with 1 change as substring": "alfalPAh | pi | a | i",
        "has nato alphabet anagram substring": "ALFAlpah | alfa | 0 | alfa",
        "has nato alphabet substring": "ALFAlpah | alfa | 0",
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
        "has greek letters with 1 change as substring": "carPAl | pi | a | i",
        "starts with element symbols": "CArpal | ca | 1",
        "starts with iso 2-letter country codes": "CArpal | ca | 1",
        "starts with roman numerals": "Carpal | c | 0",
        "starts with us state abbreviations": "CArpal | ca | 1",
      }
    `);
  });
});
