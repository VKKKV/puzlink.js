import compass from "./categories/compass.json" with { type: "json" };
import countryAlpha2 from "./categories/countryAlpha2.json" with { type: "json" };
import countryAlpha3 from "./categories/countryAlpha3.json" with { type: "json" };
import daysOfTheWeek from "./categories/daysOfTheWeek.json" with { type: "json" };
import elementSymbols from "./categories/elementSymbols.json" with { type: "json" };
import greekLetters from "./categories/greekLetters.json" with { type: "json" };
import months from "./categories/months.json" with { type: "json" };
import natoAlphabet from "./categories/natoAlphabet.json" with { type: "json" };
import numbers from "./categories/numbers.json" with { type: "json" };
import romanNumerals from "./categories/romanNumerals.json" with { type: "json" };
import solfege from "./categories/solfege.json" with { type: "json" };
import usStateAbbreviations from "./categories/usStateAbbreviations.json" with { type: "json" };

export const categories: Category[] = [
  { name: "iso 2-letter country codes", items: countryAlpha2 },
  { name: "iso 3-letter country codes", items: countryAlpha3 },
  { name: "days of the week", items: daysOfTheWeek },
  { name: "element symbols", items: elementSymbols },
  { name: "greek letters", items: greekLetters },
  { name: "months", items: months },
  { name: "nato alphabet", items: natoAlphabet },
  { name: "numbers", items: numbers },
  { name: "solfege", items: solfege },
  { name: "us state abbreviations", items: usStateAbbreviations },
  { name: "compass directions", items: compass },
  { name: "roman numerals", items: romanNumerals },
];

export type Category = {
  name: string;
  items: string[];
};

/** Categories where each item is at most 3 characters long. */
export const shortCategories = categories.filter((c) =>
  c.items.every((item) => item.length <= 3),
);

/** Categories where some item is at least 5 characters long. */
export const longCategories = categories.filter((c) =>
  c.items.some((item) => item.length >= 5),
);
