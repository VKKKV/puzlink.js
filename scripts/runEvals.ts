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

const start = Date.now();

const puzlink = new Puzlink(await Wordlist.download());

type Status = "okay" | "warn" | "fail";

const statusCounts: Record<Status, number> = {
  okay: 0,
  warn: 0,
  fail: 0,
};

const labelForStatus: Record<Status, string> = {
  okay: chalk.bgGreen.black.bold(" OKAY "),
  warn: chalk.bgYellow.black.bold(" WARN "),
  fail: chalk.bgRed.black.bold(" FAIL "),
};

function runEvalSuite(puzlink: Puzlink, suite: EvalSuite) {
  const lines: string[][] = [];
  let worstStatus: Status = "okay";
  for (const { slugs, expected } of suite.cases) {
    const links = puzlink.link(slugs, true);
    const index = links.findIndex((link) => link.name.includes(expected));
    const status =
      index === 0 ? "okay" : index !== -1 && index <= 2 ? "warn" : "fail";
    statusCounts[status]++;
    if (status === "okay") {
      continue;
    }
    lines.push(["  "]);
    lines
      .at(-1)!
      .push((status === "fail" ? chalk.red : chalk.yellow)(`${expected}: `));
    lines
      .at(-1)!
      .push(index !== -1 ? `top ${(index + 1).toString()}` : "not found");
    if (index !== -1) {
      lines
        .at(-1)!
        .push(chalk.gray(` (${links[index]!.logProb.toLog().toFixed(3)})`));
    }
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
    if (status === "fail") {
      worstStatus = "fail";
    } else if (worstStatus !== "fail") {
      worstStatus = "warn";
    }
  }
  console.log(`${labelForStatus[worstStatus]} ${suite.name}`);
  if (worstStatus !== "okay") {
    console.log(lines.map((line) => line.join("")).join("\n"));
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

console.log("");

const totalTests = statusCounts.okay + statusCounts.warn + statusCounts.fail;
const duration = Date.now() - start;
console.log(
  `finished ${totalTests.toString()} tests in ${duration.toString()}ms:`,
);
for (const status of ["okay", "warn", "fail"] as const) {
  console.log(`${labelForStatus[status]} ${statusCounts[status].toString()}`);
}
