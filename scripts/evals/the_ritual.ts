import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Ritual",
  source: "https://www.markhalpin.com/labintpage/solutions/ritualsol.html",
  cases: [
    {
      slugs: `
        - AWFUL RECORDS
        - BITTER LIQUOR
        - FLEXIBLE FACE
        - GLOWING SPEAR
        - HARMLESS DUST
        - KEYS OF BRONZE
        - POT OF PEANUTS
        - SABRE OF IVORY
        - SILVER TURNIP
        - STUPID OLD APE
        - TRENDY WALLET
        - TURQUOISE GEM
      `,
      expected: "3rd letters are consecutive",
    },
  ],
} satisfies EvalSuite;
