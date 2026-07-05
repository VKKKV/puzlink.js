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
      expected: "has at least 2 pairs of equal letters, separated by 1 letter",
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
    {
      slugs: `
        AHMAD PEJMAN
        ALLELES
        ARGININE
        ASSAULT
        ASSISTED BRAKING
        ATTACK
        BANNERMAN
        BEETLE
        BEYOND
        CANADA DAY
        CHORISIS
        COMBAT
        CUCUMBER
        DADAIST
        DEEP DISH
        DINING OUT
        EL-CREEPO!
        ENERGIZER
        FASTAPI
        FEDERAL BUREAU OF INVESTIGATION
        FETA
        FREE CLIMB
        GO TO TOWN
        HERBAL
        HONEYDEW
        INCHCAPE
        INSTINCT
        JALAPENO
        KENSEI
        KOENIGSMACKER
        LINEAR LOGIC
        MAINE
        MISSPELLS
        MONTSERRAT
        NEVER
        NEW KIDS ON THE BLOCK
        OUTLANDISH
        PARTITION
        PATTERN
        PIYUSH MISHRA
        PLASTIC
        QUANTUM OF SOLACE
        ROCKET
        ROMANTIC COMEDIES
        SIERRA NEVADA
        SOUP UP
        STOWAWAY
        SUBSTR
        SUPPOSAL
        SUSURRANT
        SWORN TO SECRECY
        TRUTH OR CONSEQUENCES
        TWELFTH MAN
        VOLUMNIA
        WALKED ON TIPTOE
        WENT FOR BROKE
      `,
      expected: [
        "has at least 2 pairs of equal letters, separated by 1 letter",
        "has exactly 2 'o's",
      ],
    },
  ],
} satisfies EvalSuite;
