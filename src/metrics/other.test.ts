import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeMetricGetter } from "./index.js";
import { otherMetrics } from "./other.js";

describe("otherMetrics", () => {
  const metricsOf = makeMetricGetter(otherMetrics(), Wordlist.from([]));

  test("other metrics", () => {
    expect(metricsOf("level")).toMatchInlineSnapshot(`
      {
        "has morse code with 11 dots": "level | 11 | .-.. . ...- . .-..",
        "has morse code with 14 dots and dashes": "level | 14 | .-.. . ...- . .-..",
        "has morse code with 3 dashes": "level | 3 | .-.. . ...- . .-..",
        "has scrabble score 8": "level | 8 | 1 | 1 | 4 | 1 | 1",
      }
    `);
    expect(metricsOf("abca")).toMatchInlineSnapshot(`
      {
        "has morse code with 12 dots and dashes": "abca | 12 | .- -... -.-. .-",
        "has morse code with 5 dashes": "abca | 5 | .- -... -.-. .-",
        "has morse code with 7 dots": "abca | 7 | .- -... -.-. .-",
        "has scrabble score 8": "abca | 8 | 1 | 3 | 3 | 1",
      }
    `);
  });
});
