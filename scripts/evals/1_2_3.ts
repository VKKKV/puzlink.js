import type { EvalSuite } from "../runEvals.js";

export default {
  name: "1, 2, 3",
  source: "https://puzzles.mit.edu/2016/puzzle/1_2_3/solution/",
  cases: [
    {
      slugs: `
        season
        save up
        ECOWAS
        ignore
        sluice
        Hosni
        in bed
        Barbeau
        museum
        Tobiah
        unsew
        Dolce
        anaphia
        teenage
      `,
      expected: "has at least 4 unique consonants",
    },
  ],
} satisfies EvalSuite;
