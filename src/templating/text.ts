import { accumulate, interval } from "../lib/util.js";
import type { Inline } from "./inline.js";
import { makeRenderer } from "./renderer.js";
import type { Table } from "./table.js";

const ordinal = new Intl.PluralRules("en", { type: "ordinal" });

export const renderToText = (template: Inline | Table, maxWidth = Infinity) => {
  const render = makeRenderer(
    {
      count: (count, one, other) =>
        `${count.toString()} ${count === 1 ? one : other}`,
      highlight: (slug, indices) => {
        const nonNegIndices = indices.map((i) =>
          i >= 0 ? i : slug.length + i,
        );
        const capitalized = [];
        for (let i = 0; i < slug.length; i++) {
          capitalized.push(
            nonNegIndices.includes(i) ? slug[i]!.toUpperCase() : slug[i]!,
          );
        }
        return capitalized.join("");
      },
      index: (index) => index.toString(),
      indices: (indices) => indices.join(" "),
      inflect: (count, one, other) => (count === 1 ? one : other),
      ordinal: (rank) => {
        const count = ordinal.select(rank);
        const suffix = count === "one" ? "st" : count === "two" ? "nd" : "th";
        return `${rank.toString()}${suffix}`;
      },
      slug: (slug) => slug,
      text: (text) => text,
    },
    (table) => {
      const widthPerColumn = interval(0, table.columns).map((c) =>
        c === table.columns
          ? Infinity
          : Math.max(
              ...table.rows.map((r) => r.cells[c]?.rendered.length ?? 0),
            ),
      );

      const collapseStart = accumulate(
        widthPerColumn,
        0,
        (a, b) => a + b + 1,
      ).findIndex(
        (w, c) =>
          w >= maxWidth &&
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

  return render(template);
};
