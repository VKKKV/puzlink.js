import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Wall Street",
  source:
    "https://puzzles.mit.edu/2011/puzzles/civilization/meta/wall_street.html",
  cases: [
    {
      slugs: `
        aUtUmn
        badmiNtoN
        traFFicpylon
        AmericAn
        IngrId
        meRcuRy
        CornCake
        gOOier
        trIskelIon
        waNderiNg
      `,
      expected: "has exactly 1 letter that appears twice",
    },
  ],
} satisfies EvalSuite;
