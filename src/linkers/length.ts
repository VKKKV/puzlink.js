import { DefaultMap } from "../lib/defaultMap.js";
import type { LengthDistribution } from "../lib/lengthDistribution.js";
import { getArithmeticSequenceInfo } from "../lib/util.js";
import * as T from "../templating/index.js";
import type { Linker, PartialLink } from "./index.js";

type Props = {
  distribution: LengthDistribution;
  lengthSet: Set<number>;
  lengths: number[];
  slugs: string[];
};

function lengthRows(slugs: string[]): T.Row[] {
  return slugs.map((slug) => T.Row([T.Slug(slug), T.Text(slug.length)]));
}

function allEqual({
  distribution,
  lengthSet,
  slugs,
}: Props): PartialLink | null {
  if (lengthSet.size !== 1) {
    return null;
  }
  return {
    name: T.Text("all lengths equal"),
    logProb: distribution.probEqual(slugs.length),
    description: T.Table(lengthRows(slugs)),
  };
}

function onlyTwo({
  distribution,
  lengthSet,
  slugs,
}: Props): PartialLink | null {
  if (lengthSet.size !== 2) {
    return null;
  }
  const [a, b] = Array.from(lengthSet) as [number, number];
  const aLength = slugs.filter((w) => w.length === a);
  const bLength = slugs.filter((w) => w.length === b);
  return {
    name: T.Text("only two lengths"),
    logProb: distribution.probTwoDistinct(slugs.length),
    description: T.Sortable([...lengthRows(aLength), ...lengthRows(bLength)]),
  };
}

function equalMod2({
  distribution,
  lengths,
  slugs,
}: Props): PartialLink | null {
  if (new Set(lengths.map((l) => l % 2)).size !== 1) {
    return null;
  }
  const parity = lengths[0]! % 2;
  return {
    name: T.Join(["all lengths are", parity === 0 ? "even" : "odd"]),
    logProb: distribution.probEqualMod2(slugs.length),
    description: T.Table(lengthRows(slugs)),
  };
}

function equalMod3({
  distribution,
  lengths,
  slugs,
}: Props): PartialLink | null {
  if (new Set(lengths.map((l) => l % 3)).size !== 1) {
    return null;
  }
  return {
    name: T.Text("all lengths are equal mod 3"),
    logProb: distribution.probEqualMod3(slugs.length),
    description: T.Table(lengthRows(slugs)),
  };
}

function consecutive({
  distribution,
  lengths,
  slugs,
}: Props): PartialLink | null {
  if (getArithmeticSequenceInfo(lengths)?.step !== 1) {
    return null;
  }
  const sorted = slugs.sort((a, b) => a.length - b.length);
  return {
    name: T.Text("lengths are consecutive"),
    logProb: distribution.probConsecutive(slugs.length),
    description: T.Sortable(lengthRows(sorted)),
  };
}

function paired({ distribution, slugs }: Props): PartialLink | null {
  const byLength = new DefaultMap<number, string[]>(() => []);
  for (const slug of slugs) {
    byLength.get(slug.length).push(slug);
  }
  const lengthCounter = new Set(
    Array.from(byLength.values(), (slugs) => slugs.length),
  );
  if (lengthCounter.size > 1 || Array.from(lengthCounter)[0] !== 2) {
    return null;
  }
  return {
    name: T.Text("lengths can be paired"),
    logProb: distribution.probPaired(slugs.length),
    description: T.Table(
      Array.from(byLength.entries(), ([length, slugs]) => [
        T.Slug(slugs[0]!),
        T.Slug(slugs[1]!),
        T.Text(length),
      ]),
    ),
  };
}

/** Length-based linker. */
export function lengthLinker(distribution: LengthDistribution): Linker {
  return {
    name: T.Text("slug lengths"),
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
      ].filter((l): l is PartialLink => l !== null);
    },
  };
}
