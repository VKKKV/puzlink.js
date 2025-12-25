import type { Link } from "puzlink";
import { Puzlink } from "puzlink";

export type WorkerInput =
  | { type: "download" }
  | { type: "input"; input: string };
export type WorkerOutput =
  | { type: "ready" }
  | { type: "output"; input: string; output: Link[] };

const send = (message: WorkerOutput) => {
  self.postMessage(message);
};

let puzlink: Puzlink | null;

self.addEventListener("message", ({ data }: { data: WorkerInput }) => {
  if (data.type === "download") {
    void Puzlink.download().then((instance) => {
      puzlink = instance;
      send({ type: "ready" });
    });
    return;
  }
  const links = puzlink!.link(data.input, { limit: null });
  send({ type: "output", input: data.input, output: links });
});
