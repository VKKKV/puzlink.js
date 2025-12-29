import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Steam Library",
  source:
    "https://puzzles.mit.edu/2024/mythstoryhunt.world/solutions/steam-library",
  cases: [
    {
      slugs: `
        ARGININE
        STOWAWAY
        CANADA DAY
        CUCUMBER
        ALLELES
        DINING OUT
        DADAIST
        SOUP UP
        CHORISIS
        GO TO TOWN
        SUSURRANT
        PARTITION
      `,
      expected: "has 2 pairs of equal letters, separated by 1 letter",
    },
    {
      slugs: `
        FEDERAL BUREAU OF INVESTIGATION
        NEW KIDS ON THE BLOCK
        QUANTUM OF SOLACE
        ROMANTIC COMEDIES
        SWORN TO SECRECY
        TRUTH OR CONSEQUENCES
        WALKED ON TIPTOE
        WENT FOR BROKE
      `,
      expected: "has exactly 2 'o's",
    },
  ],
} satisfies EvalSuite;
