import { describe, expect, test } from "vitest";
import { LogCounter } from "./logCounter.js";

describe("LogCounter", () => {
  test("from, get", () => {
    const counter = LogCounter.from("abacabadabacaba");

    expect(counter.get("a").toNum()).toBeCloseTo(8);
    expect(counter.get("b").toNum()).toBeCloseTo(4);
    expect(counter.get("c").toNum()).toBeCloseTo(2);
    expect(counter.get("d").toNum()).toBeCloseTo(1);

    expect(counter.total.toNum()).toBeCloseTo(15);
  });
});
