import { LETTERS } from "../lib/letterDistribution.js";
import {
  caesar,
  enumerate,
  interval,
  mapProduct,
  windows,
} from "../lib/util.js";
import type { Feature } from "./index.js";

function prependWith(letter: string): Feature {
  return {
    name: `can prepend ${letter}`,
    property: (slug, { wordlist }) => {
      const prepended = `${letter}${slug}`;
      return wordlist.isWord(prepended)
        ? `${letter} + ${slug} = ${prepended}`
        : null;
    },
  };
}

function prependAny(): Feature {
  return {
    name: "can prepend 1",
    property: (slug, { wordlist }) => {
      const prepended = wordlist.filterWords(
        Array.from(LETTERS).map((letter) => `${letter}${slug}`),
      );
      return prepended.length === 0
        ? null
        : `1 + ${slug} = ${prepended.join(", ")}`;
    },
  };
}

function appendWith(letter: string): Feature {
  return {
    name: `can append ${letter}`,
    property: (slug, { wordlist }) => {
      const appended = `${slug}${letter}`;
      return wordlist.isWord(appended)
        ? `${slug} + ${letter} = ${appended}`
        : null;
    },
  };
}

function appendAny(): Feature {
  return {
    name: "can append 1",
    property: (slug, { wordlist }) => {
      const appended = wordlist.filterWords(
        Array.from(LETTERS).map((letter) => `${slug}${letter}`),
      );
      return appended.length === 0
        ? null
        : `${slug} + 1 = ${appended.join(", ")}`;
    },
  };
}

function insertWith(letter: string): Feature {
  return {
    name: `can insert ${letter}`,
    property: (slug, { wordlist }) => {
      const allInserted = [];
      for (let i = 0; i <= slug.length; i++) {
        allInserted.push(`${slug.slice(0, i)}${letter}${slug.slice(i)}`);
      }
      const inserted = wordlist.filterWords(allInserted);
      return inserted.length === 0
        ? null
        : `${slug} insert ${letter} = ${inserted.join(", ")}`;
    },
  };
}

function insertAny(): Feature {
  return {
    name: "can insert 1",
    property: (slug, { wordlist }) => {
      const allInserted = [];
      for (let i = 0; i <= slug.length; i++) {
        for (const letter of LETTERS) {
          allInserted.push(`${slug.slice(0, i)}${letter}${slug.slice(i)}`);
        }
      }
      const inserted = wordlist.filterWords(allInserted);
      return inserted.length === 0
        ? null
        : `${slug} insert 1 = ${inserted.join(", ")}`;
    },
  };
}

function behead(): Feature {
  return {
    name: "can behead 1",
    property: (slug, { wordlist }) => {
      const beheaded = slug.slice(1);
      return wordlist.isWord(beheaded)
        ? `${slug} behead 1 = ${beheaded}`
        : null;
    },
  };
}

function curtail(): Feature {
  return {
    name: "can curtail 1",
    property: (slug, { wordlist }) => {
      const curtailed = slug.slice(0, -1);
      return wordlist.isWord(curtailed)
        ? `${slug} curtail 1 = ${curtailed}`
        : null;
    },
  };
}

function deleteWith(letter: string): Feature {
  return {
    name: `can delete ${letter}`,
    property: (slug, { wordlist }) => {
      const allDeleted = [];
      for (const [i, c] of enumerate(slug)) {
        if (c === letter) {
          allDeleted.push(`${slug.slice(0, i)}${slug.slice(i + 1)}`);
        }
      }
      const deleted = wordlist.filterWords(allDeleted);
      return deleted.length === 0
        ? null
        : `${slug} delete ${letter} = ${deleted.join(", ")}`;
    },
  };
}

function deleteAny(): Feature {
  return {
    name: "can delete 1",
    property: (slug, { wordlist }) => {
      const allDeleted = [];
      for (const [i] of enumerate(slug)) {
        allDeleted.push(`${slug.slice(0, i)}${slug.slice(i + 1)}`);
      }
      const deleted = wordlist.filterWords(allDeleted);
      return deleted.length === 0
        ? null
        : `${slug} delete 1 = ${deleted.join(", ")}`;
    },
  };
}

function takeOddOrEven(): Feature {
  return {
    name: "can take odd or even letters",
    property: (slug, { wordlist }) => {
      const odd = Array.from(slug)
        .filter((_, i) => i % 2 === 1)
        .join("");
      const even = Array.from(slug)
        .filter((_, i) => i % 2 === 0)
        .join("");
      const isOdd = wordlist.isWord(odd);
      const isEven = wordlist.isWord(even);
      if (!isOdd && !isEven) {
        return null;
      }
      if (isOdd && isEven) {
        return `${slug} take odd = ${odd}; take even = ${even}`;
      }
      return isOdd
        ? `${slug} take odd = ${odd}`
        : `${slug} take even = ${even}`;
    },
  };
}

function changeTo(letter: string): Feature {
  return {
    name: `can change to ${letter}`,
    property: (slug, { wordlist }) => {
      const allChanged = [];
      for (const [i, c] of enumerate(slug)) {
        if (c !== letter) {
          allChanged.push(`${slug.slice(0, i)}${letter}${slug.slice(i + 1)}`);
        }
      }
      const changed = wordlist.filterWords(allChanged);
      return changed.length === 0
        ? null
        : `${slug} change to ${letter} = ${changed.join(", ")}`;
    },
  };
}

function changeAny(): Feature {
  return {
    name: "can change 1",
    property: (slug, { wordlist }) => {
      const allChanged = [];
      for (const [i, c] of enumerate(slug)) {
        for (const letter of LETTERS) {
          if (c !== letter) {
            allChanged.push(`${slug.slice(0, i)}${letter}${slug.slice(i + 1)}`);
          }
        }
      }
      const changed = wordlist.filterWords(allChanged);
      return changed.length === 0
        ? null
        : `${slug} change 1 = ${changed.join(", ")}`;
    },
  };
}

function reverse(): Feature {
  return {
    name: "can reverse",
    property: (slug, { wordlist }) => {
      const reversed = slug.split("").reverse().join("");
      return wordlist.isWord(reversed)
        ? `${slug} reversed = ${reversed}`
        : null;
    },
  };
}

function rotate(): Feature {
  return {
    name: "can rotate",
    property: (slug, { wordlist }) => {
      const candidates: [candidate: string, n: number][] = [];
      for (let n = 1; n < slug.length; n++) {
        candidates.push([slug.slice(n) + slug.slice(0, n), n]);
      }
      const rotates = wordlist.filterWordsUnder(candidates, (t) => t[0]);
      if (rotates.length === 0) {
        return null;
      }
      const [first, ...rest] = rotates;
      const [rotated, n] = first!;
      const nStr =
        n > slug.length / 2 ? (n - slug.length).toString() : n.toString();
      return `${slug} rotate ${nStr} = ${rotated}${
        rest.length > 0 ? ` (alt: ${rest.map((t) => t[0]).join(", ")})` : ""
      }`;
    },
  };
}

function swapAdjacent(): Feature {
  return {
    name: "can swap adjacent letters",
    property: (slug, { wordlist }) => {
      const candidates: [candidate: string, i: number][] = [];
      for (const [i, [a, b]] of enumerate(windows(slug, 2))) {
        candidates.push([`${slug.slice(0, i)}${b}${a}${slug.slice(i + 2)}`, i]);
      }
      const swapped = wordlist.filterWordsUnder(candidates, ([w]) => w);
      if (swapped.length === 0) {
        return null;
      }
      const [first, ...rest] = swapped;
      const swapIndices = `${(first![1] + 1).toString()}, ${(first![1] + 2).toString()}`;
      return `${slug} swap ${swapIndices} = ${first![0]}${
        rest.length > 0 ? ` (alt: ${rest.map((t) => t[0]).join(", ")})` : ""
      }`;
    },
  };
}

function swapEnds(): Feature {
  return {
    name: "can swap ends",
    property: (slug, { wordlist }) => {
      if (slug.length < 2) {
        return null;
      }
      const candidate = `${slug.at(-1)!}${slug.slice(1, -1)}${slug.at(0)!}`;
      return wordlist.isWord(candidate)
        ? `${slug} swap ends = ${candidate}`
        : null;
    },
  };
}

function anagram(): Feature {
  return {
    name: "is anagram",
    property: (slug, { wordlist }) => {
      const anagrams = wordlist.anagrams(slug);
      return anagrams.length === 0
        ? null
        : `${slug} anagrammed = ${anagrams.join(", ")}`;
    },
  };
}

function transaddWith(letter: string): Feature {
  return {
    name: `has transadd ${letter}`,
    property: (slug, { wordlist }) => {
      const transadds = wordlist.anagrams(`${slug}${letter}`, {
        loose: true,
      });
      return transadds.length === 0
        ? null
        : `${slug} transadd ${letter} = ${transadds.join(", ")}`;
    },
  };
}

function transaddAny(): Feature {
  return {
    name: "has transadd 1",
    property: (slug, { wordlist }) => {
      const allTransadds = [];
      for (const letter of LETTERS) {
        for (const transadd of wordlist.anagrams(`${slug}${letter}`, {
          loose: true,
        })) {
          allTransadds.push(transadd);
        }
      }
      const transadds = wordlist.filterWords(allTransadds);
      return transadds.length === 0
        ? null
        : `${slug} transadd 1 = ${transadds.join(", ")}`;
    },
  };
}

function transdeleteWith(letter: string): Feature {
  return {
    name: `has transdelete ${letter}`,
    property: (slug, { wordlist }) => {
      if (!slug.includes(letter)) {
        return null;
      }
      const transdeletes = wordlist.anagrams(slug.replace(letter, ""), {
        loose: true,
      });
      return transdeletes.length === 0
        ? null
        : `${slug} transdelete ${letter} = ${transdeletes.join(", ")}`;
    },
  };
}

function transdeleteAny(): Feature {
  return {
    name: "has transdelete 1",
    property: (slug, { wordlist }) => {
      const allTransdeletes = [];
      for (const letter of new Set(slug)) {
        for (const transdelete of wordlist.anagrams(slug.replace(letter, ""), {
          loose: true,
        })) {
          allTransdeletes.push(transdelete);
        }
      }
      const transdeletes = wordlist.filterWords(allTransdeletes);
      return transdeletes.length === 0
        ? null
        : `${slug} transdelete 1 = ${transdeletes.join(", ")}`;
    },
  };
}

function caesarShift(): Feature {
  return {
    name: "has caesar shift",
    property: (slug, { wordlist }) => {
      const candidates: [candidate: string, n: number][] = [
        ...interval(-12, -1),
        ...interval(1, 13),
      ].map((n) => [caesar(slug, n), n]);
      const shifted = wordlist.filterWordsUnder(candidates, (t) => t[0]);
      if (shifted.length === 0) {
        return null;
      }
      const [first, ...rest] = shifted;
      const [shiftedSlug, n] = first!;
      return `${slug} caesar shift ${n.toString()} = ${shiftedSlug}${
        rest.length > 0 ? ` (alt: ${rest.map((t) => t[0]).join(", ")})` : ""
      }`;
    },
  };
}

/**
 * Features for wordplay: slugs that form a word when applying some sort of
 * transformation.
 */
export function wordplayFeatures(): Feature[] {
  return [
    ...mapProduct(prependWith, LETTERS),
    prependAny(),
    ...mapProduct(appendWith, LETTERS),
    appendAny(),
    ...mapProduct(insertWith, LETTERS),
    insertAny(),
    behead(),
    curtail(),
    ...mapProduct(deleteWith, LETTERS),
    deleteAny(),
    takeOddOrEven(),
    ...mapProduct(changeTo, LETTERS),
    changeAny(),
    reverse(),
    rotate(),
    swapAdjacent(),
    swapEnds(),
    anagram(),
    ...mapProduct(transaddWith, LETTERS),
    transaddAny(),
    ...mapProduct(transdeleteWith, LETTERS),
    transdeleteAny(),
    caesarShift(),
  ];
}
