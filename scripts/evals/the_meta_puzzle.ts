import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Meta Puzzle",
  source: "https://2019.galacticpuzzlehunt.com/solution/the-meta-puzzle.html",
  cases: [
    {
      slugs: `
        ARGENTINA
        FRATERNAL
        GEARBOXES
        LITERACY
        RETAIN
      `,
      expected: "can be broken into element symbols (5 / 5)",
    },
    {
      slugs: `
        CRITIC
        DIES IRAE
        EREMITIC
        FAERIE
        FLAG
        GRAFFITI
        RELIEF
        SECRETED
        SELECTED
        SOLDIERED
      `,
      expected: "has solfege substring (9 / 10)",
    },
    {
      slugs: `
        MACHINATE
        PERUSAL
        ROMANOV
        PIRANHA
        MS PAINT
        CUBANO
        MINOR WAYS
      `,
      expected: "has country substring",
    },
  ],
} satisfies EvalSuite;
