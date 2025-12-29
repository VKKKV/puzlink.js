import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Last Resort",
  source:
    "http://www.maths.usyd.edu.au/ub/sums/puzzlehunt/2016/puzzles/A2S1_Last_Resort.pdf",
  cases: [
    {
      slugs: `"advent", "achilles", "binary", "norway", "bubbly", "yacht", "anchor"`,
      expected: "has 1 reverse alphabetical bigram",
    },
  ],
} satisfies EvalSuite;
