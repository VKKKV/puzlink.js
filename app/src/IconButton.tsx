import type { HTMLProps } from "react";
import { Tooltip, type TooltipPosition } from "./Tooltip";

export function IconButton({
  label,
  position,
  ...rest
}: {
  label: string;
  position?: TooltipPosition;
} & HTMLProps<HTMLButtonElement>) {
  return (
    <Tooltip content={label} position={position}>
      {/* @ts-expect-error - react typing is too strict? */}
      <button {...rest} />
    </Tooltip>
  );
}
