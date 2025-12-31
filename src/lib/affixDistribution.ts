import { Distribution } from "./distribution.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";
import { interval } from "./util.js";

class BaseAffixDistribution {
  /** Map from affix length to distribution of affixes of that length. */
  private readonly dist = new Map<number, Distribution<string>>();

  constructor(affix: "prefix" | "suffix", wordlist: string[]) {
    let maxLength = 0;
    for (const word of wordlist) {
      maxLength = Math.max(maxLength, word.length);
    }

    const affixes = new Map<number, string[]>();

    for (const i of interval(1, maxLength)) {
      affixes.set(i, []);
    }

    for (const word of wordlist) {
      let sliced = "";
      for (let i = 1; i <= word.length; i++) {
        if (affix === "prefix") {
          sliced = sliced + word[i - 1]!;
        } else {
          sliced = word.at(-i)! + sliced;
        }
        affixes.get(i)!.push(sliced);
      }
    }

    for (const [length, items] of affixes) {
      this.dist.set(length, Distribution.from(items));
    }
  }

  /** Distribution of affixes of a given length. */
  get(length: number): Distribution<string> {
    return this.dist.get(length) ?? Distribution.from([]);
  }

  /** Vowel distribution for affixes of a given length. */
  @memoize(1)
  private vowelDist(length: number): Distribution<string> {
    return this.get(length).map((s) => {
      return s.replaceAll(/[aeiou]/g, "V").replaceAll(/[a-z]/g, "C");
    });
  }

  /**
   * Probability that k affixes of a given length start with the same vowel
   * pattern.
   */
  @memoize(2)
  probEqualVowelPattern(k: number, length: number): LogNum {
    return this.vowelDist(length).probEqual(k);
  }
}

/** Info about the prefix distribution of a wordlist. */
export class PrefixDistribution extends BaseAffixDistribution {
  constructor(wordlist: string[]) {
    super("prefix", wordlist);
  }
}

/** Info about the suffix distribution of a wordlist. */
export class SuffixDistribution extends BaseAffixDistribution {
  constructor(wordlist: string[]) {
    super("suffix", wordlist);
  }
}
