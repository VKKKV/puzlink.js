import { describe, expect, test } from "vitest";
import { Wordlist } from "./wordlist.js";

describe("Wordlist", () => {
  const words = Wordlist.from(["ant", "cat", "cat", "dog", "god"]);

  test("reduce", () => {
    expect(words.reduce(0, (acc) => acc + 1)).toBe(4);
    expect(words.reduce(0, (acc, slug) => acc + (slug === "cat" ? 1 : 0))).toBe(
      1,
    );
  });

  test("logProb", () => {
    expect(words.logProb(() => true).toNum()).toBeCloseTo(1);
    expect(words.logProb((slug) => slug.includes("a")).toNum()).toBeCloseTo(
      1 / 2,
    );
  });

  test("isWord, isPhrase", () => {
    expect(words.isWord("cat")).toBe(true);
    expect(words.isWord("bat")).toBe(false);
    expect(words.isPhrase("ant cat dog")).toBe(true);
  });

  test("isAnagram, isTransadd, isTransdelete", () => {
    expect(words.anagrams("god")).toEqual(["dog"]);
    expect(words.anagrams("bat")).toEqual([]);
    expect(words.anagrams("ant")).toEqual([]);
    expect(words.anagrams("ant", { loose: true })).toEqual(["ant"]);
  });

  test("probSharedAffix", () => {
    // both dog/god and god/dog work
    expect(words.probSharedAffix(1).toNum()).toBeCloseTo(1 / 8);
  });
});
