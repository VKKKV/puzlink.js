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
      expected: "has morse code with 2 dashes",
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
      // expected: "has amino acid substring",
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
        BRAINWASH
        COTSWOLD LINE
        CYNWYD LINE
        INWARD-FACING
        JOHN WAYNE
        SLOT MACHINE
        SWIMMER
        SWORD COAST
      `,
      expected: "has 2 compass directions substrings",
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
      expected: "has caesar shift",
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
      expected: "has exactly 1 double letter",
    },
  ],
} satisfies EvalSuite;
