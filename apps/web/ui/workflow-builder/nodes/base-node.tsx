import { ComponentType, memo, SVGProps, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { NodeProps } from "reactflow";
import { rgba } from "polished";

export type BaseNodeTone = "yellow" | "blue" | "green" | "red" | "orange" | "purple" | "pink" | "gray" | "brown" | "black" | "white";
export type NODE_STATUS = "RUNNING" | "COMPLETED" | "FAILED" | "PENDING";

const BASE_NODE_TONES: Record<BaseNodeTone, Record<string, string>> = {
  yellow: {
    color: "#fcc804",
    border: "border-yellow-500",
    shadow: "shadow-[0_0_30px_rgba(234,179,8,0.35)]",
  },
    blue: {
    color: "#3b82f6",
    border: "border-blue-500",
    shadow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
  },
  green: {
    color: "#22c55e",
    border: "border-green-500",
    shadow: "shadow-[0_0_15px_rgba(22,163,74,0.5)]",
  },
  red: {
    color: "#ef4444",
    border: "border-red-500",
    shadow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]",
  },
  orange: {
    color: "#f97316",
    border: "border-orange-500",
    shadow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  },
  purple: {
    color: "#a855f7",
    border: "border-purple-500",
    shadow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
  },
  pink: {
    color: "#f472b6",
    border: "border-pink-500",
    shadow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
  },
  gray: {
    color: "#71717a",
    border: "border-gray-500",
    shadow: "shadow-[0_0_15px_rgba(107,114,128,0.5)]",
  },
  brown: {
    color: "#a855f7",
    border: "border-brown-500",
    shadow: "shadow-[0_0_15px_rgba(163,78,52,0.5)]",
  },
  black: {
    color: "#000000",
    border: "border-black-500",
    shadow: "shadow-[0_0_15px_rgba(0,0,0,0.5)]",
  },
  white: {
    color: "#ffffff",
    border: "border-white-500",
    shadow: "shadow-[0_0_15px_rgba(255,255,255,0.5)]",
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StyleProps {
  borderColor?: string;
  selectedBorderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  borderWidth?: string;
}

export interface BaseNodeProps extends NodeProps, StyleProps {
  children?: React.ReactNode;
  icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  style?: React.CSSProperties;
  Width?: string;
  Height?: string;
  minWidth?: string;
  minHeight?: string;
  tone?: BaseNodeTone;
}

// ---------------------------------------------------------------------------
// Component
// BaseNode is the visual shell for every node in the workflow canvas.
// ---------------------------------------------------------------------------

export const BaseNode = memo(function BaseNode({
  data,
  children,
  selected,
  icon,
  Width ,
  Height ,
  minWidth ,
  minHeight,
  tone = "blue",
}: BaseNodeProps) {
  const Icon = icon as ComponentType<SVGProps<SVGSVGElement>>;
  const [label, setLabel] = useState<string>(data.label);
  return (
    <div style={{ minWidth: minWidth, minHeight: minHeight , width: Width, height: Height }} className={`flex flex-col`}>
      {/* Header */}
      <div className="flex items-center gap-1 px-1/2 w-fit h-5">
        {Icon && <Icon className="size-3 shrink-0" aria-hidden />}
        <div className="relative h-full">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`nodrag nopan absolute z-10 left-0 top-1/2 -translate-y-1/2 outline-none text-xs text-[#737373] px-1 py-0.5 rounded-md cursor-text tracking-tight`}
          />
        </div>
      </div>

      {/* Body */}
      <div
        className={`rounded-[12px] border-2 bg-[#262626] text-[#737373] flex-1 transition-all duration-300 ${
          data.status === "RUNNING"
            ? BASE_NODE_TONES[tone].border + " !border-1 " + "animate-pulse-shadow"
            : data.status === "COMPLETED"
              ? BASE_NODE_TONES[tone].border
              : data.status === "FAILED"
                ? "border-red-500"
                : selected
                  ? BASE_NODE_TONES[tone].border
                  : "border-zinc-800"
        }`
      }
      style={{ "--pulse-shadow-color": rgba(BASE_NODE_TONES[tone].color, 0.4) as string} as React.CSSProperties}
      >
        <div className="flex flex-col flex-1 pb-4">{children}</div>
      </div>
    </div>
  );
});
