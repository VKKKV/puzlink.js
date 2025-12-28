import { renderInline, type Inline, type InlineRenderer } from "./inline.js";

export type Cell = {
  type: "cell";
  /**
   * If true, this cell can be omitted for space. Collapsible cells MUST be at
   * the end of a row.
   */
  collapsible: boolean;
  content: Inline;
};
export function Cell(options: { collapsible?: boolean }, content: Inline): Cell;
export function Cell(content: Inline): Cell;
export function Cell(
  optionsOrContent: { collapsible?: boolean } | Inline,
  maybeContent?: Inline,
): Cell {
  const content = (maybeContent ?? optionsOrContent) as Inline;
  const options = (maybeContent ? optionsOrContent : {}) as {
    collapsible?: boolean;
  };

  return {
    type: "cell",
    collapsible: options.collapsible ?? false,
    content,
  };
}
export function Collapsible(content: Inline): Cell {
  return Cell({ collapsible: true }, content);
}

export type Row = {
  type: "row";
  cells: Cell[];
};
type CellLike = Cell | Inline;
export function Row(options: never, cells: CellLike[]): Row;
export function Row(cells: CellLike[]): Row;
export function Row(cells: CellLike[]): Row {
  return {
    type: "row",
    cells: cells.map((c) => {
      return typeof c === "object" && "type" in c && c.type === "cell"
        ? c
        : Cell(c);
    }),
  };
}

export type Table = {
  type: "table";
  /**
   * If true, then the first cell of each row should be interpreted as a
   * potential sort of the slugs. Sortable tables MUST have each non-header
   * row start with an input slug.
   */
  sortable: boolean;
  columns: number;
  rows: Row[];
};
type RowLike = Row | CellLike[];
export function Table(options: { sortable?: boolean }, rows: RowLike[]): Table;
export function Table(rows: RowLike[]): Table;
export function Table(
  optionsOrRow: { sortable?: boolean } | RowLike[],
  maybeRows?: RowLike[],
): Table {
  const rows = (maybeRows ?? optionsOrRow) as RowLike[];
  const options = (maybeRows ? optionsOrRow : {}) as { sortable?: boolean };
  const mappedRows = rows.map((r) => {
    return typeof r === "object" && "type" in r ? r : Row(r);
  });
  const columns = Math.max(...mappedRows.map((r) => r.cells.length));

  return {
    type: "table",
    sortable: options.sortable ?? false,
    columns,
    rows: mappedRows,
  };
}
export function Sortable(rows: RowLike[]): Table {
  return Table({ sortable: true }, rows);
}

type CellJoinedTable<I> = Omit<Table, "rows"> & {
  rows: (Omit<Row, "cells"> & {
    cells: (Cell & { rendered: I })[];
  })[];
};

/** A renderer for tables. */
export type TableRenderer<I, T> = (table: CellJoinedTable<I>) => T;

/** Render a table. */
export function renderTable<I, T>(
  inline: InlineRenderer<I>,
  table: TableRenderer<I, T>,
  template: Table,
): T {
  return table({
    ...template,
    rows: template.rows.map((row) => {
      return {
        ...row,
        cells: row.cells.map((cell) => {
          return {
            ...cell,
            rendered: renderInline(inline, cell.content),
          };
        }),
      };
    }),
  });
}
