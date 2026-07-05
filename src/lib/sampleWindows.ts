import { interval } from "./util.js";

const MIN_SAMPLE = 2000;

/**
 * For each index, return the smallest window around it that contains at least
 * MIN_SAMPLE items.
 */
export function sampleWindows(
  totals: number[],
): { start: number; end: number }[] {
  const length = totals.length - 1;
  return interval(1, length).map((i) => {
    let start = i;
    let end = i;
    let sum = totals[i] ?? 0;
    while (sum < MIN_SAMPLE && (start > 1 || end < length)) {
      if (start > 1) {
        sum += totals[--start] ?? 0;
      }
      if (end < length) {
        sum += totals[++end] ?? 0;
      }
    }
    return { start, end };
  });
}
