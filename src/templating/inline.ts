/** A numerical count, plus an inflected noun, like "2 dogs". */
export type Count = {
  type: "count";
  count: number;
  one: string;
  other: string;
};
export function Count(count: number, one: string, other: string): Count {
  return { type: "count", count, one, other };
}

/** A slug with higlighting of characters at the given indices. */
export type Highlight = {
  type: "highlight";
  slug: string;
  highlights: number[];
};
export function Highlight(slug: string, indices: number[]): Highlight {
  return { type: "highlight", slug, highlights: indices };
}

/** A zero-based index into a thing. */
export type Index = {
  type: "index";
  index: number;
};
export function Index(index: number): Index {
  return { type: "index", index };
}

/** A list of zero-based indices. */
export type Indices = {
  type: "indices";
  indices: number[];
};
export function Indices(indices: number[]): Indices {
  return { type: "indices", indices };
}

/** A word inflected for being singular or plural, like "is" or "are". */
export type Inflect = {
  type: "inflect";
  count: number;
  one: string;
  other: string;
};
export function Inflect(count: number, one: string, other: string): Inflect {
  return { type: "inflect", count, one, other };
}

/** An ordinal number (like 1st or -2nd). */
export type Ordinal = {
  type: "ordinal";
  rank: number;
};
export function Ordinal(rank: number): Ordinal {
  return { type: "ordinal", rank };
}

/** A slug-like thing, usually printed in monospace. */
export type Slug = {
  type: "slug";
  slug: string;
};
export function Slug(slug: string): Slug {
  return { type: "slug", slug };
}

/** A non-slug, plain text string. */
export type Text = {
  type: "text";
  text: string;
};
export function Text(text: string): Text {
  return { type: "text", text };
}

/** An inline tag. */
export type Inline =
  | Count
  | Highlight
  | Index
  | Indices
  | Inflect
  | Ordinal
  | Slug
  | Text;

/** A renderer for inline tags. */
export type InlineRenderer<T> = {
  count: (count: number, one: string, other: string) => T;
  highlight: (slug: string, indices: number[]) => T;
  index: (index: number) => T;
  indices: (indices: number[]) => T;
  inflect: (count: number, one: string, other: string) => T;
  ordinal: (rank: number) => T;
  slug: (slug: string) => T;
  text: (text: string) => T;
};

/** Render an inline tag. */
export function renderInline<T>(
  renderer: InlineRenderer<T>,
  inline: Inline,
): T {
  switch (inline.type) {
    case "count":
      return renderer.count(inline.count, inline.one, inline.other);
    case "highlight":
      return renderer.highlight(inline.slug, inline.highlights);
    case "index":
      return renderer.index(inline.index);
    case "indices":
      return renderer.indices(inline.indices);
    case "inflect":
      return renderer.inflect(inline.count, inline.one, inline.other);
    case "ordinal":
      return renderer.ordinal(inline.rank);
    case "slug":
      return renderer.slug(inline.slug);
    case "text":
      return renderer.text(inline.text);
  }
}
