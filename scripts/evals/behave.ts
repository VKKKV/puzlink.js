import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Behave",
  source:
    "https://puzzles.mit.edu/2012/puzzles/william_s_bergman/behave/solution/",
  cases: [
    {
      slugs: `ANNIE PROULX, COMMUTATIVE, HUGO WEAVING, MOUNTAIN DEW, MOZAMBIQUE, SEQUOIA`,
      expected: "has 5 unique vowels",
    },
    {
      slugs: `ANNOTATION, ARTIFICIAL, ENGINE ROOM, INDIVIDUAL, OMNIVOROUS, ON LOCATION`,
      // start or end is fine:
      expected: "with the same vowel-consonant pattern",
    },
    {
      slugs: `ALMOST, BIOPSY, CHIMP, FILMS, GHOST, TUX`,
      expected: "has 0 reverse alphabetical bigrams",
    },
    {
      slugs: `BALKED, BAR SPOON, HIGH NOON, KLUTZY, ONYX, POSTED`,
      expected: "has at least 2 reverse sequential bigrams",
    },
    {
      slugs: `
        ALMOST
        ANNIE PROULX
        ANNOTATION
        ARTIFICIAL
        BALKED
        BAR SPOON
        BIOPSY
        CHIMP
        COMMUTATIVE
        ENGINE ROOM
        FILMS
        GHOST
        HIGH NOON
        HUGO WEAVING
        INDIVIDUAL
        KLUTZY
        MOUNTAIN DEW
        MOZAMBIQUE
        OMNIVOROUS
        ON LOCATION
        ONYX
        POSTED
        SEQUOIA
        TUX
      `,
      expected: [
        "has 5 unique vowels",
        "with the same vowel-consonant pattern",
        "has 0 reverse alphabetical bigrams",
        "has at least 2 reverse sequential bigrams",
      ],
    },
  ],
} satisfies EvalSuite;
