import type { EvalSuite } from "../runEvals.js";

export default {
  name: "A Circus Line meta",
  source: "https://puzzles.mit.edu/2012/puzzles/a_circus_line/solution/",
  cases: [
    {
      slugs: `
        BOOKWORM
        COCOON
        COSPONSORS
        ENTICING
        ENUMERATE
        MEDLEY
        OCTOPOD
        PINHEAD
        SUBSTITUTE
        TORCHWOOD
      `,
      expected: "has 3 o",
    },
  ],
} satisfies EvalSuite;
