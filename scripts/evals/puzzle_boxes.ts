import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Puzzle Boxes",
  source: "https://2022.ecph.site/solution/puzzleboxes.html",
  cases: [
    {
      slugs: `
        ACQUIRED IMMUNITY
        AISLE
        CHESS
        DRESS
        ELVIS
        GEORGE GERSHWIN
        HARSH
        RELATIONSHIP
        RESIN
        SEMIFINALISTS
        SPRINGBOARD
        WEAK INTERACTION
      `,
      expected: "has morse code with 2 dashes (6 / 12)",
    },
    {
      slugs: `
        DEVANAGARI
        FRIGGA
        GAUL
        ISAAC
        LG CUP
        MORTGAGE
      `,
      expected: "unusual letter distribution",
    },
    {
      slugs: `
        ACETALDEHYDE
        BATTLE OF TRAFALGAR
        CONTEMPORARIES
        DOGMATIC THEOLOGY
        ELONGATE
        FOREMOST
        GLIADIN
        HISTORIC VILLAGE
        INCHEON
        JEROME ROBBINS
      `,
      expected: "has nato alphabet anagram substring",
    },
    {
      slugs: `
        ARENA
        COY
        JUJU
        LAP
        STEP
        TERRA
      `,
      expected: "has caesar shift (6 / 6)",
    },
    {
      slugs: `
        REGIA AERONAUTICA
        EBB AND FLOW
        IONIC COMPOUND
        NELSON RIDDLE
        DUNG BEETLE
        EARMUFFS
        EASTER EGG
        ROUGHHOUSE
      `,
      expected: "has equal letters with 0 letters between, 1 times (8 / 8)",
    },
  ],
} satisfies EvalSuite;
