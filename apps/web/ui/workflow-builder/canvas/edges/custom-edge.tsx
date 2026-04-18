"use client";

import { useCallback, useEffect, useState } from "react";
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


export interface CustomEdgeData {
  isAnimating: boolean;
  tone?: EdgeTone;
  label?: string;
}


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
  isAnimating = false,
}: EdgeProps<CustomEdgeData>) {
  const { setEdges } = useReactFlow();
  const tone: EdgeTone = data?.tone ?? "zinc";
  const label = data?.label;
  const { stroke, glow, badge } = EDGE_COLORS[tone];
  const [hovered, setHovered] = useState(false);
  const setHoveredEdgeId = useCanvasStore((s) => s.setHoveredEdgeId);
  const hoveredEdgeId = useCanvasStore((s) => s.hoveredEdgeId);

  useEffect(() => {
    if (hoveredEdgeId === id) {
      console.log("hovered edge");
      setHovered(true);
    } else {
      console.log("not hovered edge");
      setHovered(false);
    }
  }, [hoveredEdgeId, id, setHovered]);
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
          {/* 
            To mix two colors in a gradient, use two different stopColor values at different offsets.
            Example below blends from `stroke` to a second color `mixColor` and back to `stroke`.
            Replace `mixColor` with your target hex or rgba string.
          */}
          <stop offset="0%"   stopColor={stroke} stopOpacity="0" />
          <stop offset="40%"  stopColor={stroke} stopOpacity="0.8" />
          <stop offset="60%"  stopColor={`color-mix(in srgb, ${stroke} 70%, white)`}  stopOpacity="1" /> {/* Example: Gold as the mix color */}
          <stop offset="75%"  stopColor={stroke}  stopOpacity="0.8" />
          <stop offset="100%" stopColor={stroke}  stopOpacity="0" />
     

          {/* Animate the shimmer sweeping from source to target */}
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values={`${-(targetX - sourceX)} ${-(targetY - sourceY)}; ${targetX - sourceX} ${targetY - sourceY}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>


      {/* Animated glow line */}
      {isAnimating ? (
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#lg-${id})`}
        strokeWidth={3}
        strokeLinecap="round"
        style={{ pointerEvents: "auto" }}
        onMouseEnter={() => {setHovered(true); console.log("hovered")}}
        onMouseLeave={() => setHovered(false)}
      />
      ) : null}

      {/* 3. THE ACTUAL BASE EDGE: The crisp center line */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: stroke,
          strokeWidth: 3,
          strokeOpacity: selected ? 1 : 0.15,
          transition: "stroke-opacity 0.2s ease-in-out",
        }}
        
      />


      {/* Label + delete button — rendered in DOM (not SVG) via EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            opacity: selected || hovered ? 1 : 0,
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1 "
        >

          {/* Delete button — visible on hover or selection */}
          <button
            onClick={deleteEdge}
            title="Delete edge"
            style={{ backgroundColor: stroke }}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full border",
              "text-white border-none transition-all duration-150",
              "hover-scale-110 hover:cursor-pointer ",
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
