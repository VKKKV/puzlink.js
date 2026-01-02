import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Egg Plant",
  source:
    "https://puzzlvaria.wordpress.com/2018/06/16/bar-exam-part-4-and-then-there-were-puzzles/",
  cases: [
    {
      slugs: `"cardioid", "liqueur", "naiads", "paleoecology", "tenuous", "breathtaking", "hangnail", "topspin", "wardrobe", "worldly"`,
      expected: "has at least 1 pair of equal letters, separated by 1 letter",
    },
    {
      slugs: `"despumate", "motorcade", "overboard", "shared", "simoleon"`,
      expected: "has placental substring",
    },
    // {
    //   slugs: `"beggar", "deliver", "fiendish", "multiple", "swordsman"`,
    //   expected: "has an animal subsequence",
    // },
    {
      slugs: `"brazen", "coatimundi", "hatred", "socket", "vestibule"`,
      expected: "has clothing substring",
    },
    {
      slugs: `"edens", "emanate", "gratin", "rancho", "select"`,
      expected: "can rotate",
    },
    {
      slugs: `"earth", "ingles", "ought", "raked", "those"`,
      expected: "can rotate",
    },
  ],
} satisfies EvalSuite;
