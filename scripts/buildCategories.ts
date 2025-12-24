import { iso31661 } from "iso-3166";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

const dataDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
);

const tsDir = path.join(dataDir, "categories");
const txtDir = path.join(dataDir, "categories", "txt");

async function writeFile(name: string, lines: string[]) {
  const cleanLines = lines
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.toLowerCase().replaceAll(/[^a-z]/g, ""))
    .filter((line) => line.length > 0);
  const tsLines = [];
  tsLines.push(`export default [`);
  for (const line of Array.from(new Set(cleanLines)).sort()) {
    tsLines.push(`  "${line}",`);
  }
  tsLines.push(`];`);
  await fs.writeFile(
    path.join(tsDir, `${name}.ts`),
    tsLines.join("\n"),
    "utf-8",
  );
}

// txt files:
for (const txtFileName of await fs.readdir(txtDir)) {
  console.log(`reading ${txtFileName}`);
  const txtLines = (
    await fs.readFile(path.join(txtDir, txtFileName), "utf-8")
  ).split("\n");
  await writeFile(txtFileName.replace(".txt", ""), txtLines);
}

// custom ones:
await writeFile(
  "countryAlpha2",
  iso31661.map((country) => country.alpha2),
);
await writeFile(
  "countryAlpha3",
  iso31661.map((country) => country.alpha3),
);
