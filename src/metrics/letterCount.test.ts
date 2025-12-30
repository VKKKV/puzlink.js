import { describe, expect, test } from "vitest";
import { Wordlist } from "../lib/wordlist.js";
import { makeMetricGetter } from "./index.js";
import { letterCountMetrics } from "./letterCount.js";

describe("letterCountMetrics", () => {
  const metricsOf = makeMetricGetter(letterCountMetrics(), Wordlist.from([]));

  test("letter count metrics", () => {
    expect(metricsOf("salsas")).toMatchInlineSnapshot(`
      {
        "has exactly 0 'a's": "sAlsAs | (1) | (4)",
        "has exactly 0 'b's": "salsas",
        "has exactly 0 'c's": "salsas",
        "has exactly 0 'd's": "salsas",
        "has exactly 0 'e's": "salsas",
        "has exactly 0 'f's": "salsas",
        "has exactly 0 'g's": "salsas",
        "has exactly 0 'h's": "salsas",
        "has exactly 0 'i's": "salsas",
        "has exactly 0 'j's": "salsas",
        "has exactly 0 'k's": "salsas",
        "has exactly 0 'l's": "saLsas | (2)",
        "has exactly 0 'm's": "salsas",
        "has exactly 0 'n's": "salsas",
        "has exactly 0 'o's": "salsas",
        "has exactly 0 'p's": "salsas",
        "has exactly 0 'q's": "salsas",
        "has exactly 0 'r's": "salsas",
        "has exactly 0 's's": "SalSaS | (0) | (3) | (5)",
        "has exactly 0 't's": "salsas",
        "has exactly 0 'u's": "salsas",
        "has exactly 0 'v's": "salsas",
        "has exactly 0 'w's": "salsas",
        "has exactly 0 'x's": "salsas",
        "has exactly 0 'y's": "salsas",
        "has exactly 0 'z's": "salsas",
      }
    `);
  });
});
