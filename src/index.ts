import { loadWordlist, slugify } from "cromulence";
import { Wordlist } from "./lib/wordlist.js";
import type { Linker } from "./linkers/index.js";
import { allLinkers } from "./linkers/index.js";

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
  description: readonly string[];
  /**
   * The score of the link. A higher score means it's more likely to be
   * important (because it's less likely to happen by chance).
   *
   * This is calculated as the negative of the log probability we'd expect to
   * see this link, if each word was replaced with a random puzzle answer,
   * rounded to 1 decimal place.
   */
  score: number;
};

/** Options for Puzlink.link(). */
export type LinkOptions = {
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
   * Set to true if the input has a particular order. Some of the links we use
   * apply only if the words have a given order.
   *
   * Defaults to true if the words are NOT alphabetically sorted.
   */
  ordered?: boolean;
};

export class Puzlink {
  linkers: Linker[];

  constructor(wordlist: Record<string, number>) {
    this.linkers = allLinkers(new Wordlist(wordlist));
  }

  /** Create a Puzlink instance by downloading the cromulence wordlist. */
  static async download(): Promise<Puzlink> {
    return new Puzlink(await loadWordlist());
  }

  /**
   * Parse an input to a list of slugs.
   *
   * If the input has newlines, we split by newlines. Otherwise, if commas
   * exist, we split by commas. Otherwise, we split by spaces.
   */
  static parse(words: string | readonly string[]): string[] {
    if (typeof words === "string") {
      if (words.includes("\n")) {
        words = words.split("\n");
      } else if (words.includes(",")) {
        words = words.split(",");
      } else {
        words = words.split(" ");
      }
    }
    return words.map((w) => slugify(w)).filter((w) => w.length > 0);
  }

  private *linkLazy(
    slugs: string[],
    options: Required<LinkOptions>,
  ): Generator<Link> {
    for (const linker of this.linkers) {
      for (const partialLink of linker.eval(slugs, options)) {
        yield {
          name: linker.name,
          score: Math.round(partialLink.logProb.toLog() * -10) / 10,
          ...partialLink,
        };
      }
    }
  }

  /**
   * Given a list of words, returns a list of links they share, sorted from
   * highest to lowest score.
   */
  link(
    /** The words to link. See Puzlink.parse for how these are parsed. */
    words: string | readonly string[],
    options?: LinkOptions & { lazy?: false },
  ): Link[];
  /** Given a list of words, returns a generator of links they share. */
  link(
    /** The words to link. See Puzlink.parse for how these are parsed. */
    words: string | readonly string[],
    options?: LinkOptions & { lazy: true },
  ): Generator<Link>;
  link(
    /** The words to link. See Puzlink.parse for how these are parsed. */
    words: string | readonly string[],
    {
      lazy = false,
      limit = 10,
      minFeatureRatio = 0.5,
      ordered,
    }: LinkOptions = {},
  ): Generator<Link> | Link[] {
    const slugs = Puzlink.parse(words);

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

    const options = { lazy, limit, ordered, minFeatureRatio };

    if (lazy) {
      return this.linkLazy(slugs, options);
    }

    return Array.from(this.linkLazy(slugs, options))
      .sort((a, b) => (a.score > b.score ? -1 : 1))
      .slice(0, limit ?? Infinity);
  }

  // TODO: clustering, pos/neg
}
