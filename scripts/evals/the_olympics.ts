import type { EvalSuite } from "../runEvals.js";

export default {
  name: "The Olympics",
  source: "https://puzzle.university/solution/the-olympics.html",
  cases: [
    {
      slugs: `
        ARCANE
        BARELY
        CONDONES
        DIVESTING
        ERASURE
        FIBRED
        GRANDMASTER
        HEROES
      `,
      expected: "can be split into two words",
    },
    {
      slugs: `
        ANIMALLEGS
        ANTIBIEBER
        HOUSEWIFESURVEY
        INJUSTICE
        KOWDIARPALACE
        NEWCHAPELBISHOP
        OLDROMANBIBLE
        VOTERNUMBERS
      `,
      expected: "has bone change 1 substring",
    },
    {
      slugs: `
        EMPTYBOX
        EXPERTLY
        FULLXRAY
        IMAXFILM
        REARAXLE
        SIXSIDED
        SMALLAXE
        XMENHERO
      `,
      expected: "has exactly 1 x",
    },
    {
      slugs: `
        ANNOUNCEMENT
        EZRAPOUND
        GRAMPUS
        INGRAINED
        MELODRAMA
        PISTON
        SANDSTONE
        SQUINTALITTLE
      `,
      expected: "has mass unit substring",
    },
    {
      slugs: `
        ANIMAL LEGS
        ANNOUNCEMENT
        ANTI-BIEBER
        ARCANE
        BARELY
        CONDONES
        DEVIL FOOTPRINT
        DIVESTING
        EMPTY BOX
        ERASURE
        EXPERTLY
        EZRA POUND
        FIBRED
        FULL XRAY
        GRAMPUS
        GRANDMASTER
        HEROES
        HOLY WISDOM
        HOUSEWIFE SURVEY
        HUNCHBACK
        IMAX FILM
        INGRAINED
        INJUSTICE
        KOWDIAR PALACE
        MELODRAMA
        MICHELANGELO
        NEWCHAPEL BISHOP
        OLD ROMAN BIBLE
        PISTON
        REAR AXLE
        RED SQUARE
        SANDSTONE
        SIDE WINGS
        SIX SIDED
        SMALL AXE
        SQUINT A LITTLE
        UNFINISHED
        UNKNOWN WARRIOR
        VOTER NUMBERS
        XMEN HERO
      `,
      expected: [
        "can be split into two words",
        "has bone change 1 substring",
        "has exactly 1 x",
        "has mass unit substring",
      ],
    },
  ],
} satisfies EvalSuite;
