import type { RefCallback } from "react";
import { useRef } from "react";
import "./Settings.css";
import { useStore } from "./store";

export function Settings({
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
            {100 * (linkOptions.minFeatureRatio ?? 0.5)}% of the given words.
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

        <label className="setting-item">
          <input
            type="checkbox"
            checked={userOptions.capitalizeSlugs}
            onChange={(e) => {
              setUserOptions({
                ...userOptions,
                capitalizeSlugs: e.target.checked,
              });
            }}
          />
          <span className="setting-name">Capitalize answer-like strings</span>
          <span className="setting-description">
            Capitalize inputs, indexed letters, substrings, etc.
          </span>
        </label>

        <label className="setting-item">
          <input
            type="checkbox"
            checked={userOptions.zeroIndex}
            onChange={(e) => {
              setUserOptions({
                ...userOptions,
                zeroIndex: e.target.checked,
              });
            }}
          />
          <span className="setting-name">Start indices at 0</span>
          <span className="setting-description">
            Start letter indices at 0 instead of 1.
          </span>
        </label>
      </div>

      <div className="controls">
        <button
          className="secondary"
          onClick={() => {
            setLinkOptions({});
            setUserOptions({
              autoSend: true,
              autoFormat: false,
              capitalizeSlugs: false,
              zeroIndex: false,
            });
          }}
        >
          Reset
        </button>
        <button
          onClick={() => {
            dialogRef.current?.close();
            sendInput();
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
