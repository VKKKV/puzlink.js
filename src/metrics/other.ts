import { letterMorse } from "../data/morse.js";
import { scrabbleLetterScore } from "../data/scrabble.js";
import { mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Metric } from "./index.js";

function scrabbleScore(): Metric {
  return {
    metricName: T.Text("scrabble score"),
    maxNonStrict: 0,
    name: (score, strict) =>
      T.Join(["has scrabble score", !strict && "at least", score]),
    score: (slug) => {
      const points = Array.from(slug, (letter) => scrabbleLetterScore[letter]!);
      const total = points.reduce((a, b) => a + b, 0);
      return {
        score: total,
        describe: () =>
          T.Row([T.Slug(slug), T.Text(total), ...points.map((p) => T.Text(p))]),
      };
    },
  };
}

function morseCount(kind: {
  one: string;
  other: string;
  chars: string;
}): Metric {
  return {
    metricName: T.Join(["morse", kind.other, "count"]),
    maxNonStrict: 0,
    name: (count, strict) =>
      T.Join([
        "has morse code with",
        !strict && "at least",
        T.Count(count, kind.one, kind.other),
      ]),
    score: (slug) => {
      const morse = Array.from(slug, (letter) => letterMorse[letter]!).join(
        " ",
      );
      const count = Array.from(morse).filter((c) =>
        kind.chars.includes(c),
      ).length;
      return {
        score: count,
        describe: () => T.Row([T.Slug(slug), T.Text(count), T.Slug(morse)]),
      };
    },
  };
}

/** Miscellaneous metrics. */
export function otherMetrics() {
  return [
    scrabbleScore(),
    ...mapProduct(morseCount, [
      { chars: ".", one: "dot", other: "dots" },
      { chars: "-", one: "dash", other: "dashes" },
      { chars: ".-", one: "dot or dash", other: "dots and dashes" },
    ]),
  ];
}
