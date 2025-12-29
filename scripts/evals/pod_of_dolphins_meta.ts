import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Pod of Dolphins meta",
  source: "https://puzzles.mit.edu/2015/puzzle/pod_of_dolphins_meta/solution/",
  cases: [
    {
      slugs: `
        CITYGATES
        IMPULSIVE
        CLICKSPAM
        BAPTISTRY
        LEVIATHAN
        POLICECAR
        COUPDETAT
        SFORZANDO
        CARTWHEEL
      `,
      expected: "has a letter that appears at least twice",
    },
  ],
} satisfies EvalSuite;
