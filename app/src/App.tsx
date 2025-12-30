import * as Puzlink from "puzlink";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { LinkDisplay } from "./LinkDisplay";
import { Settings } from "./Settings";
import { useStore } from "./store";

function LinkOutput() {
  const puzlinkReady = useStore((state) => state.puzlinkReady);
  const [maxLinks, setMaxLinks] = useState(50);
  const outputLinks = useStore((state) => state.outputLinks);

  if (!puzlinkReady) {
    return (
      <div className="output loading">
        <span className="spinner" /> loading puzlink.js…
      </div>
    );
  }

  return (
    <div className="output">
      <div className="links">
        {outputLinks.slice(0, maxLinks).map((link, i) => (
          <LinkDisplay key={link.name} link={link} rank={i} />
        ))}
        {maxLinks < outputLinks.length && (
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

function LinkSpinner() {
  const [isWorking, setIsWorking] = useState(false);
  const pendingTimeout = useRef<number | null>(null);

  useEffect(
    () =>
      useStore.subscribe((state) => {
        if (pendingTimeout.current) {
          window.clearTimeout(pendingTimeout.current);
        }
        pendingTimeout.current = window.setTimeout(() => {
          pendingTimeout.current = null;
          setIsWorking(state.inputID !== null);
        }, 200);
      }),
    [],
  );

  return isWorking ? <div className="spinner"></div> : null;
}

function LinkInput() {
  const linkInput = useStore((state) => state.linkInput);
  const setLinkInput = useStore((state) => state.setLinkInput);
  const sendInput = useStore((state) => state.sendInput);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const userOptions = useStore((state) => state.userOptions);

  const format = () => {
    const parsed = Puzlink.parse(linkInput).join("\n");
    setLinkInput(userOptions.capitalizeSlugs ? parsed.toUpperCase() : parsed);
  };

  return (
    <>
      <Settings
        ref={(ref) => {
          dialogRef.current = ref;
        }}
      />
      <textarea
        value={linkInput}
        onChange={(e) => {
          setLinkInput(e.target.value);
          if (userOptions.autoSend) {
            sendInput();
          }
        }}
        onBlur={() => {
          if (userOptions.autoFormat) {
            format();
          }
          sendInput();
        }}
      />
      <div className="controls">
        <button
          className="secondary"
          onClick={() => {
            dialogRef.current?.showModal();
          }}
        >
          Settings
        </button>
        <button
          className="secondary"
          onClick={() => {
            format();
          }}
        >
          Format
        </button>
      </div>
    </>
  );
}

function App() {
  const initWorker = useStore((state) => state.initWorker);

  useEffect(() => {
    initWorker();
  }, [initWorker]);

  return (
    <div className="app">
      <div className="input">
        <div className="header">
          <h1>puzlink.js</h1>
          <LinkSpinner />
        </div>
        <LinkInput />
        <p className="credits">
          by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
          <a href="https://github.com/cjquines/meta-data">Github</a>
        </p>
      </div>
      <LinkOutput />
    </div>
  );
}

export default App;
