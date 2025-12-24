import {
  categories,
  shortCategories,
  type Category,
} from "../data/categories.js";
import { getSyllables } from "../lib/syllables.js";
import { mapProduct } from "../lib/util.js";
import type { Feature } from "./index.js";

// TODO(maybe): contains anagram, for long categories?
// TODO(maybe): contains multiple, for short categories?
// TODO(maybe): looking for long substrings that are words; we need a good heuristic for these, because we e.g. don't want to report that NATURAL is a substring of PRETERNATURALLY, but we do want to report STRANGE is a substring of FOREST RANGER (a decent heuristic might be syllable-splitting?)

function containsOne(category: Category): Feature {
  const regex = new RegExp(category.items.join("|"));
  return {
    name: `has ${category.name} substring`,
    property: (slug) => {
      const match = regex.exec(slug);
      if (!match) {
        return null;
      }
      return `${slug} contains ${match[0]}`;
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

function hasCool(): Feature {
  return {
    name: "has cool substring",
    property: (slug, { wordlist }) => {
      // A "cool" substring is one that's length >= 4 and doesn't align with
      // syllable boundaries.
      const candidates = [];

      const syllables = getSyllables(slug);
      const boundaries = [0];
      for (const s of syllables) {
        boundaries.push(boundaries.at(-1)! + s.length);
      }

      for (let length = 4; length < slug.length; length++) {
        for (let offset = 0; offset < slug.length - length + 1; offset++) {
          if (
            boundaries.includes(offset) ||
            boundaries.includes(offset + length)
          ) {
            continue;
          }
          const substring = slug.slice(offset, offset + length);
          if (wordlist.isWord(substring)) {
            candidates.push(substring);
          }
        }
      }

      return candidates.length > 0
        ? `${slug} has ${candidates.join(", ")}`
        : null;
    },
  };
}

export function substringFeatures(): Feature[] {
  return [
    ...mapProduct(containsOne, categories),
    ...mapProduct(startsWithOne, categories),
    ...mapProduct(endsWithOne, categories),
    ...mapProduct(canBeBrokenInto, shortCategories),
    hasCool(),
  ];
}
