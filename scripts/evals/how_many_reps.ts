import type { EvalSuite } from "../runEvals.js";

export default {
  name: "How Many Reps?",
  // eventually, 2023.huntinality
  source: "https://www.huntinality.com/solutions/how_many_reps",
  cases: [
    {
      slugs: `MEDICARE OMELET SOMEONE SUBMERSED LIGAMENTS ARCHIMEDES GROOMSMEN ASTRODOME AMSTERDAMER`,
      expected: "has me as a substring",
    },
    {
      slugs: `DOGWHISTLE RETWEETING MICHAELBAY FABRIFIBRA SOLIDFOODS LABORATORY TIMOCRATIC`,
      expected: "solfege",
    },
    // {
    //   slugs: `MITHRA GLUTTON STARGAZE MARGARITA SALAMANDER PROTAGONIST SNOWMOBILERS SMALLSEASNAIL`,
    //   expected: "amino acid",
    // },
  ],
} satisfies EvalSuite;
