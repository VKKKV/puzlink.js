import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Obedience Training",
  source: "https://puzzles.mit.edu/2016/puzzle/obedience_training/solution/",
  cases: [
    {
      slugs: `
        AGFA
        PEER
        I FIB
        ROOD
        URUS
      `,
      expected: "has 1 unique vowels (5 / 5)",
    },
  ],
} as EvalSuite;
