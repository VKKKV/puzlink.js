import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Venntersections",
  source: "https://puzzles.mit.edu/2014/puzzle-solution/venntersections/",
  cases: [
    {
      slugs: `"lowered", "levitate", "inanimate", "paradise", "leveraged", "sizes", "tuxedo"`,
      expected: "alternates vowels and consonants",
    },
    {
      slugs: `"leveraged", "sizes", "tuxedo", "lynx", "lightly", "crocodile", "triumph"`,
      expected: "has scrabble score 14",
    },
    {
      slugs: `"lowered", "levitate", "leveraged", "lynx", "lightly", "lengths", "legislator"`,
      expected: "1st letters are equal",
    },
    {
      slugs: `"levitate", "inanimate", "sizes", "lightly", "crocodile", "legislator", "carousels"`,
      expected: "has repeated consonants",
    },
    {
      slugs: `"questionable", "businesswoman", "exhaustion", "discouraged", "communicated", "hallucinogen", "sequoia"`,
      expected: "has 5 unique vowels",
    },
    {
      slugs: `"grimaced", "formally", "questionable", "discouraged", "communicated", "chrysalis", "saccharin"`,
      expected: "-4th leters are equal",
    },
    {
      slugs: `"formally", "thinnest", "businesswoman", "communicated", "hallucinogen", "saccharin", "cellophane"`,
      expected: "has equal letters with 0 letters between",
    },
    {
      slugs: `"thumbtacks", "monologue", "frigidities", "statuesque", "testimony", "satirizing", "flawed"`,
      expected: "has days of the week substring",
    },
    {
      slugs: `"thumbtacks", "monologue", "testimony", "camel", "meteorology", "trampoline", "achievement"`,
      expected: "has 1 m",
    },
    {
      slugs: `"monologue", "frigidities", "satirizing", "meteorology", "avalance", "achievement", "constitute"`,
      expected: "has 1 letters, each repeating at least 3 times",
    },
    {
      slugs: `"philharmonic", "mischievous", "alphabet", "restaurant", "leeching", "mushroom", "pioneer"`,
      expected: "has greek letters substring",
    },
    {
      slugs: `"leeching", "mushroom", "pioneer", "loophole", "toothpaste", "seventeenth", "kneeling"`,
      expected: "has equal letters with 0 letters between, 1 times",
    },
    {
      slugs: `"philharmonic", "mischievous", "leeching", "loophole", "toothpaste", "alcoholic", "narwhal"`,
      expected: "5th letters are equal",
    },
    {
      slugs: `"mischievous", "alphabet", "mushroom", "toothpaste", "seventeenth", "narwhal", "chromosome"`,
      expected: "has 3 consonants in a row",
    },
  ],
} satisfies EvalSuite;
