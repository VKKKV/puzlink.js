import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Black or White",
  source: "https://www.huntinality.com/solutions/black_or_white",
  cases: [
    {
      slugs: `
        ATTIC
        CLICK
        LIBEL
        CHEEK
        BETTA
        KEEL
        BETA
        CHIC
        LEEK
        WAKE
      `,
      expected: "unusual letter distribution",
    },
  ],
} satisfies EvalSuite;
