import { answerLengthLogProbs } from "../data/answerLengths.js";
import { featureLinkers } from "../features/index.js";
import { LengthDistribution } from "../lib/lengthDistribution.js";
import { LetterDistribution } from "../lib/letterDistribution.js";
import { LogNum } from "../lib/logNum.js";
import type { Wordlist } from "../lib/wordlist.js";
import { indexingLinker } from "./indexing.js";
import { lengthLinker } from "./length.js";
import { letterDistributionLinker } from "./letterDistribution.js";

/**
 * A Link is a relationship between a *set* of words, with how strong it is
 * quantified via logProb.
 */
export type Link = Readonly<{
  /** The top-level link name to report. Defaults to the name of the linker. */
  name?: string;
  /**
   * The log prob we'd expect to see this link, if each word was instead
   * replaced with a random puzzle answer.
   *
   * Note that this should describe the log prob of the *name* of the link.
   * A link with name "two distinct length values" should have the log prob
   * that the words have *any two* distinct lengths, and the description
   * should report more specifically what those lengths are.
   */
  logProb: LogNum;
  /** Any extra info to include in the link. Can be blank. */
  description: readonly string[];
}>;

/**
 * A Linker is a function that takes a list of words and returns Links.
 */
export type Linker = Readonly<{
  name: string;
  eval: (words: string[], ordered?: boolean) => Link[];
}>;

/**
 * Create a linker that's the logical OR of the given linkers. Assumes they're
 * independently distributed.
 */
export function anyOfLinkers(linkers: Linker[]): Linker {
  return {
    name: `any of ${linkers.map((l) => l.name).join(", ")}`,
    eval: (...args) => {
      const links = linkers.flatMap((l) => l.eval(...args));

      return [
        {
          logProb: LogNum.from(1).sub(
            LogNum.prod(links.map((l) => LogNum.from(1).sub(l.logProb))),
          ),
          description: links.flatMap((l) => l.description),
        },
      ];
    },
  };
}

/**
 * Create a linker that's the logical AND of the given linkers. Assumes they're
 * independently distributed.
 */
export function allOfLinkers(linkers: Linker[]): Linker {
  return {
    name: `all of ${linkers.map((l) => l.name).join(", ")}`,
    eval: (...args) => {
      const links = linkers.flatMap((l) => l.eval(...args));

      return [
        {
          logProb: LogNum.prod(links.map((l) => l.logProb)),
          description: links.flatMap((l) => l.description),
        },
      ];
    },
  };
}

/** All linkers. */
export function allLinkers(wordlist: Wordlist): Linker[] {
  const lengthDist = LengthDistribution.from(answerLengthLogProbs);
  const letterDist = new LetterDistribution(wordlist);
  return [
    ...featureLinkers(wordlist),
    indexingLinker(letterDist, wordlist),
    lengthLinker(lengthDist),
    letterDistributionLinker(letterDist),
  ];
}
