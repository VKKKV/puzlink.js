import { slugify } from "cromulence";
import type { LogNum } from "./lib/logNum.js";
import { Wordlist } from "./lib/wordlist.js";
import type { Linker } from "./linkers/index.js";
import { allLinkers } from "./linkers/index.js";

/** A FullLink is a Link after post-processing. */
export type FullLink = Readonly<{
  name: string;
  logProb: LogNum;
  description: readonly string[];
}>;

export class Puzlink {
  linkers: Linker[];

  constructor(wordlist: Wordlist) {
    this.linkers = allLinkers(wordlist);
  }

  /** Create a Puzlink instance by downloading the cromulence wordlist. */
  static async download(): Promise<Puzlink> {
    const wordlist = await Wordlist.download();
    return new Puzlink(wordlist);
  }

  /**
   * Parse an input to a list of slugs.
   *
   * If the input has newlines, we split by newlines. Otherwise, if commas
   * exist, we split by commas. Otherwise, we split by spaces.
   */
  parse(words: string | readonly string[]): string[] {
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
    /** The words to link. See `parse` for how these are parsed. */
    words: string | readonly string[],
    {
      limit = 10,
      ordered,
    }: {
      /**
       * Limit the number of links returned. Pass `null` or `Infinity` to
       * return all links.
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
    },
  ): FullLink[] {
    const slugs = this.parse(words);

    if (ordered === undefined) {
      const sortedSlugs = slugs.slice().sort();
      const isSorted = slugs.every((slug, i) => slug === sortedSlugs[i]);
      ordered = !isSorted;
    }

    return this.linkers
      .flatMap((linker) => {
        const links = linker.eval(slugs, ordered);
        return links.map((link) => ({ name: linker.name, ...link }));
      })
      .sort((a, b) => (b.logProb.gt(a.logProb) ? -1 : 1))
      .slice(0, limit ?? Infinity);
  }
}
