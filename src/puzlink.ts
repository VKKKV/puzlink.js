import { downloadHypernymData, downloadWordlist } from "#download";
import { answerLengthLogProbs } from "./data/answerLengths.js";
import { HypernymDAG, type HypernymDAGData } from "./lib/hypernymDAG.js";
import { LengthDistribution } from "./lib/lengthDistribution.js";
import { Wordlist } from "./lib/wordlist.js";
import type { Linker } from "./linkers/index.js";
import { allLinkers } from "./linkers/index.js";
import { parse } from "./parse.js";
import * as T from "./templating/index.js";

/**
 * A Link is a relationship between a (possibly ordered) set of words, with how
 * strong it is quantified via its score.
 */
export type Link = {
  /** The name of the link. */
  name: string;
  /**
   * Any additional information about the link. Typically, this would be an
   * explanation for why the words satisfy the given link.
   */
  description?: string;
  /**
   * The score of the link. A higher score means it's more likely to be
   * important (because it's less likely to happen by chance).
   *
   * This is calculated as the negative of the log probability we'd expect to
   * see this link, if each word was replaced with a random puzzle answer,
   * rounded to 1 decimal place.
   */
  score: number;
  /** Structured link name. See LinkOptions.jsonOutput. */
  jsonName?: T.Inline;
  /** Structured link description. See LinkOptions.jsonOutput. */
  jsonDescription?: T.Table;
};

/** Options for Puzlink.link(). */
export type LinkOptions = {
  /**
   * Set to true to return the raw description of the link, in a structured
   * JSON format. Useful for custom rendering. See `templating/index.ts` for
   * the types.
   *
   * Defaults to false.
   */
  jsonOutput?: boolean;
  /**
   * Whether to return links via a generator instead of a list. If true, links
   * will be returned *unsorted*, and the limit option will be ignored.
   *
   * Defaults to false.
   */
  lazy?: boolean;
  /**
   * Limit the number of links returned. Pass null or Infinity to return
   * all links.
   *
   * Defaults to 10.
   */
  limit?: number | null;
  /**
   * Only report features that are satisfied by either 0, or at least
   * minFeatureRatio of the words.
   *
   * Defaults to 0.5.
   */
  minFeatureRatio?: number;
  /**
   * Only report features that are satisfied by either all, or at most
   * maxFeatureRatio of the words.
   *
   * Defaults to 1.0.
   */
  maxFeatureRatio?: number;
  /**
   * Set to true if the input has a particular order. Some of the links we use
   * apply only if the words have a given order.
   *
   * Defaults to true if the words are NOT alphabetically sorted.
   */
  ordered?: boolean;
};

/**
 * Create a Puzlink instance by downloading the wordlist, and possibly, some
 * optional data.
 *
 * All of these sizes are with brotli compression:
 *
 * - The wordlist is required and is 693 kB.
 * - The small hypernym data is 312 kB. It enables links of the form "has
 *   substrings from some category".
 * - The large is an additional 207 kB. It enables reporting the names of the
 *   category substrings.
 */
export async function download({
  hypernym = "large",
}: {
  hypernym?: boolean | "small" | "large";
} = {}): Promise<Puzlink> {
  const [wordlist, hypernymDAGData] = await Promise.all([
    downloadWordlist(),
    hypernym !== false &&
      downloadHypernymData({ includeWords: hypernym !== "small" }),
  ]);
  return new Puzlink({
    wordlist,
    ...(hypernymDAGData && { hypernymDAGData }),
  });
}

export class Puzlink {
  linkers: Linker[];

  constructor({
    lengthData = answerLengthLogProbs,
    wordlist,
    hypernymDAGData,
  }: {
    lengthData?: [number, number][];
    wordlist: Record<string, number>;
    hypernymDAGData?: HypernymDAGData;
  }) {
    this.linkers = allLinkers({
      lengthDist: LengthDistribution.parseLengths(lengthData),
      wordlist: new Wordlist(wordlist),
      hypernymDAG: hypernymDAGData && HypernymDAG.parse(hypernymDAGData),
    });
  }

  static download = download;
  static parse = parse;

  private *linkLazy(
    slugs: string[],
    options: Required<LinkOptions>,
  ): Generator<Link> {
    for (const linker of this.linkers) {
      for (const link of linker.eval(slugs, options)) {
        const jsonName = link.name ?? linker.name;
        const jsonDescription = link.description;

        yield {
          name: T.renderToText(jsonName),
          score: Math.round(link.logProb.toLog() * -10) / 10,
          ...(jsonDescription && {
            description: T.renderToText(jsonDescription),
          }),
          ...(options.jsonOutput && { jsonName }),
          ...(options.jsonOutput && jsonDescription && { jsonDescription }),
        };
      }
    }
  }

  /**
   * Given a list of words, returns a list of links they share, sorted from
   * highest to lowest score.
   */
  link(
    /** The words to link. See parse() for how these are parsed. */
    words: string | readonly string[],
    options?: LinkOptions & { lazy?: false },
  ): Link[];
  /** Given a list of words, returns a generator of links they share. */
  link(
    /** The words to link. See parse() for how these are parsed. */
    words: string | readonly string[],
    options?: LinkOptions & { lazy: true },
  ): Generator<Link>;
  link(
    words: string | readonly string[],
    {
      jsonOutput = false,
      lazy = false,
      limit = 10,
      minFeatureRatio = 0.5,
      maxFeatureRatio = 1.0,
      ordered,
    }: LinkOptions = {},
  ): Generator<Link> | Link[] {
    const slugs = parse(words);

    if (slugs.length === 0) {
      return lazy
        ? (function* () {
            // empty
          })()
        : [];
    }

    if (ordered === undefined) {
      const sortedSlugs = slugs.slice().sort();
      const isSorted = slugs.every((slug, i) => slug === sortedSlugs[i]);
      ordered = !isSorted;
    }

    const options = {
      jsonOutput,
      lazy,
      limit,
      ordered,
      minFeatureRatio,
      maxFeatureRatio,
    };

    if (lazy) {
      return this.linkLazy(slugs, options);
    }

    return Array.from(this.linkLazy(slugs, options))
      .sort((a, b) => (a.score > b.score ? -1 : 1))
      .slice(0, limit ?? Infinity);
  }
}
