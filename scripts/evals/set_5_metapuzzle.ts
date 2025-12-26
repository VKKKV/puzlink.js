import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Set 5 Metapuzzle",
  source: "https://puzzles.mit.edu/2000/set5/Meta/Solution.html",
  cases: [
    {
      slugs: `
        DORADO
        RETRO
        MIRTH
        FARADAYS
        SONIC BOOM
        LAKEFRONT VIEW
        TITHE
        DOUBLE DARE
      `,
      expected: "starts with solfege",
    },
  ],
} satisfies EvalSuite;
