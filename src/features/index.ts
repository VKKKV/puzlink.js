import { LetterIndices } from "../lib/letterIndices.js";
import { LogNum } from "../lib/logNum.js";
import { Wordlist } from "../lib/wordlist.js";
import type { Linker } from "../linkers/index.js";
import { letterCountFeatures } from "./letterCount.js";
import { letterSequenceFeatures } from "./letterSequence.js";
import { KnownLogProbs } from "./logProbCache.js";
import { otherFeatures } from "./other.js";
import { substringFeatures } from "./substring.js";
import { wordplayFeatures } from "./wordplay.js";

type Props = {
  letterIndices: LetterIndices;
  wordlist: Wordlist;
};

/**
 * A Feature is a property that a slug can have.
 *
 * Features should be as specific as possible, like "can prepend T to get a
 * word", rather than "can prepend a letter to get a word". Instead, use
 * linkers to get more general features.
 */
export type Feature = {
  /** The name of the feature; will be used for the linker name. */
  name: string;
  /**
   * If the `slug` has the feature, returns a description with `slug` as the
   * subject. This is an elaboration on the feature name.
   */
  property: (slug: string, props: Props) => string | null;
};

function getProps(wordlist: Wordlist, slug: string): Props {
  return { letterIndices: LetterIndices.from(slug), wordlist };
}

/**
 * Create a binomial linker for a given feature. A binomial link is the
 * probability that at least k or at most k out of n words share the feature,
 * whichever is less.
 */
function featureLinker(
  wordlist: Wordlist,
  { name, property }: Feature,
): Linker | null {
  let featureLogProb = KnownLogProbs.get(name, () => {
    return wordlist.logProb(
      (word) => property(word, getProps(wordlist, word)) !== null,
    );
  });
  if (featureLogProb.toLog() === -Infinity) {
    // We can't meaningfully make linkers out of zero-probability things,
    // so just set it to something very small.
    featureLogProb = LogNum.fromExp(-10);
    return null;
  }

  return {
    name,
    eval: (words) => {
      const description = words.flatMap((word) => {
        const result = property(word, getProps(wordlist, word));
        return result ? [result] : [];
      });
      // Should we report the feature? This isn't entirely straightforward.
      // Super unlikely single-hits (like "can change to q" for 1/7) might
      // overwhelm less likely all-hits (like "has transadd 1" for 7/7).
      // TODO: adjust reporting heuristics; maybe via 'loose' prop on Feature?
      const logProb = LogNum.binomialPValue(
        description.length,
        words.length,
        featureLogProb,
      );
      return [
        {
          name: `${name} (${description.length.toString()} / ${words.length.toString()})`,
          description,
          logProb,
        },
      ];
    },
  };
}

/** Feature-based linkers. */
export function featureLinkers(wordlist: Wordlist): Linker[] {
  return [
    ...letterCountFeatures(),
    ...letterSequenceFeatures(),
    ...otherFeatures(),
    ...substringFeatures(),
    ...wordplayFeatures(),
  ].flatMap((feature) => {
    const linker = featureLinker(wordlist, feature);
    return linker ? [linker] : [];
  });
}

/**
 * For testing purposes. Takes a list of features, and returns
 * a function that takes a slug and returns all features it satisfies.
 */
export function makeFeatureGetter(
  features: Feature[],
  wordlist: Wordlist,
): (slug: string) => Record<string, string> {
  return (slug) => {
    const properties: Record<string, string> = {};
    for (const feature of features) {
      const property = feature.property(slug, getProps(wordlist, slug));
      if (property) {
        properties[feature.name] = property;
      }
    }
    return properties;
  };
}
