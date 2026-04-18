import type { CSSProperties } from "react";
import { useState } from "react";
import { Handle, Position, type HandleType } from "reactflow";
import { Tooltip, TooltipContent, TooltipTrigger } from "@nextflow/ui";
import { accentHandleHex, type AccentTone } from "@/tokens/tones";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HandlerDataType = "string" | "number" | "boolean" | "array" | "object";
type TooltipSide = "left" | "right" | "top" | "bottom";

export interface HandlerRendererProps {
  id: string;
  handleType: HandleType;
  handlerDataType: HandlerDataType;
  label?: string;
  description?: string;
  required?: boolean;
  tone?: AccentTone;
  position?: Position;
  /** Edge length (px) of the invisible hit-slop square around the handle. */
  hitSlopPx?: number;
  /** Scale multiplier while hovered (1 = no growth). */
  hoverScale?: number;
}

// ---------------------------------------------------------------------------
// Helpers — module-scope so they are not recreated on every render.
// ---------------------------------------------------------------------------

/**
 * Compose React Flow's centering translate with a scale so they don't
 * cancel each other out.
 */
function handleTransform(position: Position, scale: number): string {
  const isHorizontal = position === Position.Left || position === Position.Right;
  return isHorizontal
    ? `translate(0, -50%) scale(${scale})`
    : `translate(-50%, 0) scale(${scale})`;
}

const POSITION_TO_TOOLTIP_SIDE: Record<Position, TooltipSide> = {
  [Position.Left]: "left",
  [Position.Right]: "right",
  [Position.Top]: "top",
  [Position.Bottom]: "bottom",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HandlerRenderer({
  id,
  handleType,
  description,
  tone = "yellow",
  position = Position.Left,
  hitSlopPx = 20,
  hoverScale = 2,
}: HandlerRendererProps) {
  const [hovered, setHovered] = useState(false);
  const scale = hovered ? hoverScale : 1.5;
  const color = accentHandleHex[tone];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Handle
          type={handleType}
          position={position}
          id={id}
          style={
            {
              background: color,
              borderColor: color,
              transform: handleTransform(position, scale),
              boxShadow: `0 0 0 1.5px ${color}33`,
              "--handler-hit-slop": `${hitSlopPx}px`,
            } as CSSProperties
          }
          className="!pointer-events-auto transition-transform duration-200 ease-out before:pointer-events-auto before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:z-0 before:size-[var(--handler-hit-slop)] before:-translate-x-1/2 before:-translate-y-1/2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      </TooltipTrigger>
      <TooltipContent side={POSITION_TO_TOOLTIP_SIDE[position]}>
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
