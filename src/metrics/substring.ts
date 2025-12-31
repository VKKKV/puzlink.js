import { shortCategories, type Category } from "../data/categories.js";
import { interval, mapProduct } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Metric } from "./index.js";

function containsTimes(category: Category): Metric {
  const regex = new RegExp(category.items.join("|"), "g");
  return {
    metricName: T.Join([category.name, "substring count"]),
    maxNonStrict: 3,
    name: (times, strict) =>
      T.Join([
        "has",
        !strict && "at least",
        times,
        category.name,
        T.Inflect(times, "substring", "substrings"),
      ]),
    score: (slug) => {
      regex.lastIndex = 0;
      const matches = Array.from(slug.matchAll(regex));
      const indices = matches.flatMap((m) =>
        interval(m.index, m.index + m[0].length - 1),
      );
      return {
        score: matches.length,
        describe: (times) => {
          if (matches.length === 0) {
            return T.Row([T.Slug(slug)]);
          }
          const [first, ...rest] = matches;
          return T.Row([
            T.Highlight(slug, indices),
            T.Slug(first![0]),
            T.Indices(first!.index),
            ...rest
              .slice(0, Math.max(0, times - 1))
              .flatMap((m) => [T.Slug(m[0]), T.Indices(m.index)]),
            ...rest
              .slice(Math.max(0, times - 1))
              .flatMap((m) => [
                T.Collapsible(T.Slug(m[0])),
                T.Collapsible(T.Indices(m.index)),
              ]),
          ]);
        },
      };
    },
  };
}

/** Metrics for substrings. */
export function substringMetrics() {
  return [...mapProduct(containsTimes, shortCategories)];
}
