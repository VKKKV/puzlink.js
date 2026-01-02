import * as Puzlink from "puzlink";
import { create, type StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { shallow as shallowEqual } from "zustand/shallow";
import { examples } from "./examples";
import type { WorkerInput, WorkerOutput } from "./worker";
import PuzlinkWorker from "./worker?worker";

type LinkOptions = Pick<
  Puzlink.LinkOptions,
  "maxFeatureRatio" | "minFeatureRatio" | "ordered"
>;

const initialLinkInput = (): {
  linkInput: string;
  lastExampleIndex: number;
} => {
  const parsed = Puzlink.parse(
    new URLSearchParams(new URL(window.location.href).search).get("input") ??
      "",
  );
  const lastExampleIndex = Math.floor(Math.random() * examples.length);
  const linkInput =
    parsed.length > 0 ? parsed.join("\n") : examples[lastExampleIndex].slugs;
  return {
    linkInput,
    lastExampleIndex,
  };
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
  /** Last input ID used. */
  lastInputID: number;
  /** The (unparsed) input to Puzlink.link(). */
  linkInput: string;
  /** Options for Puzlink.link(). */
  linkOptions: LinkOptions;
  /** The index of the current example, if any. */
  exampleIndex: number | null;
  /** The index of the last example. */
  lastExampleIndex: number;

  userOptions: UserOptions;

  /** Whether the Puzlink worker has been initialized. */
  puzlinkInited: boolean;
  /** Whether the Puzlink worker is ready. */
  puzlinkReady: boolean;

  /** The parsed input corresponding to the last Puzlink.link() call. */
  lastLinkInput: string[] | null;
  /** The input ID corresponding to the outputLinks. */
  outputInputID: number;
  /** The output links from the (possibly last) Puzlink.link() call. */
  outputLinks: Puzlink.Link[];

  /** Sets the link input. */
  setLinkInput: (value: string) => void;
  /** Formats the link input. */
  formatLinkInput: () => void;
  /** Sets the link input to an example. */
  setExample: (index: number | null | "last") => void;
  /** Get a link for sharing the current input. */
  getShareLink: () => string;
  /** Sets the link options. */
  setLinkOptions: (value: LinkOptions) => void;
  /** Sets the user options. */
  setUserOptions: (value: UserOptions) => void;
  /** Parses the input and sends it to the Puzlink worker, if different. */
  sendInput: (force?: boolean) => void;
  /** Initializes the Puzlink worker. */
  initWorker: () => void;
};

const stateCreator: StateCreator<State> = (set, get) => ({
  inputID: null,
  lastInputID: -1,
  ...initialLinkInput(),
  linkOptions: {},
  exampleIndex: null,

  userOptions: {
    autoFormat: false,
    autoSend: true,
    capitalizeSlugs: false,
    zeroIndex: false,
  },

  puzlinkInited: false,
  puzlinkReady: false,

  lastLinkInput: null,
  outputInputID: -1,
  outputLinks: [],

  setLinkInput: (value) => {
    set({
      linkInput: value,
      exampleIndex: null,
    });
    const url = new URL(window.location.href);
    if (url.searchParams.has("input")) {
      url.searchParams.delete("input");
      window.history.pushState(null, "", url.href);
    }
  },
  setExample: (index) => {
    if (index === null) {
      set({
        exampleIndex: null,
        lastExampleIndex: get().exampleIndex ?? 0,
      });
      return;
    }
    const wrapped =
      index === "last"
        ? get().lastExampleIndex
        : (index + examples.length) % examples.length;
    set({
      linkInput: examples[wrapped].slugs,
      exampleIndex: wrapped,
    });
    const url = new URL(window.location.href);
    if (url.searchParams.has("input")) {
      url.searchParams.delete("input");
      window.history.pushState(null, "", url.href);
    }
    get().sendInput();
  },
  formatLinkInput: () => {
    const parsed = Puzlink.parse(get().linkInput).join("\n");
    set({
      linkInput: get().userOptions.capitalizeSlugs
        ? parsed.toUpperCase()
        : parsed,
    });
  },
  getShareLink: () => {
    const input = Puzlink.parse(get().linkInput).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("input", input);
    window.history.pushState(null, "", url.href);
    return url.href;
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
  sendInput: (force?: boolean) => {
    if (!get().puzlinkReady) {
      return;
    }

    const parsed = Puzlink.parse(get().linkInput);
    if (!force && shallowEqual(get().lastLinkInput, parsed)) {
      return;
    }

    const newInputID = get().lastInputID + 1;

    send({
      type: "input",
      inputID: newInputID,
      input: parsed,
      options: get().linkOptions,
    });
    set({
      lastLinkInput: parsed,
      inputID: newInputID,
      lastInputID: newInputID,
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
        if (data.inputID < get().outputInputID) {
          // old; ignore
        } else if (data.inputID === get().outputInputID) {
          // current; append
          set({
            outputInputID: data.inputID,
            outputLinks: get()
              .outputLinks.concat(data.chunk)
              .sort((a, b) => b.score - a.score),
          });
        } else {
          // new; replace
          set({
            outputInputID: data.inputID,
            outputLinks: data.chunk.sort((a, b) => b.score - a.score),
          });
        }
      } else if (data.type === "output:end") {
        if (data.inputID === get().inputID) {
          set({
            inputID: null,
          });
        }
      } else {
        data.type satisfies "error";
        console.error("Puzlink worker error:", data.error);
      }
    });

    send({ type: "download" });
  },
});

export const useStore = create<State>()(
  // @ts-expect-error - mixed middlewares
  import.meta.env.PROD
    ? persist(stateCreator, {
        name: "puzlink.js",
        partialize: (state) => ({
          linkOptions: state.linkOptions,
          userOptions: state.userOptions,
        }),
      })
    : devtools(
        persist(stateCreator, {
          name: "puzlink.js",
          partialize: (state) => ({
            linkOptions: state.linkOptions,
            userOptions: state.userOptions,
          }),
        }),
      ),
);
