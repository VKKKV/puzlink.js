import type { ArrayLike } from "./util.js";
import { toArray } from "./util.js";

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

/** A (non-reduced) fraction of things. */
export type Fraction = {
  type: "fraction";
  numerator: number;
  denominator: number;
};
export function Fraction(numerator: number, denominator: number): Fraction {
  return { type: "fraction", numerator, denominator };
}

/** A slug with higlighting of characters at the given indices. */
export type Highlight = {
  type: "highlight";
  slug: string;
  highlights: number[];
};
export function Highlight(
  slug: string,
  highlights: ArrayLike<number>,
): Highlight {
  return {
    type: "highlight",
    slug,
    highlights: toArray(highlights),
  };
}

/** A list of zero-based indices into a thing. */
export type Indices = {
  type: "indices";
  indices: number[];
};
export function Indices(indices: ArrayLike<number>): Indices {
  return {
    type: "indices",
    indices: toArray(indices),
  };
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

/** A space-separated list of items. */
export type Join = {
  type: "join";
  items: Inline[];
};
export function Join(items: ArrayLike<string | number | Inline>): Join {
  return {
    type: "join",
    items: toArray(items).map((item) =>
      typeof item === "object" ? item : Text(item),
    ),
  };
}

/** An ordinal number (like 1st or -2nd). */
export type Ordinal = {
  type: "ordinal";
  rank: number;
};
export function Ordinal(rank: number): Ordinal {
  return { type: "ordinal", rank };
}

/** A slug, usually printed in monospace. */
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
export function Text(text: string | number): Text {
  return { type: "text", text: text.toString() };
}

/** An inline tag. */
export type Inline =
  | Count
  | Fraction
  | Highlight
  | Indices
  | Inflect
  | Join
  | Ordinal
  | Slug
  | Text;

/** A renderer for inline tags. */
export type InlineRenderer<T, Options extends object> = {
  count: (count: number, one: string, other: string, options: Options) => T;
  fraction: (numerator: number, denominator: number, options: Options) => T;
  highlight: (slug: string, indices: number[], options: Options) => T;
  indices: (indices: number[], options: Options) => T;
  inflect: (count: number, one: string, other: string, options: Options) => T;
  join: (items: T[], options: Options) => T;
  ordinal: (rank: number, options: Options) => T;
  slug: (slug: string, options: Options) => T;
  text: (text: string, options: Options) => T;
};

/** Render an inline tag. */
export function renderInline<T, Options extends object>(
  renderer: InlineRenderer<T, Options>,
  inline: Inline,
  options: Options,
): T {
  switch (inline.type) {
    case "count":
      return renderer.count(inline.count, inline.one, inline.other, options);
    case "fraction":
      return renderer.fraction(inline.numerator, inline.denominator, options);
    case "highlight":
      return renderer.highlight(inline.slug, inline.highlights, options);
    case "indices":
      return renderer.indices(inline.indices, options);
    case "inflect":
      return renderer.inflect(inline.count, inline.one, inline.other, options);
    case "join":
      return renderer.join(
        inline.items.map((i) => renderInline(renderer, i, options)),
        options,
      );
    case "ordinal":
      return renderer.ordinal(inline.rank, options);
    case "slug":
      return renderer.slug(inline.slug, options);
    case "text":
      return renderer.text(inline.text, options);
  }
}
