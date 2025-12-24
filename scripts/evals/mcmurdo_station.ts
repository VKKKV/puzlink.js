import type { EvalSuite } from "../runEvals.js";

export default {
  name: "McMurdo Station",
  source: "https://puzzles.mit.edu/2006/metas/mcmurdo_station.html",
  cases: [
    {
      slugs: `
        volkswAGEN
               GENTry
           covalENTBond
              froNTBUrner
                paTBUChanan
                   BUCKyballs
                   dUCKWeed
                  cloCKWAtchers
                  dereKWALcott
                       WALDen
      `,
      expected: "TODO chain",
    },
  ],
} satisfies EvalSuite;
