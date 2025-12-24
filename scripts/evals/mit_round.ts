import type { EvalSuite } from "../runEvals.js";

export default {
  name: "MIT Round",
  source: "https://puzzles.mit.edu/2014/round-solution/mit/",
  cases: [
    {
      slugs: `
        ABYSMAL
        BODY SIZE
        DON'T WORRY BABY
        ICE CREAM SANDWICH
        ICHABOD
        MALPRACTICE
        MANIFESTO
        STOP CODON
      `,
      expected: "TODO chain",
    },
  ],
} satisfies EvalSuite;
