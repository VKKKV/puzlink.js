import { LetterDistribution } from "../lib/letterDistribution.js";
import type { Link, Linker } from "./index.js";

// - differs from english letter distribution (use `outliers`)
//   - test: preponderance of NEWS
//   - test: preponderance of IVXLDCM

export function letterDistributionLinker(
  distribution: LetterDistribution,
): Linker {
  return {
    name: "letter distribution",
    eval: (slugs) => {
      const results: Link[] = [];

      const all = slugs.join("");
      const { high, low } = distribution.outliers(all);
      if (high.length > 0 || low.length > 0) {
        results.push({
          name: "unusual letter distribution",
          logProb: distribution.prob(all),
          description: [
            ...(high ? [`over-represented: ${high}`] : []),
            ...(low ? [`under-represented: ${low}`] : []),
          ],
        });
      }

      return results;
    },
  };
}
