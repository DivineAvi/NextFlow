import { memo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { NodeProps } from "reactflow";

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
  icon?: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: string;
  minHeight?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BaseNode is the visual shell for every node in the workflow canvas.
 *
 * `memo` prevents the node from re-rendering on canvas pan/zoom/selection
 * of other nodes — critical for performance with many nodes on screen.
 */
export const BaseNode = memo(function BaseNode({
  data,
  children,
  selected,
  icon,
  minWidth = "min-w-[180px]",
  minHeight = "min-h-[100px]",
  borderColor = "border-zinc-800",
  selectedBorderColor = "border-blue-500",
  backgroundColor = "bg-[#262626]",
  textColor = "text-[#737373]",
  borderRadius = "rounded-[12px]",
  borderWidth = "border-2",
}: BaseNodeProps) {
  const Icon = icon ?? Sparkles;
  const [label, setLabel] = useState<string>(data.label);

  return (
    <div className={`flex flex-col ${minWidth} ${minHeight}`}>
      {/* Header */}
      <div className="flex items-center gap-1 px-1/2 w-fit h-5">
        <Icon size={16} />
        <div className="relative h-full">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`nodrag nopan absolute z-10 left-0 top-1/2 -translate-y-1/2 outline-none text-xs ${textColor} px-1 py-0.5 rounded-md cursor-text tracking-tight`}
          />
        </div>
      </div>

      {/* Body */}
      <div
        className={`${borderRadius} ${borderWidth} ${backgroundColor} ${textColor} w-full h-full flex-1 transition-all duration-300 ${selected ? selectedBorderColor : borderColor}`}
      >
        <div className="flex flex-col flex-1 w-full h-full pb-4">{children}</div>
      </div>
    </div>
  );
});
