import type { Inline, InlineRenderer } from "./inline.js";
import { renderInline } from "./inline.js";
import type { Table, TableRenderer } from "./table.js";
import { renderTable } from "./table.js";

export type Renderer<I, T> = {
  (inline: Inline): I;
  (table: Table): T;
  (template: Inline | Table): I | T;
};

export function makeRenderer<I, T>(
  inline: InlineRenderer<I>,
  table: TableRenderer<I, T>,
): Renderer<I, T> {
  return function render(template) {
    if (template.type === "table") {
      return renderTable(inline, table, template);
    }
    return renderInline(inline, template);
  } as Renderer<I, T>;
}
