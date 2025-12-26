import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Motel 6",
  source: "https://puzzles.mit.edu/2002/darkblue/X/Solution.txt",
  cases: [
    {
      slugs: `
        UNDER
        ERODE
        DENALI
        ALIOTH
        THRONE
        ONESUN
      `,
      expected: "multiple shared suffixes and prefixes",
    },
  ],
} satisfies EvalSuite;
