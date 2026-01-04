import { DefaultMap } from "./defaultMap.js";
import { Distribution } from "./distribution.js";
import { LogNum } from "./logNum.js";
import { memoize } from "./memoize.js";

/** Map from affix length to distribution of affixes of that length. */
class BaseAffixDistribution extends DefaultMap<number, Distribution<string>> {
  constructor(affix: "prefix" | "suffix", wordlist: string[]) {
    super(() => Distribution.fromItems([]));

    const affixes = new DefaultMap<number, string[]>(() => []);

    for (const word of wordlist) {
      let sliced = "";
      for (let i = 1; i <= word.length; i++) {
        if (affix === "prefix") {
          sliced = sliced + word[i - 1]!;
        } else {
          sliced = word.at(-i)! + sliced;
        }
        affixes.get(i).push(sliced);
      }
    }

    for (const [length, items] of affixes) {
      this.set(length, Distribution.fromItems(items));
    }
  }

  /** Vowel distribution for affixes of a given length. */
  @memoize(1)
  private vowelDist(length: number): Distribution<string> {
    return this.get(length).mapItems((s) =>
      s.replaceAll(/[aeiou]/g, "V").replaceAll(/[a-z]/g, "C"),
    );
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
