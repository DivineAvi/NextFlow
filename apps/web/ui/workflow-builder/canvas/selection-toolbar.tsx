"use client";

import { useNodes, useViewport, getRectOfNodes } from "reactflow";
import { Play, Loader2, Boxes, Workflow } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { useShallow } from "zustand/react/shallow";

export function SelectionToolbar() {
  const selectedNodes = useNodes().filter((n) => n.selected);
  const { x: vpX, y: vpY, zoom } = useViewport();

  const { execution, runNode, runSelected, runConnectedComponent } = useCanvasStore(
    useShallow((s) => ({
      execution: s.execution,
      runNode: s.runNode,
      runSelected: s.runSelected,
      runConnectedComponent: s.runConnectedComponent,
    }))
  );

  if (selectedNodes.length === 0) return null;

  const rect = getRectOfNodes(selectedNodes);
  const rawX = (rect.x + rect.width / 2) * zoom + vpX;
  const rawY = rect.y * zoom + vpY - 44;

  // Clamp so the toolbar stays visible inside the viewport
  const left = Math.max(60, Math.min(rawX, window.innerWidth - 60));
  const top  = Math.max(8, rawY);

  const isRunning = execution.isRunning;
  const singleId = selectedNodes.length === 1 ? selectedNodes[0].id : null;
  const allIds = selectedNodes.map((n) => n.id);

  return (
    <div
      className="absolute z-50 flex items-center gap-1 pointer-events-auto"
      style={{ left, top, transform: "translateX(-50%)" }}
    >
      {/* Run Node — only for single selection */}
      {singleId && (
        <button
          onClick={() => runNode(singleId)}
          disabled={isRunning}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[var(--wf-btn-bg)] text-[var(--wf-btn-text-hover)] text-[11px] font-medium shadow-lg hover:bg-[var(--wf-btn-bg-hover)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isRunning
            ? <Loader2 size={10} className="animate-spin" />
            : <Play size={10} fill="currentColor" />}
          Run Node
        </button>
      )}

      {/* Run Selected — only for multi-selection */}
      {selectedNodes.length > 1 && (
        <button
          onClick={runSelected}
          disabled={isRunning}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-violet-700 text-white text-[11px] font-medium shadow-lg hover:bg-violet-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isRunning
            ? <Loader2 size={10} className="animate-spin" />
            : <Boxes size={10} />}
          Run Selected
        </button>
      )}

      {/* Run Workflow — connected component of selected node(s) */}
      <button
        onClick={() => runConnectedComponent(allIds)}
        disabled={isRunning}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium shadow-lg hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {isRunning
          ? <Loader2 size={10} className="animate-spin" />
          : <Workflow size={10} />}
        Run Workflow
      </button>
    </div>
  );
}
