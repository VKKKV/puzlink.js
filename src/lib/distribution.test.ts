import { describe, expect, test } from "vitest";
import { Distribution } from "./distribution.js";
import { LogCounter } from "./logCounter.js";

describe("Distribution", () => {
  const dist = Distribution.from([2, 3, 3, 4] as number[]);

  test("moment", () => {
    expect(dist.moment(1).toNum()).toBeCloseTo(1);
    expect(dist.moment(2).toNum()).toBeCloseTo(3 / 8);
  });

  test("map", () => {
    const mapped = dist.map((n) => n % 2);
    expect(mapped.moment(1).toNum()).toBeCloseTo(1);
    // prob three numbers from the distribution are the same mod 2:
    expect(mapped.moment(3).toNum()).toBeCloseTo(1 / 4);
  });

  test("outliers", () => {
    expect(dist.outliers(LogCounter.from([5, 5, 5, 5, 5, 5])))
      .toMatchInlineSnapshot(`
        {
          "high": {
            "5": _LogNum {
              "data": 1.791759469228055,
            },
          },
          "low": {},
        }
      `);
  });
});
