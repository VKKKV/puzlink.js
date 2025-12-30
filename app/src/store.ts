import type { Link, LinkOptions } from "puzlink";
import * as Puzlink from "puzlink";
import { create, type StateCreator } from "zustand";
import { shallow as shallowEqual } from "zustand/shallow";
import type { WorkerInput, WorkerOutput } from "./worker";
import PuzlinkWorker from "./worker?worker";
import { persist } from "zustand/middleware";

// TODO: right now we stole these examples directly from puz.link; we should format them with newlines and spaces to make clear that it like, works
const examples = [
  // denizen of the deep, mitmh 2015
  "press hill apes nerds times ordinary mill",
  // bubbles, mitmh 2015
  "chokechain hourhand lithograph shibboleth shortsighted thermophile",
  // 10000 puzzle pyramid, mitmh 2015
  "amontillados blooming calcutta dilemma piazzas squareness",
  // 10000 puzzle pyramid, mitmh 2015
  "antithetic crosshatches gaggle nonconsenting pneumococcal prestidigitation smogless trunnions",
  // venntersections, mitmh 2014
  "grimaced formally questionable discouraged communicated chysalis saccharin",
  // venntersections, mitmh 2014
  "thumbtacks monologue frigidities statuesque testimony satirizing flawed",
  // finsey gillhone, mitmh 2015
  "arcdetriomphescalemodel uvwavedetector gearstick firstprize thiefgamemanual monopoly tuvalutravelguide",
  // finsey gillhone, mitmh 2015
  "rib node emission lamp ward cent cam",
  // pod of dolphins meta, mitmh 2015
  "citygates impulsive clickspam baptistry leviathan policecar coupdetat sforzando cartwheel",
  // venntersections, mitmh 2014
  "lowered levitate inanimate paradise leveraged sizes tuxedo",
];

const initialLinkInput = (): string => {
  const parsed = Puzlink.parse(
    new URLSearchParams(new URL(window.location.href).search).get("input") ??
      "",
  );
  return parsed.length > 0
    ? parsed.join("\n")
    : examples[Math.floor(Math.random() * examples.length)]
        .split(" ")
        .join("\n");
};

const worker = new PuzlinkWorker();
const send = (input: WorkerInput) => {
  worker.postMessage(input);
};

type UserOptions = {
  /** Whether to automatically format the input on blur. */
  autoFormat: boolean;
  /** Whether to automatically send the input to Puzlink.link() on type. */
  autoSend: boolean;
  /** Whether to capitalize slugs in the interface. */
  capitalizeSlugs: boolean;
  /** Whether to zero-index indices in the interface. */
  zeroIndex: boolean;
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
  linkInput: initialLinkInput(),
  linkOptions: {},

  userOptions: {
    autoFormat: false,
    autoSend: true,
    capitalizeSlugs: false,
    zeroIndex: false,
  },

  puzlinkInited: false,
  puzlinkReady: false,

  lastLinkInput: null,
  outputInputID: null,
  outputLinks: [],

  setLinkInput: (value) => {
    set({ linkInput: value });

    const url = new URL(window.location.href);
    if (url.searchParams.has("input")) {
      url.searchParams.delete("input");
      window.history.pushState(null, "", url.href);
    }
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
