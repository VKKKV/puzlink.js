import type { Inline, InlineRenderer } from "./inline.js";
import { renderInline } from "./inline.js";
import type { Table, TableRenderer } from "./table.js";
import { renderTable } from "./table.js";

export type Renderer<I, T, Options extends object> = {
  (inline: Inline, options?: Options): I;
  (table: Table, options?: Options): T;
  (template: Inline | Table, options?: Options): I | T;
};

export function makeRenderer<I, T, Options extends object>(
  defaultOptions: Options,
  inline:
    | ((inline: Inline, options: Options) => I)
    | InlineRenderer<I, Options>,
  table: TableRenderer<I, T, Options>,
): Renderer<I, T, Options> {
  return function render(template, options = defaultOptions) {
    if (template.type === "table") {
      return renderTable(inline, table, template, options);
    }
    return renderInline(inline, template, options);
  } as Renderer<I, T, Options>;
}
