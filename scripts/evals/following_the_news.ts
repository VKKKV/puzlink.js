import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Following the News",
  source:
    "https://puzzles.mit.edu/2013/coinheist.com/get_smart/following_the_news/answer/index.html",
  cases: [
    {
      slugs: `
        ANDREW LIN
        BETA TESTS
        CLOCK OF THE LONG NOW
        DECOMPRESSOR
        EUGENE
        FUNGUS-PROOF SWORD
        GLEEMEN
        HANSARDISE
        INTERPOSE
      `,
      expected: "has at least 3 compass directions substrings",
    },
  ],
} satisfies EvalSuite;
