import type { EvalSuite } from "../runEvals.js";

export default {
  name: "How Many Reps?",
  // eventually, 2023.huntinality
  source: "https://www.huntinality.com/solutions/how_many_reps",
  cases: [
    {
      slugs: `MEDICARE OMELET SOMEONE SUBMERSED LIGAMENTS ARCHIMEDES GROOMSMEN ASTRODOME AMSTERDAMER`,
      expected: "has me as a substring",
    },
    {
      slugs: `DOGWHISTLE RETWEETING MICHAELBAY FABRIFIBRA SOLIDFOODS LABORATORY TIMOCRATIC`,
      expected: "solfege",
    },
    // {
    //   slugs: `MITHRA GLUTTON STARGAZE MARGARITA SALAMANDER PROTAGONIST SNOWMOBILERS SMALLSEASNAIL`,
    //   expected: "amino acid",
    // },
    {
      slugs: `
        AMSTERDAMER
        ANACONDA AFLAC DUCK
        ARCHIMEDES
        ASTRODOME
        ATOLE
        BEDCHAIRS
        CARRIED
        CAST DORFMEISTER
        DISGUSTING MOUTH SMELL
        DOG WHISTLE
        DON AN ALBATROSS AROUND YOUR NECK
        DONT RUSH
        FABRI FIBRA
        FELIX UNGAR
        FLIPPING MARKERS
        FOLK DEVIL
        FOOLS GRADUATION
        FOOTBALL TEAM DEFENSIVE COORDINATOR
        FREDDIE ECHOGRAPHY
        GLUTTON
        GROOMSMEN
        HELICOPTER PARENT
        HYPERBOREAN BREW
        KEATONS DISFIGURED ARCHENEMY
        LABORATORY
        LIGAMENTS
        MARGARITA
        MEDICARE
        MICHAEL BAY
        MITHRA
        NATE FANG
        OMELET
        OSTRACOD
        PENCIL CAPABLE
        PLATFORM CURRENTLY KNOWN AS X
        PROTAGONIST
        RETWEETING
        RIN TIN BASIN
        ROSEBUDS
        SALAMANDER
        SEVEN NATION ARMY
        SMALL SEA SNAIL
        SNOOZE
        SNOWMOBILERS
        SOLID FOODS
        SOMEONE
        SONOGRAM
        STARGAZE
        STARLING
        SUBMERSED
        TIMOCRATIC
        TRADEMARKS
        USELESS REMEDY
        VANITY OF DULUOZ
        VASTLY POWERFUL
        VEER ONTO A TANGENT
        WANAMAKER TROPHY AND CLARET JUG
        WORKING THE CORPORATE LADDER
      `,
      expected: ["has me as a substring", "solfege"],
    },
  ],
} satisfies EvalSuite;
