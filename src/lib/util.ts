/* eslint-disable @typescript-eslint/no-explicit-any */

/** Capitalizes the letters of a slug at the given indices. */
export function capitalizeAt(slug: string, indices: number[]): string {
  const capitalized = [];
  for (let i = 0; i < slug.length; i++) {
    capitalized.push(indices.includes(i) ? slug[i]!.toUpperCase() : slug[i]!);
  }
  return capitalized.join("");
}

/** Prints the index of a slug at the given indices. */
export function printIndexSlug(slug: string, indices: number[]): string {
  indices = Array.from(new Set(indices)).sort((a, b) => a - b);
  const isInterval =
    indices.length > 2 &&
    Math.max(...indices) - Math.min(...indices) === indices.length - 1;
  const indexString = isInterval
    ? `${Math.min(...indices).toString()}..${Math.max(...indices).toString()}`
    : `${indices.slice(0, 5).join(", ")}${indices.length > 5 ? ", ..." : ""}`;
  return `index(${slug}, ${indexString}) = ${capitalizeAt(slug, indices)}`;
}

/** Returns an array of numbers from start to end (inclusive). */
export function interval(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type Product<A extends Iterable<any>[]> = A extends [infer First, ...infer Rest]
  ? First extends Iterable<infer F>
    ? Rest extends Iterable<any>[]
      ? [F, ...Product<Rest>]
      : never
    : never
  : [];

/** Cartesian product of iterables. */
function* product<const Args extends Iterable<any>[]>(
  ...args: Args
): Generator<Product<Args>> {
  if (args.length === 1) {
    for (const arg of args[0]!) {
      yield [arg] as Product<Args>;
    }
    return;
  }
  const [first, ...rest] = args;
  for (const a of first!) {
    for (const b of product(...rest)) {
      yield [a, ...b] as Product<Args>;
    }
  }
}

type IterMap<A extends any[]> = A extends [infer First, ...infer Rest]
  ? [Iterable<First>, ...IterMap<Rest>]
  : [];

/** Map a function to a product of iterators. */
export function* mapProduct<const Args extends any[], R>(
  fn: (...args: Args) => R,
  ...args: IterMap<Args>
): Generator<R> {
  for (const arg of product(...args)) {
    yield fn(...(arg as unknown as Args));
  }
}

/** Returns the ordinal suffix of the given number. */
export function ordinal(n: number): string {
  const suffix =
    Math.abs(n) % 100 >= 11 && Math.abs(n) % 100 <= 14
      ? "th"
      : Math.abs(n) % 10 === 1
        ? "st"
        : Math.abs(n) % 10 === 2
          ? "nd"
          : Math.abs(n) % 10 === 3
            ? "rd"
            : "th";
  return `${n.toString()}${suffix}`;
}

const aCharCode = "a".charCodeAt(0);

/** Caesar shift a slug. */
export function caesar(slug: string, n: number): string {
  n %= 26;
  return Array.from(slug, (c) => {
    return String.fromCharCode(
      ((c.charCodeAt(0) - aCharCode + n + 26) % 26) + aCharCode,
    );
  }).join("");
}
