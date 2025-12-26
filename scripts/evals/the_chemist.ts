import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Chemist",
  source: "https://puzzles.mit.edu/2017/solution/chemist.html",
  cases: [
    {
      slugs: `
        CROC
        CONE
        NIOBE
        NOES
        BOY
        COOK
        BHOPA
        KONA
        CROW
      `,
      expected: "can be broken into element symbols",
    },
  ],
} as EvalSuite;
