import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { wordplayFeatures } from "./wordplay.js";
import { makeFeatureGetter } from "./index.js";

describe("wordplayFeatures", () => {
  const featuresOf = makeFeatureGetter(
    wordplayFeatures(),
    Wordlist.from([
      "at",
      "ats",
      "atsb",
      "bar",
      "bat",
      "bath",
      "cat",
      "ta",
      "tsba",
    ]),
  );

  test("wordplay features", () => {
    expect(featuresOf("at")).toMatchInlineSnapshot(`
      {
        "can append 1": "at + 1 = ats",
        "can append s": "at + s = ats",
        "can insert 1": "at insert 1 = bat, cat, ats",
        "can insert b": "at insert b = bat",
        "can insert c": "at insert c = cat",
        "can insert s": "at insert s = ats",
        "can prepend 1": "1 + at = bat, cat",
        "can prepend b": "b + at = bat",
        "can prepend c": "c + at = cat",
        "can reverse": "at reversed = ta",
        "can rotate": "at rotate 1 = ta",
        "can swap adjacent letters": "at swap 1, 2 = ta",
        "can swap ends": "at swap ends = ta",
        "has transadd 1": "at transadd 1 = bat, cat, ats",
        "has transadd b": "at transadd b = bat",
        "has transadd c": "at transadd c = cat",
        "has transadd s": "at transadd s = ats",
        "is anagram": "at anagrammed = ta",
      }
    `);
    expect(featuresOf("bats")).toMatchInlineSnapshot(`
      {
        "can behead 1": "bats behead 1 = ats",
        "can change 1": "bats change 1 = bath",
        "can change to h": "bats change to h = bath",
        "can curtail 1": "bats curtail 1 = bat",
        "can delete 1": "bats delete 1 = ats, bat",
        "can delete b": "bats delete b = ats",
        "can delete s": "bats delete s = bat",
        "can rotate": "bats rotate 1 = atsb (alt: tsba)",
        "has transdelete 1": "bats transdelete 1 = ats, bat",
        "has transdelete b": "bats transdelete b = ats",
        "has transdelete s": "bats transdelete s = bat",
        "is anagram": "bats anagrammed = atsb, tsba",
      }
    `);
  });
});
