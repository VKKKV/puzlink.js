import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeMetricGetter } from "./index.js";
import { substringMetrics } from "./substring.js";

describe("substringMetrics", () => {
  const metricsOf = makeMetricGetter(substringMetrics(), Wordlist.from([]));

  test("substring metrics", () => {
    expect(metricsOf("alfalpah")).toMatchInlineSnapshot(`
      {
        "has 1 solfege substring": "alFAlpah | fa | 2",
        "has 2 roman numerals substrings": "aLfaLpah | l | 1 | l | 4",
        "has 3 iso 2-letter country codes substrings": "ALfALPAh | al | 0 | al | 3 | pa | 5",
        "has 3 us state abbreviations substrings": "ALfALPAh | al | 0 | al | 3 | pa | 5",
        "has 5 element symbols substrings": "ALFALPAH | al | 0 | f | 2 | al | 3 | pa | 5 | h | 7",
      }
    `);
    expect(metricsOf("carpal")).toMatchInlineSnapshot(`
      {
        "has 2 element symbols substrings": "CArPAl | ca | 0 | pa | 3",
        "has 2 iso 2-letter country codes substrings": "CArPAl | ca | 0 | pa | 3",
        "has 2 roman numerals substrings": "CarpaL | c | 0 | l | 5",
        "has 2 us state abbreviations substrings": "CArPAl | ca | 0 | pa | 3",
      }
    `);
  });
});
