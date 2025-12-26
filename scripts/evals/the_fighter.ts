import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Fighter",
  source: "https://puzzles.mit.edu/2017/solution/fighter.html",
  cases: [
    {
      slugs: `
        LOLL
        SANAA
        OBSESS
        PRETEEN
        FIREWEED
        DODDFRANK
        HYDROCOOLS
        MARYPOPPINS
        HOUSEMEETING
        COULDHAVEBEEN
        BOBBYHENDRICKS
      `,
      expected: "has 1 letters, each repeating 3 times",
    },
  ],
} as EvalSuite;
