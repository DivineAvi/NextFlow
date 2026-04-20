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
import { Undo2, Redo2, Play, Loader2, FlaskConical, Boxes } from "lucide-react";

import { CanvasEmptyState } from "./canvas-empty-state";
import { useCanvasStore } from "@/store/canvas-store";
import { NODE_TYPES, EDGE_TYPES } from "../type";
import { GenerateDefaultNodeData } from "./utils";
import { useConnectionHandler } from "./use-connection-handler";
import { MapEdgeColors } from "./utils";
import { createSampleWorkflow } from "@/config/sample-workflow";

// SSE from Trigger.dev metadata — drives instant RUNNING state updates.
// Does NOT own setExecutionIdle; the DB poller below is the authoritative source.
function useWorkflowRunRealtime() {
  const { execution, applyNodeStatuses } = useCanvasStore(
    useShallow((s) => ({
      execution: s.execution,
      applyNodeStatuses: s.applyNodeStatuses,
    }))
  );

  useEffect(() => {
    if (!execution.isRunning || !execution.triggerRunId) return;

    const source = new EventSource(`/api/realtime/${execution.triggerRunId}`);

    source.onmessage = (event) => {
      try {
        const { nodeStatuses } = JSON.parse(event.data);
        if (nodeStatuses) applyNodeStatuses(nodeStatuses);
      } catch {
        // ignore parse errors
      }
    };

    // On error just drop the SSE connection — DB poller takes over.
    source.onerror = () => source.close();

    return () => source.close();
  }, [execution.isRunning, execution.triggerRunId]);
}

// DB polling — authoritative source for outputs and terminal state.
// Polls every 2 s; sets execution idle when the workflow reaches a terminal status.
const POLL_INTERVAL = 2000;

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

        if (Object.keys(statuses).length > 0) applyNodeStatuses(statuses);

        if (["COMPLETED", "FAILED", "PARTIAL"].includes(run.status)) {
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
    setExecutionRunning, runSelected,
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
      runSelected: s.runSelected,
    }))
  );

  const selectedCount = nodes.filter((n) => n.selected).length;

  const { screenToFlowPosition, addNodes, setNodes } = useReactFlow();
  const [runError, setRunError] = useState<string | null>(null);
  const [connectLineStyle, setConnectLineStyle] = useState<React.CSSProperties>({
    stroke: "#71717a",
    strokeWidth: 2,
    strokeOpacity: 0.4,
  });

  const { onConnect } = useConnectionHandler();

  // SSE for instant RUNNING updates; DB poll for reliable output delivery
  useWorkflowRunRealtime();
  useWorkflowRunPoller();

  // ── Auto-save: persist nodes/edges to DB 1.5s after the last change ─
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!workflowId || execution.isRunning) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Strip transient execution state before persisting
      const cleanNodes = nodes.map(({ data, ...rest }) => ({
        ...rest,
        data: Object.fromEntries(
          Object.entries(data).filter(([k]) => !["status", "output", "error"].includes(k))
        ),
      }));
      fetch(`/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition: { nodes: cleanNodes, edges } }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, workflowId, execution.isRunning]);

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

      const { runId, triggerRunId, workflowId: newWorkflowId } = await res.json();

      if (newWorkflowId && newWorkflowId !== workflowId) {
        setWorkflowId(newWorkflowId);
      }

      setExecutionRunning(runId, triggerRunId);
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

            {/* Run Selected — only visible when nodes are selected */}
            {selectedCount > 0 && (
              <button
                onClick={runSelected}
                disabled={execution.isRunning}
                title={`Run ${selectedCount} selected node${selectedCount > 1 ? "s" : ""}`}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-violet-700 text-white hover:bg-violet-600 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {execution.isRunning ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Boxes size={13} />
                )}
                Run Selected ({selectedCount})
              </button>
            )}
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
