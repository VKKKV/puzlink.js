import { Puzlink } from "puzlink";
import type { Link } from "puzlink";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import "./App.css";
import type { WorkerInput, WorkerOutput } from "./worker";
import Worker from "./worker?worker&inline";

function LinkDisplay({ link, rank }: { link: Link; rank: number }) {
  return (
    <details className="link" open={rank <= 4 && link.description.length > 0}>
      <summary>
        <div className="link-summary">
          <span className="link-name">{link.name}</span>
          <span className="link-score">{link.score.toFixed(1)}</span>
        </div>
      </summary>
      <ul className="link-description">
        {link.description.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </details>
  );
}

function Output({ input }: { input: string }) {
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState<{
    input: string;
    links: Link[];
  }>({ input: "", links: [] });
  const [maxLinks, setMaxLinks] = useState(50);
  const worker = useRef<Worker>(null);

  const onMessage = useEffectEvent(({ data }: { data: WorkerOutput }) => {
    if (data.type === "ready") {
      setLoading(false);
    } else if (data.input === input) {
      setMaxLinks(50);
      setOutput({
        input: data.input,
        links: data.output,
      });
    }
  });

  useEffect(() => {
    worker.current = new Worker();
    worker.current.addEventListener("message", onMessage);
    worker.current.postMessage({ type: "download" } satisfies WorkerInput);
    return () => {
      worker.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (loading || !worker.current) return;
    worker.current.postMessage({ type: "input", input } satisfies WorkerInput);
  }, [loading, input]);

  if (loading) {
    return <div className="output loading">Loading…</div>;
  }

  return (
    <div className="output">
      {/* TODO: make this button do something skull emoji */}
      {/* <div className="output-controls"> */}
      {/*   <button>Filter</button> */}
      {/* </div> */}
      <div className="links">
        {output.links.slice(0, maxLinks).map((link, i) => (
          <LinkDisplay key={link.name} link={link} rank={i} />
        ))}
        {maxLinks < output.links.length && (
          <button
            onClick={() => {
              setMaxLinks(maxLinks + 50);
            }}
            className="load-more secondary"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}

// TODO: right now we stole these examples directly from puz.link; we should format them with newlines and spaces to make clear that it like, works
const examples = [
  "press hill apes nerds times ordinary mill",
  "chokechain hourhand lithograph shibboleth shortsighted thermophile",
  "amontillados blooming calcutta dilemma piazzas squareness",
  "antithetic crosshatches gaggle nonconsenting pneumococcal prestidigitation smogless trunnions",
  "grimaced formally questionable discouraged communicated chysalis saccharin",
  "thumbtacks monologue frigidities statuesque testimony satirizing flawed",
  "arcdetriomphescalemodel uvwavedetector gearstick firstprize thiefgamemanual monopoly tuvalutravelguide",
  "rib node emission lamp ward cent cam",
  "citygates impulsive clickspam baptistry leviathan policecar coupdetat sforzando cartwheel",
  "lowered levitate inanimate paradise leveraged sizes tuxedo",
];

function App() {
  const [input, setInput] = useState(() =>
    examples[Math.floor(Math.random() * examples.length)].split(" ").join("\n"),
  );

  return (
    <>
      <div className="app">
        <div className="input">
          <div className="header">
            <h1>puzlink.js</h1>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />
          <div className="controls">
            <div className="buttons">
              {/* TODO: add a settings button maybe? for idk, autoformat on blur... */}
              <button
                className="secondary"
                onClick={() => {
                  setInput(Puzlink.parse(input).join("\n"));
                }}
              >
                Format
              </button>
            </div>
          </div>
          <p className="credits">
            by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
            <a href="https://github.com/cjquines/meta-data">Github</a>
          </p>
        </div>
        <Output input={input} />
      </div>
    </>
  );
}

export default App;
