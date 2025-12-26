import compass from "./categories/compass.js";
import countryAlpha2 from "./categories/countryAlpha2.js";
import countryAlpha3 from "./categories/countryAlpha3.js";
import daysOfTheWeek from "./categories/daysOfTheWeek.js";
import elementSymbols from "./categories/elementSymbols.js";
import greekLetters from "./categories/greekLetters.js";
import months from "./categories/months.js";
import natoAlphabet from "./categories/natoAlphabet.js";
import numbers from "./categories/numbers.js";
import romanNumerals from "./categories/romanNumerals.js";
import solfege from "./categories/solfege.js";
import usStateAbbreviations from "./categories/usStateAbbreviations.js";

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

