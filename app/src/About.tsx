import * as Icons from "lucide-react";
import { use } from "react";
import "./About.css";
import { examples } from "./examples";
import { IconButton } from "./IconButton";
import { Modal } from "./Modal";
import { ModalContext } from "./modalContext";
import { useStore } from "./store";

function AboutContent() {
  const modalContext = use(ModalContext);
  const setExample = useStore((state) => state.setExample);

  return (
    <>
      <h2>About</h2>

      <p>
        <b>puzlink.js</b> is a tool to find patterns among sets of words, like:
      </p>

      <ul>
        {examples.slice(0, 3).map(({ description }, i) => {
          return (
            <li>
              having{" "}
              <button
                className="button-link"
                onClick={() => {
                  setExample(i);
                }}
              >
                {description}
              </button>
              {","}
            </li>
          );
        })}
      </ul>

      <p>and much more.</p>

      <p>
        Inspired by Christopher Night’s <a href="https://puz.link">puzlink</a>,
        Robin Deits’s{" "}
        <a href="https://github.com/rdeits/Collective.jl">Collective.jl</a>, and
        Matt Gruskin’s{" "}
        <a href="https://github.com/obijywk/Collective.jl">
          Collective.jl fork
        </a>
        . Built with data from Robyn Speer’s{" "}
        <a href="https://github.com/rspeer/solvertools">solvertools</a> and from{" "}
        <a href="https://wordnet.princeton.edu/">WordNet 3.1</a>.
      </p>

      <div className="controls">
        <span className="credits">
          by <a href="https://cjquines.com">CJ Quines</a> · source on{" "}
          <a href="https://github.com/cjquines/puzlink.js">Github</a>
        </span>
        <div className="controls-spacer" />
        <button
          onClick={() => {
            modalContext.getRef()?.close();
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}

export function About() {
  return (
    <Modal
      className="about"
      trigger={(props) => (
        <IconButton
          className="secondary"
          label="About"
          onClick={props.open}
          position="bottom"
        >
          <Icons.Info />
        </IconButton>
      )}
    >
      <AboutContent />
    </Modal>
  );
}
