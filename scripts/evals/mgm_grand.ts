import type { EvalSuite } from "../runEvals.js";

export default {
  name: "MGM Grand",
  source: "https://puzzles.mit.edu/2002/red/X/Solution.txt",
  cases: [
    {
      slugs: `
        APPLE DUMPLING
        PAYDAY
        BOURBON
        ODYSSEYS
        DES PLAINES
        TATAMI
        TERRE HAUTE
      `,
      expected: "has 1 bigrams, each repeating 2 times (7 / 7)",
    },
  ],
} satisfies EvalSuite;
