import type { EvalSuite } from "../runEvals.js";

export default {
  name: "Halloween Town – Thanksgiving Town",
  source: "https://puzzles.mit.edu/2019/solution/halloween_thanksgiving.html",
  cases: [
    {
      slugs: `
        AMBIGUOUS
        BLOAT
        ICONOGRAPHY
        OVERSUBSCRIBE
        SBARRO
        ROADHOG
        SUBPROBLEM
        TURBOCHARGER
        WARDROBE
      `,
      expected: "has at least 1 b",
    },
    // all halloween + thanksgiving feeders
    {
      slugs: `
        AMBIGUOUS
        BLOAT
        ICONOGRAPHY
        OVERSUBSCRIBE
        SBARRO
        ROADHOG
        SUBPROBLEM
        TURBOCHARGER
        WARDROBE

        DON'T FEAR THE REAPER
        LOCH NESS MONSTER
        NIGHT OF THE LIVING DEAD
        RITA HAYWORTH AND SHAWSHANK REDEMPTION
        ROBERT EDWARD CROZIER LONG
        SKELETON KEY
        THE WOLF'S HOUR

        CHEVINGTON CHEESE
        MOTHER POPCORN
        STAY PUFT MARSHMALLOW MAN
        TATER DU LIGHTHOUSE
        UNEEDA BISCUITS

        AFTER SUNDOWN
        BORN FREE
        PISTOL FOR A HUNDRED COFFINS
        ROAR
        THE THREE BURIALS OF MELQUIADES ESTRADA
        UNFORGIVEN

        HATAMOTO
        IONE SKYE
        LUCHADOR
        NURSE JOY
      `,
      expected: "has at least 1 b",
    },
  ],
} satisfies EvalSuite;
