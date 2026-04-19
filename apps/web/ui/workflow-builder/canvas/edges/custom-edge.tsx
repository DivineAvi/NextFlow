import { useCallback, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "reactflow";
import { X } from "lucide-react";
import { EdgeTone } from "@/ui/tones/tones";
import { EDGE_COLORS } from "@/ui/tones/tones";
import { useCanvasStore } from "@/store/canvas-store";
import { cn } from "@nextflow/utils";

export type EDGE_STATUS = "RUNNING" | "COMPLETED" | "FAILED" | "PENDING";

export interface CustomEdgeData {
  tone?: EdgeTone;
  label?: string;
  status?: EDGE_STATUS;
}

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
  target, // 1. Extract the target node ID from props
}: EdgeProps<CustomEdgeData>) {
  const { setEdges } = useReactFlow();
  const tone: EdgeTone = data?.tone ?? "zinc";
  const { stroke } = EDGE_COLORS[tone];
  
  // 2. Subscribe to the target node's status from Zustand.
  // Because this returns a primitive (string/undefined), it's highly performant. 
  // It will ONLY re-render this specific edge if this specific node's status changes.
  const targetNodeStatus = useCanvasStore(
    (s) => s.nodes.find((n) => n.id === target)?.data?.status
  );

  // 3. Determine if the edge should be animating
  // It animates if the edge itself is marked as running, OR if the target node is running.
  const isRunning = data?.status === "RUNNING" || targetNodeStatus === "RUNNING";

  const setHoveredEdgeId = useCanvasStore((s) => s.setHoveredEdgeId);
  const hoveredEdgeId = useCanvasStore((s) => s.hoveredEdgeId);
  const hovered = hoveredEdgeId === id;

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
      <defs>
        <linearGradient
          id={`lg-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={sourceX} y1={sourceY}
          x2={targetX} y2={targetY}
          r="100%"
        >
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="40%" stopColor={stroke} stopOpacity="0.8" />
          <stop offset="60%" stopColor={`color-mix(in srgb, ${stroke} 70%, white)`} stopOpacity="1" />
          <stop offset="75%" stopColor={stroke} stopOpacity="0.8" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values={`${-(targetX - sourceX)} ${-(targetY - sourceY)}; ${targetX - sourceX} ${targetY - sourceY}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      {/* 4. Use the derived `isRunning` variable here */}
      {isRunning ? (
        <path
          d={edgePath}
          fill="none"
          stroke={`url(#lg-${id})`}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ pointerEvents: "auto" }}
          onMouseEnter={() => setHoveredEdgeId(id)}
          onMouseLeave={() => setHoveredEdgeId(null)}
        />
      ) : null}

      <BaseEdge
        path={edgePath}
        style={{
          stroke: stroke,
          strokeWidth: 3,
          strokeOpacity: selected ? 1 : 0.15,
          transition: "stroke-opacity 0.2s ease-in-out",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            opacity: selected || hovered ? 1 : 0,
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1"
        >
          <button
            onClick={deleteEdge}
            title="Delete edge"
            style={{ backgroundColor: stroke }}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full border",
              "text-white border-none transition-all duration-150",
              "hover:scale-110 hover:cursor-pointer",
              selected || hovered ? "opacity-100" : "opacity-0",
            )}
          >
            <X className="h-2.5 w-2.5" strokeWidth={5} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}