import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Case of the Missing Component",
  source:
    "https://puzzles.mit.edu/2022/puzzle/the-case-of-the-missing-component/solution/",
  cases: [
    {
      slugs: `
        FOLKETING
        MARK ROTHKO
        SHOSTAKOVICH
        DESKTOP PACKAGE TRACKER
        OTHELLO
        KINGS CROSS ST PANCRAS
        KARAKORAM RANGE
        COATROOM
        PHOTOSHOOT
        BIBLIOKLEPT
        SKYLARKS
        BROOK
        ALAMOGORDO
      `,
      expected: "has at least 1 k (9 / 13)",
    },
  ],
} satisfies EvalSuite;
