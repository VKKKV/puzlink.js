import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Meta-Morphoses",
  source:
    "https://www.markhalpin.com/puzzles/1morph/morphanswers/morphmeta_SOL.pdf",
  cases: [
    {
      slugs: `
        PESTER
        INSTALL
        TAXABLE
        RIOTOUS
        TRAMPING
        DARK MEAT
        ROASTING
        WIRESAW
        ANTI-FIRE
        ANAGRAM
        STRONG-ARMED
      `,
      expected: "has transadd",
    },
  ],
} satisfies EvalSuite;
