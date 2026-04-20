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
  // Position toolbar to the left of the selection, aligned to its top edge
  const left = rect.x * zoom + vpX - 8;
  const top  = rect.y * zoom + vpY;

  const isRunning = execution.isRunning;
  const singleId = selectedNodes.length === 1 ? selectedNodes[0].id : null;
  const allIds = selectedNodes.map((n) => n.id);

  return (
    <div
      className="absolute z-50 flex flex-col gap-1 pointer-events-auto"
      style={{ left, top, transform: "translateX(-100%)" }}
    >
      {singleId && (
        <button
          onClick={() => runNode(singleId)}
          disabled={isRunning}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[var(--wf-btn-bg)] text-[var(--wf-btn-text-hover)] text-[11px] font-medium shadow-md hover:bg-[var(--wf-btn-bg-hover)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isRunning ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
          Run Node
        </button>
      )}

      {selectedNodes.length > 1 && (
        <button
          onClick={runSelected}
          disabled={isRunning}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-violet-700 text-white text-[11px] font-medium shadow-md hover:bg-violet-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isRunning ? <Loader2 size={10} className="animate-spin" /> : <Boxes size={10} />}
          Run Selected
        </button>
      )}

      <button
        onClick={() => runConnectedComponent(allIds)}
        disabled={isRunning}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium shadow-md hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {isRunning ? <Loader2 size={10} className="animate-spin" /> : <Workflow size={10} />}
        Run Workflow
      </button>
    </div>
  );
}
