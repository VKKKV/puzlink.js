import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Altar",
  source: "https://puzzles.mit.edu/2004/aztec/Bj4/answer.html",
  cases: [
    {
      slugs: `
        PELES TEARS
        NAINSOOK
        AIRSICK
        KLAKRING
        SANDBED
        GIRLS RULE
        MARIA ALEXANDROVNA
        SYLPHLIKE
        SEASON
        BOHR THEORY
        TEMPUS FUGIT
        YORYU
        CANCRINITE
        BOSWORTH
        MERMAID
      `,
      expected: "has 1 pair of equal letters, separated by 2 letters",
    },
  ],
} satisfies EvalSuite;
