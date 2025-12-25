import { loadWordlist, slugify } from "cromulence";
import { Wordlist } from "./lib/wordlist.js";
import type { Linker } from "./linkers/index.js";
import { allLinkers } from "./linkers/index.js";

/**
 * A Link is a relationship between a (possibly ordered) set of words, with how
 * strong it is quantified via its score.
 */
export type Link = Readonly<{
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
}>;

/** Options for Puzlink.link(). */
export type LinkOptions = {
  /**
   * Limit the number of links returned. Pass null or Infinity to return
   * all links.
   *
   * Defaults to 10.
   */
  limit?: number | null;
  /**
   * Is the input in a particular order? Some of the links we use apply
   * only if the words have a given order. Defaults to true if the words
   * are NOT alphabetically sorted.
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

  /** Return all links for a list of words. */
  link(
    /** The words to link. See Puzlink.parse for how these are parsed. */
    words: string | readonly string[],
    { limit = 10, ordered }: LinkOptions = {},
  ): Link[] {
    const slugs = Puzlink.parse(words);

    if (ordered === undefined) {
      const sortedSlugs = slugs.slice().sort();
      const isSorted = slugs.every((slug, i) => slug === sortedSlugs[i]);
      ordered = !isSorted;
    }

    return this.linkers
      .flatMap((linker) => {
        const links = linker.eval(slugs, ordered);
        return links.map((link) => ({
          name: linker.name,
          ...link,
          score: Math.round(link.logProb.toLog() * -10) / 10,
        }));
      })
      .sort((a, b) => (a.score > b.score ? -1 : 1))
      .slice(0, limit ?? Infinity);
  }
}
