import * as Icons from "lucide-react";
import * as Puzlink from "puzlink";
import type { JSX } from "react";
import { Fragment, useRef, useState } from "react";
import { CopyButton } from "./CopyButton";
import { IconButton } from "./IconButton";
import "./LinkDisplay.css";
import { useStore } from "./store";

const ordinal = new Intl.PluralRules("en", { type: "ordinal" });

type RenderOptions = {
  capitalizeSlugs: boolean;
  collapse: boolean;
  zeroIndex: boolean;
};

const sheetsBaseSpan = (family: "mono" | "sans") => {
  const fontFamily = `&quot;IBM Plex ${family === "mono" ? "Mono" : "Sans"}&quot;,Arial`;
  const pre = `<span style="font-family:${fontFamily}">`;
  const post = "</span>";
  return (text: string) => pre + text + post;
};
const sheetsSpan = {
  mono: sheetsBaseSpan("mono"),
  sans: sheetsBaseSpan("sans"),
};

/**
 * The JSX is what gets rendered in react; sheets/plain are what get copied
 * to clipboard. The sheets part ends up in text/html, and should have the
 * inline styles so that it can be pasted into Google Sheets. I think GSheets
 * also requires the text/plain part to match the text/html?
 */
const render = Puzlink.makeRenderer<
  { jsx: JSX.Element; sheets: string; plain: string },
  { jsx: JSX.Element[]; collapsible: boolean; sheets: string; plain: string },
  RenderOptions
>(
  { capitalizeSlugs: false, collapse: true, zeroIndex: false },
  {
    fraction(numerator, denominator) {
      const plain = `${numerator.toString()}/${denominator.toString()}`;
      return {
        jsx: (
          <span className="fraction">
            <span className="numerator">{numerator}</span>/
            <span className="denominator">{denominator}</span>
          </span>
        ),
        sheets: sheetsSpan.sans(plain),
        plain,
      };
    },
    highlight(slug, indices, options) {
      const jsxLetters = Array.from(slug, (c, i) => {
        return (
          <span
            key={i}
            className={indices.includes(i) ? "highlight-letter" : undefined}
          >
            {options.capitalizeSlugs ? c.toUpperCase() : c}
          </span>
        );
      });
      const plain = Array.from(slug, (c, i) => {
        return options.capitalizeSlugs || indices.includes(i)
          ? c.toUpperCase()
          : c;
      }).join("");

      return {
        jsx: <span className="highlight">{jsxLetters}</span>,
        sheets: sheetsSpan.mono(plain),
        plain,
      };
    },
    indices(indices, options) {
      const plain = (
        options.zeroIndex ? indices : indices.map((i) => i + 1)
      ).join(", ");

      return {
        jsx: <span className="indices">{plain}</span>,
        sheets: sheetsSpan.sans(plain),
        plain,
      };
    },
    join(items) {
      return {
        jsx: (
          <Fragment>
            {items.map(({ jsx }, i) => (
              <Fragment key={i}>{jsx} </Fragment>
            ))}
          </Fragment>
        ),
        sheets: items.map(({ sheets }) => sheets).join(""),
        plain: items.map(({ plain }) => plain).join(""),
      };
    },
    ordinal(rawRank, options) {
      const rank = options.zeroIndex || rawRank < 0 ? rawRank : rawRank + 1;
      const count = ordinal.select(rank);
      const suffix =
        count === "one"
          ? "st"
          : count === "two"
            ? "nd"
            : count === "few"
              ? "rd"
              : "th";
      const plain = `${rank.toString()}${suffix}`;
      return {
        jsx: (
          <span className="ordinal">
            {rank.toString()}
            <sup>{suffix}</sup>
          </span>
        ),
        sheets: sheetsSpan.sans(plain),
        plain,
      };
    },
    slug(count, slug, options) {
      const plain = options.capitalizeSlugs ? slug.toUpperCase() : slug;
      return {
        jsx: (
          <Fragment>
            <span className="slug">{plain}</span>
            {count !== 1 ? <span className="slug-count">s</span> : null}
          </Fragment>
        ),
        sheets: sheetsSpan.mono(plain),
        plain,
      };
    },
    text(text) {
      return {
        jsx: <span className="text">{text}</span>,
        sheets: sheetsSpan.sans(text),
        plain: text,
      };
    },
    times(count) {
      const plain =
        count === 1
          ? "once"
          : count === 2
            ? "twice"
            : count === 3
              ? "thrice"
              : `${count.toString()} times`;
      return {
        jsx: <span className="times">{plain}</span>,
        sheets: sheetsSpan.sans(plain),
        plain,
      };
    },
  },
  (table, options) => {
    const collapsible = table.rows.some((row) =>
      row.cells.some((cell) => cell.collapsible),
    );
    return {
      collapsible,
      jsx: table.rows.map((row, r) => {
        const firstCollapsed = row.cells.findIndex((cell) => cell.collapsible);
        return (
          <tr key={r}>
            {row.cells.map((cell, c) => {
              if (
                options.collapse &&
                firstCollapsed !== -1 &&
                c >= firstCollapsed
              ) {
                return c === firstCollapsed ? <td key={c}>…</td> : null;
              }
              return <td key={c}>{cell.rendered.jsx}</td>;
            })}
          </tr>
        );
      }),
      sheets: [
        "<google-sheets-html-origin>",
        '<table data-sheets-root="1" data-sheets-baot="1">',
        "<tbody>",
        ...table.rows.map((row) => {
          return `<tr>${row.cells
            .map((cell) => `<td>${cell.rendered.sheets}</td>`)
            .join("")}</tr>`;
        }),
        "</tbody>",
        "</table>",
        "</google-sheets-html-origin>",
      ].join(""),
      plain: table.rows
        .map((row) => {
          return row.cells.map((cell) => cell.rendered.plain).join("\t");
        })
        .join("\n"),
    };
  },
);

export function LinkDisplay({
  link,
  rank,
}: {
  link: Puzlink.Link;
  rank: number;
}) {
  const [collapse, setCollapse] = useState(true);
  const userOptions = useStore((state) => state.userOptions);
  const renderOptions = { ...userOptions, collapse };
  const rendered = link.jsonDescription
    ? render(link.jsonDescription, renderOptions)
    : null;
  const tableRef = useRef<HTMLTableElement>(null);

  const hasContent = !!rendered?.plain.trim();

  return (
    <details
      className={`link ${hasContent ? "" : "no-content"}`}
      open={rank <= 4 && hasContent}
    >
      <summary>
        <div className="link-summary">
          <span className="link-name">
            {link.jsonName
              ? render(link.jsonName, renderOptions).jsx
              : link.name}
          </span>
          <span className="link-score">{link.score.toFixed(1)}</span>
        </div>
      </summary>
      {hasContent && (
        <div className="link-description">
          <div className="link-buttons">
            <CopyButton
              content={() =>
                rendered &&
                new ClipboardItem({
                  "text/html": rendered.sheets,
                  "text/plain": rendered.plain,
                })
              }
            >
              {({ justCopied, onClick }) => (
                <IconButton
                  label={justCopied ? "Copied!" : "Copy"}
                  onClick={onClick}
                  position="left"
                >
                  {justCopied ? <Icons.Check /> : <Icons.Clipboard />}
                </IconButton>
              )}
            </CopyButton>
            {rendered!.collapsible && (
              <IconButton
                label={collapse ? "Expand" : "Collapse"}
                onClick={() => {
                  setCollapse(!collapse);
                }}
                position="left"
              >
                {collapse ? (
                  <Icons.ChevronsLeftRight />
                ) : (
                  <Icons.ChevronsRightLeft />
                )}
              </IconButton>
            )}
          </div>
          <div className="link-table-wrapper">
            <table className="link-table" ref={tableRef}>
              <tbody>{rendered!.jsx}</tbody>
            </table>
          </div>
        </div>
      )}
    </details>
  );
}
