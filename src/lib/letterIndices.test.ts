import { describe, expect, test } from "vitest";
import { LetterIndices } from "./letterIndices.js";
import { interval } from "./util.js";

describe("letterIndices", () => {
  test("from, get", () => {
    const indices = LetterIndices.from("abacabadabacaba");

    expect(indices.get("a")).toEqual(interval(0, 15, 2));
    expect(indices.get("b")).toEqual(interval(1, 15, 4));
    expect(indices.get("c")).toEqual(interval(3, 15, 8));
    expect(indices.get("d")).toEqual(interval(7, 15, 16));
  });
});
