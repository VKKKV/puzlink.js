/**
 * Parse an input to a list of slugs.
 *
 * If the input has newlines, we split by newlines. Otherwise, if commas
 * exist, we split by commas. Otherwise, we split by spaces.
 */
export function parse(words: string | readonly string[]): string[] {
  if (typeof words === "string") {
    if (words.includes("\n")) {
      words = words.split("\n");
    } else if (words.includes(",")) {
      words = words.split(",");
    } else {
      words = words.split(" ");
    }
  }
  return words
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 0);
}
