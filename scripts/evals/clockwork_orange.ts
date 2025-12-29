import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Clockwork Oran.ge",
  source:
    "https://puzzles.mit.edu/2013/coinheist.com/rubik/clockwork_orange/answer/index.html",
  cases: [
    {
      slugs: `
        ARMORED RECON
        HYPAPANTE
        COMMEMORATIVE BATS
        DERRICK TRUCK
        BROWN ROT
        ATTORNEYS GENERAL
        SACROSANCT
        IMPROMPTU
      `,
      expected: "has a bigram that appears twice",
    },
  ],
} satisfies EvalSuite;
