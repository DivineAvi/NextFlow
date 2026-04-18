"use client";

import React, { useCallback, useMemo, memo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { CanvasEmptyState } from "./canvas-empty-state";
import { BaseNode, LLMNode, TextNode } from "@/components/workflow-builder/nodes";

// ---------------------------------------------------------------------------
// Canvas settings — defined at module scope so identities are stable.
// ---------------------------------------------------------------------------

/** Start with an empty graph — workflow state will be loaded from a store. */
const INITIAL_NODES: Parameters<typeof useNodesState>[0] = [ { id: "1", type: "text_node", position: { x: 0, y: 0 }, data: { label: "Hello World" } } ];
const INITIAL_EDGES: Parameters<typeof useEdgesState>[0] = [];

// ---------------------------------------------------------------------------
// Inner canvas (wrapped by provider below)
// ---------------------------------------------------------------------------

const EditorCanvasInner = memo(function EditorCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  /**
   * useMemo keeps the reference stable across Turbopack HMR re-evaluations.
   * A new object ref on every call triggers ReactFlow error #002.
   */
  const nodeTypes: NodeTypes = useMemo(
    () => ({ llm_node: LLMNode, text_node: TextNode, base_node: BaseNode }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="h-screen w-full bg-[#101010]">
      {nodes.length === 0 && <CanvasEmptyState />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        minZoom={0.2}
        maxZoom={3}
        // Trackpad-friendly panning
        panOnScroll
        panOnScrollSpeed={0.9}
        panOnDrag={[1, 2]}
        selectionOnDrag
        // Zoom
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        elevateNodesOnSelect
        fitView
      >
        <Background color="#262626" gap={20} />
        <Controls />
        <Panel position="top-right" className="bg-white p-2 rounded shadow">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Run Workflow
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Public export — wraps the canvas in a scoped ReactFlowProvider.
// ---------------------------------------------------------------------------

/**
 * ReactFlowProvider scopes React Flow's internal zustand stores to this
 * subtree, preventing orphaned subscriptions when the canvas is unmounted.
 */
export function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <EditorCanvasInner />
    </ReactFlowProvider>
  );
}
