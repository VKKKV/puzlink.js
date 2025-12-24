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
      expected: "start with the same vowel-consonant pattern",
    },
    {
      slugs: `ALMOST, BIOPSY, CHIMP, FILMS, GHOST, TUX`,
      expected: "has at least 1 reverse alphabetical bigrams",
    },
    {
      slugs: `BALKED, BAR SPOON, HIGH NOON, KLUTZY, ONYX, POSTED`,
      expected: "has at least 2 reverse sequential bigrams",
    },
  ],
} satisfies EvalSuite;
