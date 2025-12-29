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
        "can append a letter": "at | s | ats",
        "can append s": "at | s | ats",
        "can insert a letter": "at | b | 0 | bat | (c) | (0) | (cat) | (s) | (2) | (ats)",
        "can insert b": "at | b | 0 | bat",
        "can insert c": "at | c | 0 | cat",
        "can insert s": "at | s | 2 | ats",
        "can prepend a letter": "at | b | bat | (c) | (cat)",
        "can prepend b": "at | b | bat",
        "can prepend c": "at | c | cat",
        "can reverse": "at | ta",
        "can rotate": "at | 1 | ta",
        "can swap adjacent letters": "at | 0 | a | t | ta",
        "can swap ends": "at | a | t | ta",
        "has transadd": "at | b | bat | (c) | (cat) | (s) | (ats)",
        "has transadd with b": "at | b | bat",
        "has transadd with c": "at | c | cat",
        "has transadd with s": "at | s | ats",
        "is anagram": "at | ta",
      }
    `);
    expect(featuresOf("bats")).toMatchInlineSnapshot(`
      {
        "can behead": "bats | b | ats",
        "can change a letter": "bats | 3 | s | h | bath",
        "can change a letter to h": "bats | h | 3 | s | bath",
        "can curtail": "bats | s | bat",
        "can delete a letter": "bats | b | 0 | ats | (s) | (3) | (bat)",
        "can delete b": "bats | b | 0 | ats",
        "can delete s": "bats | s | 3 | bat",
        "can rotate": "bats | 1 | atsb | (2) | (tsba)",
        "has transdelete": "bats | b | ats | (s) | (bat)",
        "has transdelete with b": "bats | b | ats",
        "has transdelete with s": "bats | s | bat",
        "is anagram": "bats | atsb | (tsba)",
      }
    `);
  });
});
