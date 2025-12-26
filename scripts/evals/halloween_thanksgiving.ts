import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Halloween Town – Thanksgiving Town",
  source: "https://puzzles.mit.edu/2019/solution/halloween_thanksgiving.html",
  cases: [
    {
      slugs: `
        AMBIGUOUS
        BLOAT
        ICONOGRAPHY
        OVERSUBSCRIBE
        SBARRO
        ROADHOG
        SUBPROBLEM
        TURBOCHARGER
        WARDROBE
      `,
      expected: "has at least 1 b",
    },
  ],
} satisfies EvalSuite;
