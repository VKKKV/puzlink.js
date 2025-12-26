import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Set 1 Metapuzzle",
  source: "https://puzzles.mit.edu/2000/set1/Meta/Solution.html",
  cases: [
    {
      slugs: `
        EMERGENT
        GENTLE
        LEAN
        ANGELA
        GELATIN
        MANAGE
        AGES
        SIGNOR
        IGNORANT
        ANTHER
        HERALD
      `,
      expected: "multiple shared suffixes and prefixes",
    },
  ],
} satisfies EvalSuite;
