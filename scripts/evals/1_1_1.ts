import type { EvalSuite } from "../runEvals.js";

export default {
  name: "1 - 1 = 1",
  source: "https://puzzles.mit.edu/2007/puzzles/1_1_1/",
  cases: [
    {
      slugs: `STRIFE SEAMAN NIX ETCH POST QUEER-ART FOO TALKS REPAYS STU HUMF UNDERHID SIXTEENS BOWMEN`,
      expected: "has transdelete",
    },
  ],
} satisfies EvalSuite;
