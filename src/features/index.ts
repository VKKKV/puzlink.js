import { featureLogProbs } from "../data/featureLogProbs.js";
import { LetterIndices } from "../lib/letterIndices.js";
import { LogNum } from "../lib/logNum.js";
import { FeatureLogProbCache } from "../lib/logProbCache.js";
import { Wordlist } from "../lib/wordlist.js";
import type { Linker } from "../linkers/index.js";
import * as T from "../templating/index.js";
import { letterCountFeatures } from "./letterCount.js";
import { letterSequenceFeatures } from "./letterSequence.js";
import { otherFeatures } from "./other.js";
import { substringFeatures } from "./substring.js";
import { wordplayFeatures } from "./wordplay.js";

/**
 * Computing feature LogProbs can be expensive; so we've precomputed some
 * cached values.
 */
export const FeatureLogProbs = new FeatureLogProbCache(featureLogProbs);

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
  name: T.Inline;
  /** If the `slug` has the feature, returns a description. */
  property: (slug: string, props: Props) => T.Row | null;
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
  const key = T.renderToText(name);
  FeatureLogProbs.fill(key, () => {
    return wordlist.logProb(
      (word) => property(word, getProps(wordlist, word)) !== null,
    );
  });

  return {
    name,
    eval: (slugs, options) => {
      const description = slugs.flatMap((word) => {
        const result = property(word, getProps(wordlist, word));
        return result ? [result] : [];
      });
      if (
        description.length !== 0 &&
        description.length < options.minFeatureRatio * slugs.length
      ) {
        return [];
      }
      const logProb = LogNum.binomialPValue(
        description.length,
        slugs.length,
        FeatureLogProbs.get(key),
      );
      if (!logProb) {
        return [];
      }
      return [
        {
          name: T.Join([T.Fraction(description.length, slugs.length), name]),
          description: T.Table(description),
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
        properties[T.renderToText(feature.name)] = property.cells
          .map((c) => {
            const content = T.renderToText(c.content);
            return c.collapsible ? `(${content})` : content;
          })
          .join(" | ");
      }
    }
    return properties;
  };
}
