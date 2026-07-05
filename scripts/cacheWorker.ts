import { downloadWordlist } from "#download";
import { allFeatures, featureLogProb } from "../src/features/index.js";
import { Wordlist } from "../src/lib/wordlist.js";
import { allMetrics, metricLogProbs } from "../src/metrics/index.js";
import { timeSync } from "./util.js";

export type WorkItem =
  | { kind: "feature"; index: number }
  | { kind: "metric"; index: number };

export type WorkResult =
  | { kind: "feature"; index: number; result: number; duration: number }
  | { kind: "metric"; index: number; result: number[]; duration: number };

const send = process.send?.bind(process) as
  | ((message: WorkResult | "ready") => void)
  | undefined;
if (!send) {
  throw new Error("cacheWorker must be run as a forked child process");
}

const wordlist = new Wordlist(await downloadWordlist());
const features = allFeatures();
const metrics = allMetrics();

process.on("message", (item: WorkItem) => {
  if (item.kind === "feature") {
    const { result, duration } = timeSync(() =>
      featureLogProb(wordlist, features[item.index]!).toLog(),
    );
    send({ ...item, result, duration });
  } else {
    const { result, duration } = timeSync(() =>
      metricLogProbs(wordlist, metrics[item.index]!).map((x) => x.toLog()),
    );
    send({ ...item, result, duration });
  }
});

send("ready");
