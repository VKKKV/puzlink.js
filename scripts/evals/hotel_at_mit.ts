import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Hotel@MIT",
  source: "https://puzzles.mit.edu/2002/magenta/X/Solution.txt",
  cases: [
    {
      slugs: `
        6. (MIKE) MULLIGAN
        7. STRA(IN DIA)GRAM
        5. HIGH (SIERRA)
        3. CZ(ECHO)SLOVAKIA
        1. BOR(ROMEO)
        2. C(LIMA)TES
        4. DAMN (YANKEE)S
      `,
      expected: "has nato alphabet substring",
    },
  ],
} satisfies EvalSuite;
