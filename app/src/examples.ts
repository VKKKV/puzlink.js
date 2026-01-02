export type Example = {
  description?: string;
  slugs: string;
  source: string;
};

export const examples: Example[] = [
  {
    source: "https://www.markhalpin.com/labintpage/liritual.html",
    slugs: `
      HARMLESS
      POT OF GOLD
      STUPOR
      TREND SETTER
      TURQUOISE
    `,
    description: "consecutive 4th letters",
  },
  {
    source: "https://puzzles.mit.edu/2014/puzzle/venntersections/",
    slugs: `
      alphabet
      chromosome
      mushroom
      narwhal
      splice
      toothpaste
    `,
    description: "three consonants in a row",
  },
  {
    source: "https://puzzle.university/puzzle/the-olympics.html",
    slugs: `
      announcement
      Ezra Pound
      grampus
      melodrama
      squint a little
    `,
    description: "a unit of weight as a substring",
  },
  {
    source:
      "http://www.maths.usyd.edu.au/ub/sums/puzzlehunt/2016/puzzles/A2S1_Last_Resort.pdf",
    slugs: `
      Achilles
      binary
      norway
      yacht
    `,
  },
  {
    source: "https://puzzles.mit.edu/2016/puzzle/1_2_3/",
    slugs: `
      season
      save up
      ECOWAS
      ignore
      sluice
      Hosni
      in bed
    `,
  },
  {
    source: "https://puzzles.mit.edu/2004/aztec/Bj4/",
    slugs: `
      PELES TEARS
      NAINSOOK
      AIRSICK
      KLAKRING
      SANDBED
      GIRLS RULE
      MARIA ALEXANDROVNA
    `,
  },
  {
    source: "https://puzzles.mit.edu/2012/puzzles/william_s_bergman/behave",
    slugs: `ANNIE PROULX, COMMUTATIVE, HUGO WEAVING, MOUNTAIN DEW, MOZAMBIQUE, SEQUOIA`,
  },
  {
    source:
      "https://puzzles.mit.edu/2013/coinheist.com/rubik/clockwork_orange/",
    slugs: `
      ARMORED RECON
      COMMEMORATIVE BATS
      DERRICK TRUCK
      SACROSANCT
      IMPROMPTU
    `,
  },
  {
    source: "https://2022.ecph.site/puzzle/puzzleboxes.html",
    slugs: `
      ARENA
      COY
      JUJU
      LAP
      STEP
      TERRA
    `,
  },
  {
    source:
      "https://puzzles.mit.edu/2024/mythstoryhunt.world/puzzles/steam-library",
    slugs: `
      ARGININE
      STOWAWAY
      CANADA DAY
      CUCUMBER
      GO TO TOWN
      PARTITION
    `,
  },
].map((example) => {
  return {
    ...example,
    slugs: example.slugs
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim(),
  };
});
