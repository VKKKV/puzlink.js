import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Wordplay",
  source:
    "https://puzzles.mit.edu/2013/coinheist.com/get_smart/wordplay/answer/index.html",
  cases: [
    {
      slugs: `"ample", "adenoid", "music", "fifa"`,
      expected: "is a hill",
    },
    {
      slugs: `"peeped", "isseis", "fee", "acacia", "salsas", "arrear"`,
      expected: "has letter counts in arithmetic sequence",
    },
    {
      slugs: `"skort", "sporty", "yolks", "peccadillo", "unknot", "rosy"`,
      expected: "is a valley",
    },
    {
      slugs: `"testset", "lol", "tenet", "malayalam"`,
      expected: "is palindrome",
    },
    {
      slugs: `"hitchhiker", "kaashoek", "jellystone", "kierkegaard", "metallica", "maastrict", "menschheit"`,
      expected: "has exactly 1 double letter",
    },
    {
      slugs: `"aime", "eye", "eerie", "riaa", "oahu", "oeis"`,
      expected: "has 1 unique consonant",
    },
  ],
} satisfies EvalSuite;
