import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Mayan Fair Lady meta",
  source: "https://puzzles.mit.edu/2012/puzzles/mayan_fair_lady/solution/",
  cases: [
    {
      slugs: `
        BATED
        TANK
        BUSINESS
        ETC
        OVER
        ELVIS
        CAR
        COW
        MARS
        PARIS
        AIRLINES
      `,
      expected: "can insert h (10 / 11)",
    },
  ],
} satisfies EvalSuite;
