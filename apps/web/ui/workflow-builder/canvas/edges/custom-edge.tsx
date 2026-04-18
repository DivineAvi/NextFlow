"use client";

import { useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "reactflow";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Tone system for edges — maps to the AccentTone palette
// ---------------------------------------------------------------------------

export type EdgeTone = "yellow" | "orange" | "blue" | "zinc" | "green";

export interface CustomEdgeData {
  tone?: EdgeTone;
  label?: string;
}

const EDGE_COLORS: Record<EdgeTone, { stroke: string; glow: string; badge: string }> = {
  yellow: {
    stroke: "#fcc804",
    glow: "drop-shadow(0 0 6px #fcc80488)",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  orange: {
    stroke: "#f97316",
    glow: "drop-shadow(0 0 6px #f9731688)",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  blue: {
    stroke: "#3b82f6",
    glow: "drop-shadow(0 0 6px #3b82f688)",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  zinc: {
    stroke: "#71717a",
    glow: "drop-shadow(0 0 4px #71717a66)",
    badge: "bg-zinc-700/50 text-zinc-400 border-zinc-600/40",
  },
  green: {
    stroke: "#22c55e",
    glow: "drop-shadow(0 0 6px #22c55e88)",
    badge: "bg-green-500/20 text-green-300 border-green-500/40",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CustomEdgeData>) {
  const { setEdges } = useReactFlow();
  const tone: EdgeTone = data?.tone ?? "zinc";
  const label = data?.label;
  const { stroke, glow, badge } = EDGE_COLORS[tone];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useCallback(() => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
  }, [id, setEdges]);

  return (
    <>
      {/* Glow layer — slightly wider, blurred */}
      <path
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={selected ? 5 : 3}
        strokeOpacity={0.2}
        className="hover:stroke-opacity-100"
        style={{ filter: glow, pointerEvents: "none", animation: "edge-wave 2s infinite alternate" }}
      />


      {/* Label + delete button — rendered in DOM (not SVG) via EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1"
        >

          {/* Delete button — visible on hover or selection */}
          <button
            onClick={deleteEdge}
            title="Delete edge"
            className={`
              flex h-4 w-4 items-center justify-center rounded-full border
              bg-zinc-900 text-zinc-400 border-zinc-700 transition-all duration-150
              hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-400 hover:opacity-100
              ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
