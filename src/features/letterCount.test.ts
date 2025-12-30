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
        "has letter counts in arithmetic sequence": "salsas | 1 | l | (2) | (a) | (3) | (s)",
      }
    `);
    expect(featuresOf("abba")).toMatchInlineSnapshot(`
      {
        "has equal letter counts": "abba | 2",
      }
    `);
    expect(featuresOf("dresser")).toMatchInlineSnapshot(`
      {
        "has one of two letter counts": "dresser | 1 | d | 2 | ers",
      }
    `);
  });
});
