import { beforeEach, describe, expect, test } from "vitest";
import { memoize } from "./memoize.js";

describe("memoize", () => {
  let fooCalls = 0;
  let barCalls = 0;
  let bazCalls = 0;

  class FooBar {
    base: number;

    constructor(base: number) {
      this.base = base;
    }

    @memoize()
    foo(a: number) {
      fooCalls++;
      return this.base + a;
    }

    @memoize(2)
    bar(a: number, b: number) {
      barCalls++;
      return this.base + a + b;
    }

    @memoize(3)
    baz(a: number, b: number, c: number) {
      bazCalls++;
      return this.base + a + b + c;
    }
  }

  beforeEach(() => {
    fooCalls = 0;
    barCalls = 0;
    bazCalls = 0;
  });

  test("single instance", () => {
    const fooBar = new FooBar(0);
    expect(fooBar.foo(1)).toBe(1);
    expect(fooBar.foo(1)).toBe(1);
    expect(fooCalls).toBe(1);
    expect(fooBar.bar(1, 2)).toBe(3);
    expect(fooBar.bar(1, 2)).toBe(3);
    expect(barCalls).toBe(1);
    expect(fooBar.baz(1, 2, 3)).toBe(6);
    expect(fooBar.baz(1, 2, 3)).toBe(6);
    expect(bazCalls).toBe(1);
  });

  test("two unshared instances", () => {
    const fooBar1 = new FooBar(1);
    const fooBar2 = new FooBar(2);
    expect(fooBar1.foo(1)).toBe(2);
    expect(fooBar2.foo(1)).toBe(3);
    expect(fooBar1.foo(1)).toBe(2);
    expect(fooBar2.foo(1)).toBe(3);
    expect(fooCalls).toBe(2);
    expect(fooBar1.bar(1, 2)).toBe(4);
    expect(fooBar2.bar(1, 2)).toBe(5);
    expect(fooBar1.bar(1, 2)).toBe(4);
    expect(fooBar2.bar(1, 2)).toBe(5);
    expect(barCalls).toBe(2);
  });
});
