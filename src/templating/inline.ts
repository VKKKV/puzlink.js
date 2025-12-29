import type { ArrayLike } from "./util.js";
import { toArray } from "./util.js";

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

/**
 * A lone slug, usually printed in monospace, possibly inflected for being
 * plural. Like "s" or "'s's".
 *
 * We have special handling for pluralized slugs because they could have weird
 * formatting.
 */
export type Slug = {
  type: "slug";
  count: number;
  slug: string;
};
export function Slug(count: number, slug: string): Slug;
export function Slug(slug: string): Slug;
export function Slug(countOrSlug: number | string, maybeSlug?: string): Slug {
  return {
    type: "slug",
    count: typeof countOrSlug === "number" ? countOrSlug : 1,
    slug: typeof countOrSlug === "string" ? countOrSlug : maybeSlug!,
  };
}

/** A non-slug, plain text string. */
export type Text = {
  type: "text";
  text: string;
};
export function Text(text: string | number): Text {
  return { type: "text", text: text.toString() };
}

/** A word like "once", "twice", etc. */
export type Times = {
  type: "times";
  count: number;
};
export function Times(count: number): Times {
  return { type: "times", count };
}

/** An inline tag. */
export type Inline =
  | Fraction
  | Highlight
  | Indices
  | Join
  | Ordinal
  | Slug
  | Text
  | Times;

// Inline helpers.

/** A numerical count, plus an inflected noun, like "2 dogs". */
export function Count(count: number, one: string, other: string): Join {
  return Join([count, Inflect(count, one, other)]);
}
/** A numerical count, plus a slug, like "1 s" or "2 's's". */
export function CountSlug(count: number, slug: string): Join {
  return Join([count, Slug(count, slug)]);
}
/** A word inflected for being singular or plural, like "is" or "are". */
export function Inflect(
  count: number,
  one: string | number | Inline,
  other: string | number | Inline,
): Inline {
  return count === 1
    ? typeof one === "object"
      ? one
      : Text(one)
    : typeof other === "object"
      ? other
      : Text(other);
}

/** A renderer for inline tags. */
export type InlineRenderer<T, Options extends object> = {
  fraction: (numerator: number, denominator: number, options: Options) => T;
  highlight: (slug: string, indices: number[], options: Options) => T;
  indices: (indices: number[], options: Options) => T;
  join: (items: T[], options: Options) => T;
  ordinal: (rank: number, options: Options) => T;
  slug: (count: number, slug: string, options: Options) => T;
  text: (text: string, options: Options) => T;
  times: (count: number, options: Options) => T;
};

/** Render an inline tag. */
export function renderInline<T, Options extends object>(
  renderer: InlineRenderer<T, Options>,
  inline: Inline,
  options: Options,
): T {
  switch (inline.type) {
    case "fraction":
      return renderer.fraction(inline.numerator, inline.denominator, options);
    case "highlight":
      return renderer.highlight(inline.slug, inline.highlights, options);
    case "indices":
      return renderer.indices(inline.indices, options);
    case "join":
      return renderer.join(
        inline.items.map((i) => renderInline(renderer, i, options)),
        options,
      );
    case "ordinal":
      return renderer.ordinal(inline.rank, options);
    case "slug":
      return renderer.slug(inline.count, inline.slug, options);
    case "text":
      return renderer.text(inline.text, options);
    case "times":
      return renderer.times(inline.count, options);
  }
}
