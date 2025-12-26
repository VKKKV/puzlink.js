import {
  categories,
  longCategories,
  shortCategories,
  type Category,
} from "../data/categories.js";
import { LetterBitsets } from "../lib/letterBitset.js";
import { capitalizeAt, interval, mapProduct } from "../lib/util.js";
import type { Feature } from "./index.js";

// TODO(maybe): looking for long substrings that are words; we need a good heuristic for these, because we e.g. don't want to report that UNDERSCORE is a substring of UNDERSCORES, but we do want to report STRANGE is a substring of FOREST RANGER

function containsOne(category: Category): Feature {
  const regex = new RegExp(category.items.join("|"));
  return {
    name: `has ${category.name} substring`,
    property: (slug) => {
      const match = regex.exec(slug);
      if (!match) {
        return null;
      }
      const indices = interval(match.index, match.index + match[0].length - 1);
      return `${slug} contains ${match[0]}: ${capitalizeAt(slug, indices)}`;
    },
  };
}

function containsTimes(
  category: Category,
  times: number,
  strict: boolean,
): Feature {
  const regex = new RegExp(category.items.join("|"), "g");
  return {
    name: strict
      ? `has ${category.name} substring, ${times.toString()} times`
      : `has ${category.name} substring, at least ${times.toString()} times`,
    property: (slug) => {
      const matches = [];

      for (const match of slug.matchAll(regex)) {
        if (strict && matches.length >= times) {
          return null;
        }
        matches.push(match);
      }
      if (strict ? matches.length !== times : matches.length < times) {
        return null;
      }

      const indices = matches.flatMap((m) =>
        interval(m.index, m.index + m[0].length - 1),
      );
      return `${slug} contains ${matches.map((m) => m[0]).join(", ")}: ${capitalizeAt(slug, indices)}`;
    },
  };
}

function startsWithOne(category: Category): Feature {
  const regex = new RegExp(`^(${category.items.join("|")})`);
  return {
    name: `starts with ${category.name}`,
    property: (slug) => {
      const match = regex.exec(slug);
      if (!match) {
        return null;
      }
      return `${slug} starts with ${match[0]}`;
    },
  };
}

function endsWithOne(category: Category): Feature {
  const regex = new RegExp(`(${category.items.join("|")})$`);
  return {
    name: `ends with ${category.name}`,
    property: (slug) => {
      const match = regex.exec(slug);
      if (!match) {
        return null;
      }
      return `${slug} ends with ${match[0]}`;
    },
  };
}

function canBeBrokenInto(category: Category): Feature {
  const regex = new RegExp(`^(${category.items.join("|")})+$`);
  return {
    name: `can be broken into ${category.name}`,
    property: (slug) => {
      let match = regex.exec(slug);
      if (!match) {
        return null;
      }
      const parts = [];
      let remaining = slug;
      while (match !== null) {
        const suffix = match[1]!;
        parts.push(suffix);
        remaining = remaining.slice(0, -suffix.length);
        match = regex.exec(remaining);
      }
      return `${slug} = ${parts.reverse().join(" ")}`;
    },
  };
}

function hasAnagram(category: Category): Feature {
  const bitsets = new LetterBitsets(category.items);
  return {
    name: `has ${category.name} anagram substring`,
    property: (slug) => {
      const match = Array.from(bitsets.matchSubstring(slug));
      if (match.length !== 1) {
        return null;
      }
      const {
        start,
        words: [word],
      } = match[0]!;
      return `${slug} has anagram ${word!}: ${capitalizeAt(slug, interval(start, start + word!.length - 1))}`;
    },
  };
}

function hasChangeAny(category: Category): Feature {
  const changes = category.items.map((item) => ({
    item,
    regex: new RegExp(
      interval(0, item.length)
        .map((i) => `${item.slice(0, i)}.${item.slice(i + 1)}`)
        .join("|"),
    ),
  }));
  const regex = new RegExp(`(${changes.map((c) => c.regex.source).join("|")})`);
  return {
    name: `has ${category.name} change 1 substring`,
    property: (slug) => {
      const match = regex.exec(slug);
      if (!match) {
        return null;
      }
      // Check there's *exactly* one:
      let matched: string | null = null;
      for (const { item, regex } of changes) {
        if (regex.exec(slug)) {
          if (matched !== null) {
            return null;
          }
          matched = item;
        }
      }
      const { index } = match;
      return `${slug} has change 1 of ${matched!}: ${capitalizeAt(slug, interval(index, index + matched!.length - 1))}`;
    },
  };
}

export function substringFeatures(): Feature[] {
  return [
    ...mapProduct(containsOne, categories),
    ...mapProduct(containsTimes, shortCategories, interval(2, 5), [
      true,
      false,
    ]),
    ...mapProduct(startsWithOne, categories),
    ...mapProduct(endsWithOne, categories),
    ...mapProduct(canBeBrokenInto, shortCategories),
    ...mapProduct(hasAnagram, longCategories),
    ...mapProduct(hasChangeAny, longCategories),
  ];
}
