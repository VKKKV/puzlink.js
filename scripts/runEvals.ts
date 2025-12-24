import chalk from "chalk";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import { Puzlink } from "../src/index.js";
import { Wordlist } from "../src/lib/wordlist.js";

// A bunch of the evals are stolen from Collective.jl: https://github.com/rdeits/Collective.jl
export type EvalSuite = {
  name: string;
  source?: string;
  cases: {
    slugs: string | string[];
    expected: string;
  }[];
};

const evalsDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "evals",
);

const puzlink = new Puzlink(await Wordlist.download());

function runEvalSuite(puzlink: Puzlink, suite: EvalSuite) {
  const lines: string[][] = [];
  let anyFailed = false;
  for (const { slugs, expected } of suite.cases) {
    const links = puzlink.link(slugs, true);
    const index = links.findIndex((link) => link.name.includes(expected));
    const failed = index !== 0;
    const superFailed = index === -1;
    if (!failed && !superFailed) {
      continue;
    }
    lines.push(["  "]);
    lines
      .at(-1)!
      .push((superFailed ? chalk.red : chalk.yellow)(`${expected}: `));
    lines
      .at(-1)!
      .push(index !== -1 ? `top ${(index + 1).toString()}` : "not found");
    if (index !== -1) {
      lines
        .at(-1)!
        .push(chalk.gray(` (${links[index]!.logProb.toLog().toFixed(3)})`));
    }
    if (failed) {
      for (let i = 0; i < 3 && i < links.length; i++) {
        lines.push(["    "]);
        lines
          .at(-1)!
          .push(
            chalk.gray(links[i]!.logProb.toLog().toFixed(3).padStart(7, " ")),
          );
        lines.at(-1)!.push(": ");
        lines.at(-1)!.push(links[i]!.name);
      }
    }
    anyFailed ||= failed;
  }
  if (anyFailed) {
    console.log(`${chalk.bgRed.black.bold(" FAIL ")} ${suite.name}`);
    console.log(lines.map((line) => line.join("")).join("\n"));
  } else {
    console.log(`${chalk.bgGreen.black.bold(" PASS ")} ${suite.name}`);
  }
}

for (const file of await fs.readdir(evalsDir)) {
  if (!file.endsWith(".ts")) {
    continue;
  }
  const evalSuite = (await import(path.join(evalsDir, file))) as {
    default: EvalSuite;
  };
  runEvalSuite(puzlink, evalSuite.default);
}
