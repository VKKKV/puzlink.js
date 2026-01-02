import type { HypernymDAGData } from "./lib/hypernymDAG.js";

export async function downloadHypernymData({
  includeWords = true,
}: {
  includeWords?: boolean;
} = {}): Promise<HypernymDAGData> {
  const fetchLines = async (name: string) => {
    const resp = await fetch(
      `https://cdn.jsdelivr.net/npm/puzlink@0.2.0/dist/data/hypernyms/${name}`,
    );
    return (await resp.text()).split("\n");
  };
  const [indexLines, dataLines, wordLines] = await Promise.all([
    fetchLines("hypernyms-index.txt"),
    fetchLines("hypernyms-data.txt"),
    includeWords && fetchLines("hypernyms-word.txt"),
  ]);
  return {
    indexLines,
    dataLines,
    ...(wordLines && { wordLines }),
  };
}

export { loadWordlist as downloadWordlist } from "cromulence";
