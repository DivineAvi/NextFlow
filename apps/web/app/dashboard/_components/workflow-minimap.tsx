"use client";

import type { Node, Edge } from "reactflow";

// Color config per node type — fill is a dark tint, stroke is the accent color
const NODE_COLORS: Record<string, { fill: string; stroke: string }> = {
  llm_node:           { fill: "#0f1e3d", stroke: "#3b82f6" },
  text_node:          { fill: "#2d1f00", stroke: "#f59e0b" },
  upload_image_node:  { fill: "#08202e", stroke: "#0ea5e9" },
  upload_video_node:  { fill: "#1e1030", stroke: "#8b5cf6" },
  image_crop_node:    { fill: "#2d1500", stroke: "#f97316" },
  extract_frame_node: { fill: "#071e14", stroke: "#10b981" },
};

const EDGE_COLORS: Record<string, string> = {
  blue:   "#0ea5e9",
  yellow: "#f59e0b",
  pink:   "#8b5cf6",
  purple: "#8b5cf6",
  green:  "#10b981",
};

const DEFAULT_NODE_COLOR = { fill: "#1c1c1c", stroke: "#52525b" };
const DEFAULT_EDGE_COLOR = "#52525b";

// Assumed node dimensions in flow-coordinate units when not stored
const NODE_W = 220;
const NODE_H = 100;
const PADDING = 40;

interface WorkflowMinimapProps {
  nodes: Node[];
  edges: Edge[];
}

export function WorkflowMinimap({ nodes, edges }: WorkflowMinimapProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-zinc-700 text-xs">No nodes</span>
      </div>
    );
  }

  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);

  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxX = Math.max(...xs) + NODE_W + PADDING;
  const maxY = Math.max(...ys) + NODE_H + PADDING;

  const vw = maxX - minX;
  const vh = maxY - minY;

  return (
    <svg
      viewBox={`${minX} ${minY} ${vw} ${vh}`}
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Edges — drawn first so they appear behind nodes */}
      {edges.map((edge) => {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return null;

        const x1 = src.position.x + NODE_W;
        const y1 = src.position.y + NODE_H / 2;
        const x2 = tgt.position.x;
        const y2 = tgt.position.y + NODE_H / 2;
        const cx = (x1 + x2) / 2;

        const color =
          EDGE_COLORS[(edge.data?.tone as string) ?? ""] ?? DEFAULT_EDGE_COLOR;

        return (
          <path
            key={edge.id}
            d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeOpacity="0.45"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const colors = NODE_COLORS[node.type ?? ""] ?? DEFAULT_NODE_COLOR;
        const w = (node.width as number) || NODE_W;
        const h = (node.height as number) || NODE_H;

        return (
          <g key={node.id}>
            <rect
              x={node.position.x}
              y={node.position.y}
              width={w}
              height={h}
              rx="10"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="2"
              strokeOpacity="0.6"
              fillOpacity="0.85"
            />
            {/* Accent top bar */}
            <rect
              x={node.position.x}
              y={node.position.y}
              width={w}
              height="4"
              rx="10"
              fill={colors.stroke}
              fillOpacity="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
