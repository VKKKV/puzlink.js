import { describe, expect, test } from "vitest";
import { Distribution } from "./distribution.js";
import { LogCounter } from "./logCounter.js";

describe("Distribution", () => {
  const dist = Distribution.fromItems([2, 3, 3, 4]);

  test("moment", () => {
    expect(dist.moment(1).toNum()).toBeCloseTo(1);
    expect(dist.moment(2).toNum()).toBeCloseTo(3 / 8);
  });

  test("mapItems", () => {
    const mapped = dist.mapItems((n) => n % 2);
    expect(mapped.moment(1).toNum()).toBeCloseTo(1);
    // prob three numbers from the distribution are the same mod 2:
    expect(mapped.moment(3).toNum()).toBeCloseTo(1 / 4);
  });

  test("outliers", () => {
    expect(dist.outliers(LogCounter.from([5, 5, 5, 5, 5, 5])))
      .toMatchInlineSnapshot(`
        {
          "high": Map {
            5 => 1.791759469228055,
          },
          "low": Map {},
        }
      `);
  });
});
