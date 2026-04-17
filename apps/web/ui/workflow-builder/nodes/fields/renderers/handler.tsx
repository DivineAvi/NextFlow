import type { CSSProperties } from "react";
import { useState } from "react";
import { Position, Handle, HandleType } from "reactflow";
import { Tooltip, TooltipTrigger, TooltipContent,} from "@nextflow/ui";
import { accentHandleHex, type AccentTone } from "../../../tokens/tones";
export type HandlerDataType = "string" | "number" | "boolean" | "array" | "object";
type TooltipSide = "left" | "right" | "top" | "bottom";

/** Compose React Flow centering with scale (Tailwind `scale-*` alone overrides `translate` and misaligns). */
function handleTransform(position: Position, scale: number): string {
    switch (position) {
        case Position.Left:
            return `translate(0, -50%) scale(${scale})`;
        case Position.Right:
            return `translate(0, -50%) scale(${scale})`;
        case Position.Top:
            return `translate(-50%, 0) scale(${scale})`;
        case Position.Bottom:
            return `translate(-50%, 0) scale(${scale})`;
        default:
            return `scale(${scale})`;
    }
}

const PositionTooltipRecord: Record<Position, TooltipSide> = {
    [Position.Left]: "left",
    [Position.Right]: "right",
    [Position.Top]: "top",
    [Position.Bottom]: "bottom",
};
export interface HandlerRendererProps {
    id: string;
    handleType: HandleType;
    handlerDataType: HandlerDataType;
    label?: string;
    description?: string;
    required?: boolean;
    tone?: AccentTone;
    position?: Position;
    /** Edge length (px) of the invisible square interaction target around the handle (pseudo-element, not padding). */
    hitSlopPx?: number;
    /** Scale multiplier while hovered (1 = no growth). */
    hoverScale?: number;
}

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

    return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Handle
                        type={handleType}
                        position={position}
                        id={id}
                        style={
                            {   
                                background: accentHandleHex[tone],
                                borderColor: accentHandleHex[tone],
                                transform: handleTransform(position, scale),
                                boxShadow: `0 0 0 1.5px ${accentHandleHex[tone]}33`,
                                "--handler-hit-slop": `${hitSlopPx}px`,
                            } as CSSProperties
                        }
                        className="!pointer-events-auto transition-transform duration-200 ease-out before:pointer-events-auto before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:z-0 before:size-[var(--handler-hit-slop)] before:-translate-x-1/2 before:-translate-y-1/2"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    />

                </TooltipTrigger>
                <TooltipContent side={PositionTooltipRecord[position]}>
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
    );
}
