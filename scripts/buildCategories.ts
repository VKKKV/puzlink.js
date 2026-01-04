import { iso31661 } from "iso-3166";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { scriptsDir, writeLines } from "./util.js";

const txtDir = path.join(scriptsDir, "categories");
const dataDir = path.resolve(scriptsDir, "..", "src", "data");
const jsonDir = path.join(dataDir, "categories");

/** Write a file, return its basename (without '.ts'). */
async function writeFile(name: string, lines: string[]) {
  const cleaned = lines
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.toLowerCase().replaceAll(/[^a-z]/g, ""))
    .filter((line) => line.length > 0);

  // Why reverse sort? For regex matching, we want to match the longest string
  // possible first, so e.g. we want to match NW before N.
  const unique = Array.from(new Set(cleaned)).sort().reverse();

  await writeLines(jsonDir, `${name}.json`, JSON.stringify(unique, null, 2));
  return name;
}

async function* writeTxtFiles(): AsyncGenerator<string> {
  for (const txtFileName of await fs.readdir(txtDir)) {
    console.log(`reading ${txtFileName}`);
    const txtLines = (
      await fs.readFile(path.join(txtDir, txtFileName), "utf-8")
    ).split("\n");
    yield await writeFile(txtFileName.replace(".txt", ""), txtLines);
  }
}

function* getRomanNumerals() {
  for (let i_ = 1; i_ <= 3999; i_++) {
    const result = [];
    let i = i_;
    for (const [roman, value] of [
      ["M", 1000],
      ["CM", 900],
      ["D", 500],
      ["CD", 400],
      ["C", 100],
      ["XC", 90],
      ["L", 50],
      ["XL", 40],
      ["X", 10],
      ["IX", 9],
      ["V", 5],
      ["IV", 4],
      ["I", 1],
    ] as const) {
      while (i >= value) {
        result.push(roman);
        i -= value;
      }
    }
    const final = result.join("");
    // Make this a short category:
    if (final.length <= 3) {
      yield final;
    }
  }
}

async function* writeCustomFiles(): AsyncGenerator<string> {
  // custom ones:
  yield await writeFile(
    "countryAlpha2",
    iso31661.map((country) => country.alpha2),
  );
  yield await writeFile(
    "countryAlpha3",
    iso31661.map((country) => country.alpha3),
  );
  yield await writeFile("romanNumerals", Array.from(getRomanNumerals()));
}

async function main() {
  const names = [];
  for await (const name of writeTxtFiles()) {
    console.log(`wrote ${name}.json`);
    names.push(name);
  }
  for await (const name of writeCustomFiles()) {
    console.log(`wrote ${name}.json`);
    names.push(name);
  }
  const categoriesFileName = path.join(dataDir, "categories.ts");
  const newLines = names
    .map(
      (name) =>
        `import ${name} from "./categories/${name}.json" with { type: "json" };`,
    )
    .sort();
  let importsDone = false;
  let categoriesDone = false;
  const missingCategories = new Set(names);
  for (const line of (await fs.readFile(categoriesFileName, "utf-8")).split(
    "\n",
  )) {
    if (!importsDone) {
      if (!line.includes("export const categories")) {
        continue;
      }
      importsDone = true;
      newLines.push("");
      newLines.push("export const categories: Category[] = [");
    } else if (!categoriesDone) {
      if (line.includes("items: ")) {
        for (const category of missingCategories) {
          if (line.includes(category)) {
            missingCategories.delete(category);
            newLines.push(line);
            break;
          }
        }
        continue;
      }
      categoriesDone = true;
      for (const category of missingCategories) {
        newLines.push(`  { name: null, items: ${category} },`);
      }
      newLines.push("];");
    } else {
      newLines.push(line);
    }
  }
  // Trailing newline:
  newLines.push("");
  await fs.writeFile(categoriesFileName, newLines.join("\n"), "utf-8");
}

await main();
