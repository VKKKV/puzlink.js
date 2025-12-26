import { answerLengthLogProbs } from "../data/answerLengths.js";
import { featureLinkers } from "../features/index.js";
import { LengthDistribution } from "../lib/lengthDistribution.js";
import { LogNum } from "../lib/logNum.js";
import type { Wordlist } from "../lib/wordlist.js";
import { indexingLinker } from "./indexing.js";
import { lengthLinker } from "./length.js";
import { nGramLinker } from "./nGram.js";

/**
 * A PartialLink is the subset of Link that a Linker needs to return. We do
 * some processing before it ends up being a Link. See Link for full details.
 */
export type PartialLink = Readonly<{
  /** A human-readable link name; defaults to the name of the linker. */
  name?: string;
  /**
   * Log prob we'd expect to see this link.
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

/** A Linker is a function that takes a list of words and returns Links. */
export type Linker = Readonly<{
  name: string;
  eval: (words: string[], ordered?: boolean) => PartialLink[];
}>;

/** All linkers. */
export function allLinkers(wordlist: Wordlist): Linker[] {
  const lengthDist = LengthDistribution.from(answerLengthLogProbs);
  return [
    ...featureLinkers(wordlist),
    indexingLinker(wordlist),
    lengthLinker(lengthDist),
    nGramLinker(wordlist),
  ];
}
