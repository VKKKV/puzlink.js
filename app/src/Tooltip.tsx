import { useId, type ReactNode } from "react";
import "./Tooltip.css";

export type TooltipPosition =
  | "top"
  | "top-right"
  | "top-left"
  | "right"
  | "bottom"
  | "bottom-right"
  | "bottom-left"
  | "left";

export function Tooltip({
  children,
  content,
  position = "top",
}: {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
}) {
  const id = useId();

  return (
    <div aria-describedby={id}>
      {children}
      <div className={`tooltip-${position}`} role="tooltip" id={id}>
        {content}
      </div>
    </div>
  );
}
