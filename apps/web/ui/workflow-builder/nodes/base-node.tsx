import { ComponentType, memo, SVGProps, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles, X } from "lucide-react";
import type { NodeProps } from "reactflow";
import { getToneColor } from "@/ui/workflow-builder/tokens/data-type-colors";

export type BaseNodeTone = "yellow" | "blue" | "green" | "red" | "orange" | "purple" | "pink" | "gray" | "brown" | "black" | "white";
export type NODE_STATUS = "RUNNING" | "COMPLETED" | "FAILED" | "PENDING";

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
  preview?: React.ReactNode;
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
  id,
  data,
  children,
  preview,
  selected,
  icon,
  Width,
  Height,
  minWidth,
  minHeight,
  tone = "blue",
}: BaseNodeProps) {
  const Icon = icon as ComponentType<SVGProps<SVGSVGElement>>;
  const [label, setLabel] = useState<string>(data.label);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  useEffect(() => {
    if (data.status === "FAILED" && data.error) {
      setIsErrorVisible(true);
    }
  }, [data.error]);
  const nodeError: string | undefined = data.error;

  return (
    <div
      style={{ minWidth, minHeight, width: Width, height: Height }}
      className="group flex flex-col"
    >


      {/* Label row */}
      <div className="flex items-center gap-1 px-1/2 w-fit h-5">
        {Icon && <Icon className="size-3 shrink-0" aria-hidden />}
        <div className="relative h-full">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="nodrag nopan absolute z-10 left-0 top-1/2 -translate-y-1/2 outline-none text-xs text-[var(--wf-text-muted)] px-1 py-0.5 rounded-md cursor-text tracking-tight"
          />
        </div>
      </div>

{/* Error banner — shown above the node body when execution fails */}
{data.status === "FAILED" && nodeError && (
  <div className={`mb-1 flex items-start gap-1.5 rounded-md bg-[#4d3318] px-2 py-1.5 text-[10px] text-[#e7c194] leading-snug max-w-[240px] ${isErrorVisible ? "block" : "hidden"}`}>
    <Sparkles size={10} className="shrink-0 mt-0.5 text-[#e7c194]" />
    
    {/* Added flex-1 to push the close button to the far right */}
    <span className="line-clamp-3 break-words flex-1" title={nodeError}>
      {nodeError}
    </span>

    {/* Close Button */}
    <button 
      onClick={() => {
        setIsErrorVisible(false);
      }}
      className="shrink-0 mt-0.5 text-[#e7c194]/70 hover:text-[#e7c194] transition-colors"
      aria-label="Close error banner"
    >
      <X size={10} />
    </button>
  </div>
)}

      {/* Body */}
      <div
        className={`rounded-[12px] border-2 bg-[var(--wf-bg-node)] text-[var(--wf-text-muted)] flex-1 transition-all duration-300 ${
          data.status === "RUNNING"
            ? getToneColor(tone).border + " !border-1 animate-pulse-shadow"
            : data.status === "COMPLETED"
              ? getToneColor(tone).border
              : data.status === "FAILED"
                ? "border-red-500"
                : selected
                  ? getToneColor(tone).border
                  : "border-[var(--wf-bg-node)]"
        }`}
        style={
          {
            "--pulse-shadow-color": getToneColor(tone).pulseRgba,
          } as React.CSSProperties
        }
      >
        {preview && (
          <div className="overflow-hidden rounded-t-[10px] border-b border-[var(--wf-border)]">
            {preview}
          </div>
        )}
        <div className="flex flex-col flex-1 pb-4">{children}</div>
      </div>
    </div>
  );
});
