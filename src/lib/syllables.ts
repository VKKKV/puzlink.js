const REGEX = {
  startsWithSingleVowelCombos: /^(eu)/i,
  joiningConsonantVowel: /^[^aeiou]e([^d]|$)/,
  cvcvSameConsonant: /^([^aeiouy])[aeiouy]\1[aeiouy]/,
  cvcvSameVowel: /^[^aeiouy]([aeiouy])[^aeiouy]\1/,
  cvcvKnownConsonants: /^([tg][aeiouy]){2}/,
  onlyOneOrMoreC: /^[^aeiouy]+$/,
  endsWithVowel: /[aeiouy]$/,
  startsWithConsonantVowel: /^[^aeiouy]h?[aeiouy]/,
  singleSyllables: [
    /^[^aeiou]?ion/,
    /^[^aeiou]?ised/,
    /^[^aeiou]?iled/,
    /^[^aeiou]?ized/,
    // -ing, -ent
    /[aeiou]n[gt]$/,
    // -ate, -age
    /\wa[gt]e$/,
  ],
  allSpaces: / +/g,
  startsWithEThenSpecials: /^e[sm]/,
  startsWithE: /^e/,
  endsWithNoisyVowelCombos: /(eo|eu|ia|oa|ua|ui)$/i,
  aiouy: /[aiouy]/,
  endsWithEE: /ee$/,
};

/** Postprocess the syllables. */
function postprocess(syllables: string[]): string[] {
  syllables = syllables.map((s) => s.trim()).filter((s) => s !== "");

  if (syllables.length >= 2) {
    const suffix = syllables.at(-2)! + syllables.at(-1)!;
    for (const regex of REGEX.singleSyllables) {
      if (regex.exec(suffix)) {
        syllables.splice(-2, 2, suffix);
        break;
      }
    }
  }

  // since the open syllable detection is overzealous,
  // sometimes need to rejoin incorrect splits
  if (syllables.length >= 2) {
    const first = syllables[0]!;
    const second = syllables[1]!;
    const prefix = first + second;

    if (
      // first is open:
      (first.length === 1 || REGEX.startsWithConsonantVowel.exec(first)) &&
      REGEX.endsWithVowel.exec(first) &&
      // second is joining:
      REGEX.joiningConsonantVowel.exec(second) &&
      // prefix is not known to be two-syllable:
      !(
        REGEX.cvcvSameConsonant.exec(prefix) ||
        REGEX.cvcvSameVowel.exec(prefix) ||
        REGEX.cvcvKnownConsonants.exec(prefix)
      )
    ) {
      syllables.splice(0, 2, prefix);
    }
  }

  if (syllables.length >= 2) {
    const secondLast = syllables.at(-2)!;
    const last = syllables.at(-1)!;
    const suffix = secondLast + last;

    if (
      // second last is open:
      REGEX.startsWithConsonantVowel.exec(secondLast) &&
      REGEX.endsWithVowel.exec(secondLast) &&
      // last is joining:
      REGEX.joiningConsonantVowel.exec(last) &&
      // last is not a special single-syllable:
      REGEX.singleSyllables.every((regex) => !regex.exec(last)) &&
      // suffix is not known to be two-syllable:
      !(
        REGEX.cvcvSameConsonant.exec(suffix) ||
        REGEX.cvcvSameVowel.exec(suffix) ||
        REGEX.cvcvKnownConsonants.exec(suffix)
      )
    ) {
      syllables.splice(-2, 2, suffix);
    }
  }

  if (syllables.length >= 2) {
    const prefix = syllables[0]! + syllables[1]!;
    if (REGEX.startsWithSingleVowelCombos.exec(prefix)) {
      syllables.splice(0, 2, prefix);
    }
  }

  if (syllables.length >= 2) {
    const last = syllables.at(-1)!;
    const suffix = syllables.at(-2)! + last;
    if (REGEX.onlyOneOrMoreC.exec(last)) {
      syllables.splice(-2, 2, suffix);
    }
  }

  return syllables;
}

/** Inner function for syllables, for recursion. */
function syllablesInner(slug: string): string[] {
  const all: string[] = [];
  const chars = slug.split("");
  let before = "";
  let after = "";
  let current = "";

  for (let i = 0; i < chars.length; i++) {
    before = chars.slice(0, i).join("");
    current = chars[i]!;
    after = chars.slice(i + 1, chars.length).join("");
    let candidate = before + current;

    // it's a consonant that comes after a vowel
    if (
      REGEX.endsWithVowel.exec(before) &&
      !REGEX.endsWithVowel.exec(current)
    ) {
      if (REGEX.startsWithEThenSpecials.exec(after)) {
        candidate += "e";
        after = after.replace(REGEX.startsWithE, "");
      }
      all.push(candidate);
      return all.concat(syllablesInner(after));
    }

    // unblended vowels ('noisy' vowel combinations)
    if (REGEX.endsWithNoisyVowelCombos.exec(candidate)) {
      // 'io' is noisy, not in 'ion'
      all.push(before);
      all.push(current);
      return all.concat(syllablesInner(after));
    }

    // if candidate is followed by a CV, assume consecutive open syllables
    if (
      REGEX.endsWithVowel.exec(candidate) &&
      REGEX.startsWithConsonantVowel.exec(after)
    ) {
      all.push(candidate);
      return all.concat(syllablesInner(after));
    }
  }

  // if still running, end last syllable
  if (REGEX.aiouy.exec(slug) || REGEX.endsWithEE.exec(slug)) {
    all.push(slug);
  } else if (slug && all.length > 0) {
    all.splice(-1, 1, all.at(-1)! + slug);
  } else {
    all.push(slug);
  }

  return all;
}

/**
 * Split a slug into approximate syllables. Implementation here is stolen from
 * <https://compromise.cool/>.
 */
export function getSyllables(slug: string): string[] {
  const all = postprocess(syllablesInner(slug));

  // for words like 'tree' and 'free'
  if (all.length === 0) {
    return [slug];
  }

  return all;
}
