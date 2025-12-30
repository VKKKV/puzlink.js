import { accumulate, interval } from "../lib/util.js";
import { makeRenderer } from "./renderer.js";

const ordinal = new Intl.PluralRules("en", { type: "ordinal" });

export const renderToText = makeRenderer(
  {
    maxWidth: Infinity,
  },
  {
    fraction: (numerator, denominator) =>
      `${numerator.toString()}/${denominator.toString()}`,
    highlight: (slug, indices) => {
      const capitalized = [];
      for (let i = 0; i < slug.length; i++) {
        capitalized.push(
          indices.includes(i) ? slug[i]!.toUpperCase() : slug[i]!,
        );
      }
      return capitalized.join("");
    },
    indices: (indices) => indices.join(", "),
    join: (strings) => strings.join(" "),
    ordinal: (rank) => {
      const count = ordinal.select(rank);
      const suffix =
        count === "one"
          ? "st"
          : count === "two"
            ? "nd"
            : count === "few"
              ? "rd"
              : "th";
      return `${rank.toString()}${suffix}`;
    },
    slug: (count, slug) => (count === 1 ? slug : `'${slug}'s`),
    text: (text) => text,
    times: (count) => {
      switch (count) {
        case 1:
          return "once";
        case 2:
          return "twice";
        case 3:
          return "thrice";
        default:
          return `${count.toString()} times`;
      }
    },
  },
  (table, options) => {
    const widthPerColumn = interval(0, table.columns).map((c) =>
      c === table.columns
        ? Infinity
        : Math.max(...table.rows.map((r) => r.cells[c]?.rendered.length ?? 0)),
    );

    const collapseStart = accumulate(
      widthPerColumn,
      0,
      (a, b) => a + b + 1,
    ).findIndex(
      (w, c) =>
        w >= options.maxWidth &&
        table.rows.every((r) => r.cells[c]?.collapsible ?? true),
    );

    return table.rows
      .map((row) => {
        return row.cells
          .map((cell, c) =>
            c < collapseStart
              ? cell.rendered.padEnd(widthPerColumn[c]!, " ")
              : c === collapseStart
                ? "..."
                : null,
          )
          .filter((s): s is string => s !== null)
          .join(" ")
          .trimEnd();
      })
      .join("\n");
  },
);
