import { describe, expect, test } from "vitest";
import { getSyllables } from "./syllables.js";

describe("getSyllables", () => {
  test("syllables", () => {
    expect(getSyllables("tree")).toEqual(["tree"]);
    expect(getSyllables("preternaturally")).toEqual([
      "pre",
      "ter",
      "na",
      "tu",
      "ral",
      "ly",
    ]);
    expect(getSyllables("everybody")).toEqual(["eve", "ry", "bo", "dy"]);
    expect(getSyllables("civilized")).toEqual(["ci", "vi", "lized"]);
    expect(getSyllables("hyphenation")).toEqual(["hy", "phe", "na", "tion"]);
    expect(getSyllables("beautiful")).toEqual(["beau", "ti", "ful"]);
  });

  test("known failures", () => {
    expect(getSyllables("horse")).toEqual(["hor", "se"]);
    expect(getSyllables("chance")).toEqual(["chan", "ce"]);
    expect(getSyllables("people")).toEqual(["pe", "o", "ple"]);
    expect(getSyllables("shared")).toEqual(["sha", "red"]);
  });
});
