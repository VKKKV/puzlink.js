import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Doubletree",
  source: "https://puzzles.mit.edu/2002/orange/X/Solution.txt",
  cases: [
    {
      slugs: `
        JA(BB)ERWOCK
        POMPE(II)
        WI(LL)IAMS
        MCMI(LL)AN
        GU(GG)ENHEIM
        PATRICI(A A)RQUE(TT)E
        N(EE)DLE(SS)
      `,
      expected: "has at least 1 double letter",
    },
  ],
} satisfies EvalSuite;
