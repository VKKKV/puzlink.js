import type { Link, LinkOptions } from "puzlink";
import { Puzlink } from "puzlink";
import { create, type StateCreator } from "zustand";
import { shallow as shallowEqual } from "zustand/shallow";
import type { WorkerInput, WorkerOutput } from "./worker";
import PuzlinkWorker from "./worker?worker&inline";
import { persist } from "zustand/middleware";

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

const randomExample = () =>
  examples[Math.floor(Math.random() * examples.length)].split(" ").join("\n");

const worker = new PuzlinkWorker();
const send = (input: WorkerInput) => {
  worker.postMessage(input);
};

type UserOptions = {
  /** Whether to automatically format the input on blur. */
  autoFormat: boolean;
  /** Whether to automatically send the input to Puzlink.link() on type. */
  autoSend: boolean;
};

type State = {
  /** The ID of the current Puzlink.link() call. */
  inputID: number | null;
  /** The (unparsed) input to Puzlink.link(). */
  linkInput: string;
  /** Options for Puzlink.link(). */
  linkOptions: Pick<LinkOptions, "minFeatureRatio" | "ordered">;

  userOptions: UserOptions;

  /** Whether the Puzlink worker has been initialized. */
  puzlinkInited: boolean;
  /** Whether the Puzlink worker is ready. */
  puzlinkReady: boolean;

  /** The parsed input corresponding to the last Puzlink.link() call. */
  lastLinkInput: string[] | null;
  /** The input ID corresponding to the outputLinks. */
  outputInputID: number | null;
  /** The output links from the (possibly last) Puzlink.link() call. */
  outputLinks: Link[];

  /** Sets the link input. */
  setLinkInput: (value: string) => void;
  /** Sets the link options. */
  setLinkOptions: (
    value: Pick<LinkOptions, "minFeatureRatio" | "ordered">,
  ) => void;
  /** Sets the user options. */
  setUserOptions: (value: UserOptions) => void;
  /** Parses the input and sends it to the Puzlink worker, if different. */
  sendInput: () => void;
  /** Initializes the Puzlink worker. */
  initWorker: () => void;
};

const stateCreator: StateCreator<State> = (set, get) => ({
  inputID: null,
  linkInput: randomExample(),
  linkOptions: {},

  userOptions: {
    autoFormat: false,
    autoSend: true,
  },

  puzlinkInited: false,
  puzlinkReady: false,

  lastLinkInput: null,
  outputInputID: null,
  outputLinks: [],

  setLinkInput: (value) => {
    set({ linkInput: value });
  },
  setLinkOptions: (value) => {
    if (shallowEqual(get().linkOptions, value)) {
      return;
    }
    set({ lastLinkInput: null, linkOptions: value });
  },
  setUserOptions: (value) => {
    if (shallowEqual(get().userOptions, value)) {
      return;
    }
    set({ lastLinkInput: null, userOptions: value });
  },
  sendInput: () => {
    if (!get().puzlinkReady) {
      return;
    }

    const parsed = Puzlink.parse(get().linkInput);
    if (shallowEqual(get().lastLinkInput, parsed)) {
      return;
    }

    const newInputID = (get().inputID ?? 0) + 1;

    send({
      type: "input",
      inputID: newInputID,
      input: parsed,
      options: get().linkOptions,
    });
    set({
      lastLinkInput: parsed,
      inputID: newInputID,
      outputInputID: null,
    });
  },
  initWorker: () => {
    if (get().puzlinkInited) {
      return;
    }
    set({ puzlinkInited: true });

    worker.addEventListener("message", ({ data }: { data: WorkerOutput }) => {
      if (data.type === "ready") {
        set({
          puzlinkReady: true,
        });
        get().sendInput();
      } else if (data.type === "output:link") {
        set({
          outputInputID: data.inputID,
          outputLinks: (data.inputID !== get().outputInputID
            ? data.chunk
            : get().outputLinks.concat(data.chunk)
          ).sort((a, b) => b.score - a.score),
        });
      } else if (data.type === "output:end") {
        set({
          inputID: null,
        });
      } else {
        data.type satisfies "error";
        console.error("Puzlink worker error:", data.error);
      }
    });

    send({ type: "download" });
  },
});

export const useStore = create(
  persist(stateCreator, {
    name: "puzlink.js",
    partialize: (state) => ({
      linkOptions: state.linkOptions,
      userOptions: state.userOptions,
    }),
  }),
);
