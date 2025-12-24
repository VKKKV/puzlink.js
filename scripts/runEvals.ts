import chalk from "chalk";
import chokidar from "chokidar";
import meow from "meow";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import { Puzlink } from "../src/index.js";
import { Wordlist } from "../src/lib/wordlist.js";
import type { Link } from "../src/linkers/index.js";
import { time } from "./util.js";

const cli = meow(
  `
    Run evals matching a specific pattern. A bunch of the evals are stolen from
    Collective.jl: https://github.com/rdeits/Collective.jl

    Usage
      $ npm run test:evals [options] [<pattern>]

    Options
      --links <num>, -l <num>  Number of links to print per failed case [default: 3]
      --description, -d        Show descriptions for each link
      --watch, -w              Rerun on changes *on the eval files*
  `,
  {
    importMeta: import.meta,
    flags: {
      links: {
        type: "number",
        shortFlag: "l",
        default: 3,
      },
      description: {
        type: "boolean",
        shortFlag: "d",
        default: false,
      },
      watch: {
        type: "boolean",
        shortFlag: "w",
        default: false,
      },
    },
    allowUnknownFlags: false,
    description: false,
  },
);

type Args = (typeof cli)["flags"] & { pattern: string | undefined };

function parseArgs(): Args {
  const pattern = cli.input[0];
  return { pattern, ...cli.flags };
}

const Status = ["okay", "warn", "fail"] as const;
type Status = (typeof Status)[number];

const getWorstStatus = (statuses: Status[]): Status => {
  if (statuses.includes("fail")) {
    return "fail";
  }
  if (statuses.includes("warn")) {
    return "warn";
  }
  return "okay";
};

const statusColor: Record<Status, (text: string) => string> = {
  okay: chalk.green,
  warn: chalk.yellow,
  fail: chalk.red,
};

const statusLabel: Record<Status, string> = {
  okay: chalk.bgGreen.black.bold(" OKAY "),
  warn: chalk.bgYellow.black.bold(" WARN "),
  fail: chalk.bgRed.black.bold(" FAIL "),
};

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

async function* getEvalSuites(args: Args): AsyncGenerator<EvalSuite> {
  for (let file of await fs.readdir(evalsDir)) {
    if (!file.endsWith(".ts")) {
      continue;
    }
    if (args.pattern && !file.includes(args.pattern)) {
      continue;
    }
    if (args.watch) {
      // Need to bust the cache:
      file = `${file}?t=${Date.now().toString()}`;
    }
    try {
      const evalSuite = (await import(path.join(evalsDir, file))) as {
        default?: Partial<EvalSuite>;
      };
      if (
        !evalSuite.default?.name ||
        !evalSuite.default.source ||
        !evalSuite.default.cases ||
        evalSuite.default.cases.some((c) => !c.slugs || !c.expected)
      ) {
        continue;
      }
      yield evalSuite.default as EvalSuite;
    } catch {
      // pass; possibly a file that broke mid-edit
    }
  }
}

type EvalResult = {
  expected: string;
  status: Status;
  links: Link[];
  actualRank: number | null;
  actualLink: Link | null;
  parsedSlugs: string[];
};

function* runEvalSuite(
  puzlink: Puzlink,
  suite: EvalSuite,
): Generator<EvalResult> {
  for (const { slugs, expected } of suite.cases) {
    const parsedSlugs = puzlink.parse(slugs);
    const links = puzlink.link(parsedSlugs, true);
    const index = links.findIndex((link) => link.name.includes(expected));
    const status =
      index === 0 ? "okay" : index !== -1 && index <= 2 ? "warn" : "fail";
    yield {
      expected,
      status,
      links,
      actualRank: index !== -1 ? index + 1 : null,
      actualLink: index !== -1 ? links[index]! : null,
      parsedSlugs,
    };
  }
}

function printSingleResult(args: Args, result: EvalResult): string | null {
  if (result.status === "okay") {
    return null;
  }
  const lines: string[][] = [];

  lines.push([" ".repeat(2)]);
  lines.at(-1)!.push(statusColor[result.status](`${result.expected}:`));
  lines
    .at(-1)!
    .push(
      result.actualRank ? ` top ${result.actualRank.toString()}` : " not found",
    );
  if (result.actualLink) {
    lines
      .at(-1)!
      .push(chalk.gray(` (${result.actualLink.logProb.toLog().toFixed(3)})`));
  }

  for (let i = 0; i < args.links && i < result.links.length; i++) {
    const isExpectedLink = i + 1 === result.actualRank;
    lines.push([" ".repeat(2)]);
    lines
      .at(-1)!
      .push(
        chalk.gray(
          result.links[i]!.logProb.toLog().toFixed(3).padStart(7, " "),
        ),
      );
    lines.at(-1)!.push(chalk.gray(": "));
    if (isExpectedLink) {
      lines.at(-1)!.push(statusColor[result.status](result.links[i]!.name!));
    } else {
      lines.at(-1)!.push(result.links[i]!.name!);
    }

    if (args.description) {
      for (const line of result.links[i]!.description) {
        lines.push([" ".repeat(6)]);
        lines.at(-1)!.push((isExpectedLink ? chalk.white : chalk.gray)(line));
      }
    }
  }

  return lines.map((line) => line.join("")).join("\n");
}

function printEvalResults({
  args,
  duration,
  name,
  results,
}: {
  args: Args;
  duration: number;
  name: string;
  results: EvalResult[];
}): string {
  const lines: string[] = [];

  const worstStatus = getWorstStatus(results.map((result) => result.status));
  lines.push(
    `${statusLabel[worstStatus]} ${name} ${chalk.gray(`(${duration.toString()}ms)`)}`,
  );

  for (const result of results) {
    const line = printSingleResult(args, result);
    if (line) {
      lines.push(line);
    }
  }

  return lines.join("\n");
}

async function mainLoop(args: Args, puzlink: Puzlink) {
  const statusCounts: Record<Status, number> = { okay: 0, warn: 0, fail: 0 };
  let testDurationMs = 0;
  let totalTests = 0;

  for await (const evalSuite of getEvalSuites(args)) {
    const { result: results, duration } = await time(() =>
      Array.from(runEvalSuite(puzlink, evalSuite)),
    );
    console.log(
      printEvalResults({ args, duration, name: evalSuite.name, results }),
    );
    for (const result of results) {
      statusCounts[result.status] += 1;
      totalTests += 1;
    }
    testDurationMs += duration;
  }

  console.log("");
  console.log(
    `finished ${totalTests.toString()} tests in ${testDurationMs.toString()}ms:`,
  );
  for (const status of Status) {
    console.log(`${statusLabel[status]} ${statusCounts[status].toString()}`);
  }
}

async function main() {
  const args = parseArgs();

  process.stdout.write(chalk.gray("initializing puzlink..."));
  const { result: puzlink, duration: puzlinkInitMs } = await time(async () => {
    return new Puzlink(await Wordlist.download());
  });
  console.log(chalk.gray(` took ${puzlinkInitMs.toString()}ms`));
  console.log("");

  if (!args.watch) {
    await mainLoop(args, puzlink);
  } else {
    const rerun = (file: string) => {
      console.clear();
      console.log(chalk.gray("rerunning tests..."));
      console.log();
      void mainLoop(
        {
          ...args,
          pattern: args.pattern ?? path.basename(file),
        },
        puzlink,
      );
    };

    chokidar
      .watch(evalsDir, { ignoreInitial: true })
      .on("add", rerun)
      .on("change", rerun);
    if (args.pattern) {
      await mainLoop(args, puzlink);
      console.log();
    }
    console.log(chalk.gray("watching for changes..."));
  }
}

await main();
