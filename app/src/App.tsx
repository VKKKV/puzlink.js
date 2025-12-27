import type { Link } from "puzlink";
import { Puzlink } from "puzlink";
import type { RefCallback } from "react";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useStore } from "./store";

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

function LinkOutput() {
  const puzlinkReady = useStore((state) => state.puzlinkReady);
  const [maxLinks, setMaxLinks] = useState(50);
  const outputLinks = useStore((state) => state.outputLinks);

  if (!puzlinkReady) {
    return <div className="output loading">loading puzlink.js…</div>;
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

  return isWorking ? <div className="loading-spinner"></div> : null;
}

function Settings({
  ref: refCallback,
}: {
  ref: RefCallback<HTMLDialogElement>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkOptions = useStore((state) => state.linkOptions);
  const setLinkOptions = useStore((state) => state.setLinkOptions);
  const userOptions = useStore((state) => state.userOptions);
  const setUserOptions = useStore((state) => state.setUserOptions);
  const sendInput = useStore((state) => state.sendInput);

  return (
    <dialog
      className="settings"
      closedby="any"
      ref={(ref) => {
        refCallback(ref);
        dialogRef.current = ref;
      }}
    >
      <h2>Settings</h2>

      <div className="setting-items">
        <label className="setting-item">
          <span></span>
          <input
            type="range"
            value={100 * (linkOptions.minFeatureRatio ?? 0.5)}
            min={0}
            max={100}
            step={10}
            onChange={(e) => {
              setLinkOptions({
                ...linkOptions,
                minFeatureRatio: parseFloat(e.target.value) / 100,
              });
            }}
          />
          <span className="setting-name">Minimum feature ratio</span>
          <span className="setting-description">
            Only report features that are satisfied by either 0% or at least{" "}
            {100 * (linkOptions.minFeatureRatio ?? 0.5)}% of the given words.{" "}
            <button
              className="button-link"
              onClick={() => {
                setLinkOptions({
                  ...linkOptions,
                  minFeatureRatio: 0.5,
                });
              }}
            >
              Reset.
            </button>
          </span>
        </label>

        <label className="setting-item">
          <input
            type="checkbox"
            checked={userOptions.autoSend}
            onChange={(e) => {
              setUserOptions({ ...userOptions, autoSend: e.target.checked });
            }}
          />
          <span className="setting-name">Auto run</span>
          <span className="setting-description">
            Run the input whenever it changes.
          </span>
        </label>

        <label className="setting-item">
          <input
            type="checkbox"
            checked={userOptions.autoFormat}
            onChange={(e) => {
              setUserOptions({ ...userOptions, autoFormat: e.target.checked });
            }}
          />
          <span className="setting-name">Auto format</span>
          <span className="setting-description">
            Format the input when clicking out.
          </span>
        </label>
      </div>

      <button
        onClick={() => {
          dialogRef.current?.close();
          sendInput();
        }}
      >
        Close
      </button>
    </dialog>
  );
}

function LinkInput() {
  const linkInput = useStore((state) => state.linkInput);
  const setLinkInput = useStore((state) => state.setLinkInput);
  const sendInput = useStore((state) => state.sendInput);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const userOptions = useStore((state) => state.userOptions);

  const format = () => {
    setLinkInput(Puzlink.parse(linkInput).join("\n"));
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
