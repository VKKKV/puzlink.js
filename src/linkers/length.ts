import type { LengthDistribution } from "../lib/lengthDistribution.js";
import type { Link, Linker } from "./index.js";

type Props = {
  distribution: LengthDistribution;
  lengthSet: Set<number>;
  lengths: number[];
  slugs: string[];
};

function allEqual({ distribution, lengthSet }: Props): Link | null {
  if (lengthSet.size !== 1) {
    return null;
  }
  const [length] = Array.from(lengthSet) as [number];
  return {
    name: "all lengths equal",
    logProb: distribution.probEqual(lengthSet.size),
    description: [`all lengths are ${length.toString()}`],
  };
}

function onlyTwo({ distribution, lengthSet, slugs }: Props): Link | null {
  if (lengthSet.size !== 2) {
    return null;
  }
  const [a, b] = Array.from(lengthSet) as [number, number];
  const aLength = slugs.filter((w) => w.length === a);
  const bLength = slugs.filter((w) => w.length === b);
  const aLogProb = distribution.probEqual(aLength.length);
  const bLogProb = distribution.probEqual(bLength.length);
  return {
    name: "only two lengths",
    logProb: aLogProb.mul(bLogProb),
    description: [
      `length ${a.toString()}: ${aLength.join(", ")}`,
      `length ${b.toString()}: ${bLength.join(", ")}`,
    ],
  };
}

function equalMod2({ distribution, lengths }: Props): Link | null {
  if (new Set(lengths.map((l) => l % 2)).size !== 1) {
    return null;
  }
  const parity = lengths[0]! % 2;
  return {
    name: `all lengths are ${parity === 0 ? "even" : "odd"}`,
    logProb: distribution.probEqualMod2(lengths.length),
    description: [`all lengths are ${parity === 0 ? "even" : "odd"}`],
  };
}

function equalMod3({ distribution, lengths }: Props): Link | null {
  if (new Set(lengths.map((l) => l % 3)).size !== 1) {
    return null;
  }
  return {
    name: "all lengths are equal mod 3",
    logProb: distribution.probEqualMod3(lengths.length),
    description: [`all lengths are equal mod 3`],
  };
}

function consecutive({ distribution, lengths }: Props): Link | null {
  for (let i = 0; i < lengths.length - 1; i++) {
    if (lengths[i + 1]! - lengths[i]! !== 1) {
      return null;
    }
  }
  return {
    name: "lengths are consecutive",
    logProb: distribution.probConsecutive(lengths.length),
    description: [`lengths are ${lengths.join(", ")}`],
  };
}

function paired({ distribution, slugs }: Props): Link | null {
  const byLength = new Map<number, string[]>();
  for (const slug of slugs) {
    if (!byLength.has(slug.length)) {
      byLength.set(slug.length, []);
    }
    byLength.get(slug.length)!.push(slug);
  }
  const lengthCounter = new Set(
    Array.from(byLength.values(), (slugs) => slugs.length),
  );
  if (lengthCounter.size === 1 && Array.from(lengthCounter)[0] === 2) {
    return {
      name: "lengths can be paired",
      logProb: distribution.probPaired(slugs.length),
      description: Array.from(byLength.entries(), ([, slugs]) => {
        return slugs.join(" and ");
      }),
    };
  }
  return null;
}

/** Length-based linker. */
export function lengthLinker(distribution: LengthDistribution): Linker {
  return {
    name: "slug lengths",
    eval: (slugs) => {
      const lengths = slugs.map((w) => w.length).sort();
      const lengthSet = new Set(lengths);
      const props = { distribution, lengthSet, lengths, slugs };
      return [
        allEqual(props),
        onlyTwo(props),
        equalMod2(props),
        equalMod3(props),
        consecutive(props),
        paired(props),
      ].filter((l): l is Link => l !== null);
    },
  };
}
