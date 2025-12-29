import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Katamari Damacy Small meta",
  source:
    "https://puzzles.mit.edu/2011/puzzles/katamari_damacy/meta/small.html",
  cases: [
    {
      slugs: `
        FOREIGN DISASTER RELIEF
        PRIMORDIAL SOUP
        NINA PERSSON
        MULUGETA WENDIMU
        MOBILE SUIT GUNDAM
        CUL DE SAC
        DIVERGED
      `,
      expected: "starts and ends with the same 1 letter",
    },
  ],
} as EvalSuite;
