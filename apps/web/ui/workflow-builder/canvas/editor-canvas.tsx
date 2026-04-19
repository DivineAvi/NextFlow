"use client";

import React, { useCallback, useEffect, useRef, memo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type OnConnectStartParams,
} from "reactflow";
import "reactflow/dist/style.css";

import { useShallow } from "zustand/react/shallow";
import { Undo2, Redo2, Play, Loader2, FlaskConical } from "lucide-react";

import { CanvasEmptyState } from "./canvas-empty-state";
import { useCanvasStore } from "@/store/canvas-store";
import { NODE_TYPES, EDGE_TYPES } from "../type";
import { GenerateDefaultNodeData } from "./utils";
import { useConnectionHandler } from "./use-connection-handler";
import { MapEdgeColors } from "./utils";
import { createSampleWorkflow } from "@/config/sample-workflow";

// ---------------------------------------------------------------------------
// Polling interval for run status (ms)
// ---------------------------------------------------------------------------
const POLL_INTERVAL = 2500;

function useWorkflowRunPoller() {
  const { execution, applyNodeStatuses, setExecutionIdle } = useCanvasStore(
    useShallow((s) => ({
      execution: s.execution,
      applyNodeStatuses: s.applyNodeStatuses,
      setExecutionIdle: s.setExecutionIdle,
    }))
  );

  useEffect(() => {
    if (!execution.isRunning || !execution.runId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${execution.runId}`);
        if (!res.ok) return;

        const run = await res.json();
        const statuses: Record<string, { status: string; output?: any; error?: string }> = {};

        for (const nodeRun of run.nodeRuns ?? []) {
          statuses[nodeRun.nodeId] = {
            status: nodeRun.status,
            output: nodeRun.outputs?.output,
            error: nodeRun.error ?? undefined,
          };
        }

        applyNodeStatuses(statuses);

        const terminal = ["COMPLETED", "FAILED", "PARTIAL"].includes(run.status);
        if (terminal) {
          setExecutionIdle();
          clearInterval(interval);
        }
      } catch {
        // network error — keep polling
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [execution.isRunning, execution.runId]);
}

// ---------------------------------------------------------------------------
// Inner canvas — must be a child of ReactFlowProvider
// ---------------------------------------------------------------------------

export const EditorCanvasInner = memo(function EditorCanvasInner() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange,
    setEdges,
    pendingNodeType, clearPendingNode,
    setHoveredEdgeId,
    execution,
    workflowId, workflowName,
    setWorkflowId, setWorkflowName,
    pushHistory, undo, redo, canUndo, canRedo,
    setExecutionRunning,
  } = useCanvasStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      setEdges: s.setEdges,
      pendingNodeType: s.pendingNodeType,
      clearPendingNode: s.clearPendingNode,
      setHoveredEdgeId: s.setHoveredEdgeId,
      execution: s.execution,
      workflowId: s.workflowId,
      workflowName: s.workflowName,
      setWorkflowId: s.setWorkflowId,
      setWorkflowName: s.setWorkflowName,
      pushHistory: s.pushHistory,
      undo: s.undo,
      redo: s.redo,
      canUndo: s.canUndo,
      canRedo: s.canRedo,
      setExecutionRunning: s.setExecutionRunning,
    }))
  );

  const { screenToFlowPosition, addNodes, setNodes } = useReactFlow();
  const [runError, setRunError] = useState<string | null>(null);
  const [connectLineStyle, setConnectLineStyle] = useState<React.CSSProperties>({
    stroke: "#71717a",
    strokeWidth: 2,
    strokeOpacity: 0.4,
  });

  const { onConnect } = useConnectionHandler();

  // Start polling when a run is active
  useWorkflowRunPoller();

  // ── Sidebar "Add to Canvas" bridge ──────────────────────────────────
  useEffect(() => {
    if (!pendingNodeType) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const position = screenToFlowPosition({ x: centerX, y: centerY });

    pushHistory();
    addNodes({
      id: `${pendingNodeType}-${Date.now()}`,
      type: pendingNodeType,
      position,
      data: GenerateDefaultNodeData(pendingNodeType),
    });
    clearPendingNode();
  }, [pendingNodeType]);

  // ── Connection line color ────────────────────────────────────────────
  const onConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
      const sourceNode = nodes.find((n) => n.id === params.nodeId);
      const stroke = MapEdgeColors(sourceNode, params.handleId);
      setConnectLineStyle({ stroke, strokeWidth: 2 });
    },
    [nodes]
  );

  // ── Drag-and-drop from sidebar ───────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      pushHistory();
      addNodes({
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: GenerateDefaultNodeData(type),
      });
    },
    [addNodes, screenToFlowPosition, pushHistory]
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo]);

  // ── Run workflow ──────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (execution.isRunning) return;
    setRunError(null);

    try {
      const res = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, nodes, edges, scope: "FULL" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Run failed");
      }

      const { runId, workflowId: newWorkflowId } = await res.json();

      if (newWorkflowId && newWorkflowId !== workflowId) {
        setWorkflowId(newWorkflowId);
      }

      setExecutionRunning(runId);
    } catch (e: any) {
      setRunError(e.message);
    }
  }, [execution.isRunning, workflowId, nodes, edges]);

  // ── Load sample workflow ─────────────────────────────────────────────
  const handleLoadSample = useCallback(() => {
    const { nodes: sampleNodes, edges: sampleEdges } = createSampleWorkflow();
    pushHistory();
    setNodes(sampleNodes);
    setEdges(sampleEdges);
    setWorkflowName("Product Marketing Kit Generator");
    setWorkflowId(null);
  }, [pushHistory, setNodes, setEdges, setWorkflowName, setWorkflowId]);

  return (
    <div
      className="h-screen w-full bg-[#101010]"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {nodes.length === 0 && <CanvasEmptyState />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={{ type: "default" }}
        minZoom={0.15}
        maxZoom={3}
        panOnScroll
        panOnScrollSpeed={0.9}
        panOnDrag={[1, 2]}
        selectionOnDrag
        zoomOnScroll={false}
        connectionLineStyle={connectLineStyle}
        zoomOnPinch
        onEdgeMouseEnter={(_e, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        zoomOnDoubleClick={false}
        elevateNodesOnSelect
        fitView
        deleteKeyCode={["Delete", "Backspace"]}
      >
        <Background color="#262626" gap={20} />

        <MiniMap
          position="bottom-right"
          nodeColor="#52525B"
          maskColor="rgba(0,0,0,0.4)"
          style={{
            backgroundColor: "#1c1c1c",
            borderRadius: "12px",
            border: "1px solid #27272a",
          }}
        />

        {/* ── Top-right toolbar ─────────────────────────────────────── */}
        <Panel position="bottom-left">
          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <button
              onClick={undo}
              disabled={!canUndo()}
              title="Undo (Ctrl+Z)"
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              title="Redo (Ctrl+Shift+Z)"
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <Redo2 size={14} />
            </button>

            {/* Load sample workflow */}
            <button
              onClick={handleLoadSample}
              title="Load sample workflow"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 text-xs font-medium transition"
            >
              <FlaskConical size={13} />
              Sample
            </button>


          </div>

          {/* Error toast */}
          {runError && (
            <div className="mt-2 max-w-xs rounded-lg bg-red-900/80 border border-red-700 px-3 py-2 text-xs text-red-200">
              {runError}
            </div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
});

export function EditorCanvas() {
  return <EditorCanvasInner />;
}
