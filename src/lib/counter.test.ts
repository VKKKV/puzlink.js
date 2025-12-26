import { describe, expect, test } from "vitest";
import { Counter } from "./counter.js";

describe("Counter", () => {
  test("from, get", () => {
    const counter = Counter.from("abacabadabacaba");

    expect(counter.get("a")).toBeCloseTo(8);
    expect(counter.get("b")).toBeCloseTo(4);
    expect(counter.get("c")).toBeCloseTo(2);
    expect(counter.get("d")).toBeCloseTo(1);

    expect(counter.distinct).toBeCloseTo(4);
    expect(counter.total).toBeCloseTo(15);
  });

  test("addOne, addMany", () => {
    const counter = Counter.from("abacaba");
    expect(counter.get("a")).toBeCloseTo(4);
    expect(counter.get("b")).toBeCloseTo(2);
    expect(counter.get("c")).toBeCloseTo(1);
    expect(counter.get("d")).toBeCloseTo(0);
    counter.addMany("dabacab");
    counter.addOne("a");
    expect(counter.get("a")).toBeCloseTo(8);
    expect(counter.get("b")).toBeCloseTo(4);
    expect(counter.get("c")).toBeCloseTo(2);
    expect(counter.get("d")).toBeCloseTo(1);
  });
});
