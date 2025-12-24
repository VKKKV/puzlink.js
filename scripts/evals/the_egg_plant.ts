import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Egg Plant",
  source: "http://tinyurl.com/nplbarexam",
  cases: [
    {
      slugs: `"cardioid", "liqueur", "naiads", "paleoecology", "tenuous", "breathtaking", "hangnail", "topspin", "wardrobe", "worldly"`,
      expected: "has equal letters with 1 letters between, 1 times",
    },
    // are these reasonable...
    // {
    //   slugs: `"despumate", "motorcade", "overboard", "shared", "simoleon"`,
    //   expected: "has an animal substring",
    // },
    // {
    //   slugs: `"beggar", "deliver", "fiendish", "multiple", "swordsman"`,
    //   expected: "has an animal subsequence",
    // },
    // {
    //   slugs: `"brazen", "coatimundi", "hatred", "socket", "vestibule"`,
    //   expected: "has a clothing substring",
    // },
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
