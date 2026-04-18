"use client";

import React, { useCallback, useEffect, useMemo, memo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { CanvasEmptyState } from "./canvas-empty-state";
import { BaseNode, LLMNode, TextNode } from "@/ui/workflow-builder/nodes";
import { CustomEdge, type EdgeTone } from "./edges/custom-edge";
import { useCanvasStore } from "@/store/canvas-store";

// ---------------------------------------------------------------------------
// Module-scope constants — identities NEVER change across re-renders.
// Putting these inside the component rebuilds the object every render and
// triggers ReactFlow error #002.
// ---------------------------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  llm_node: LLMNode,
  text_node: TextNode,
  base_node: BaseNode,
};

const EDGE_TYPES: EdgeTypes = {
  // One flexible component — tone comes from edge.data.tone
  string: CustomEdge,
  image: CustomEdge,
  video: CustomEdge,
  number: CustomEdge,
  default: CustomEdge,
};

const INITIAL_NODES: Parameters<typeof useNodesState>[0] = [];
const INITIAL_EDGES: Parameters<typeof useEdgesState>[0] = [];

// Map from ReactFlow node type → edge tone so connected edges pick the right color.
const NODE_TYPE_TO_TONE: Record<string, EdgeTone> = {
  text_node: "yellow",
  llm_node: "blue",
  base_node: "zinc",
  image_node: "orange",
};

// ---------------------------------------------------------------------------
// Inner canvas — must be a child of ReactFlowProvider
// ---------------------------------------------------------------------------

export const EditorCanvasInner = memo(function EditorCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const { screenToFlowPosition, addNodes } = useReactFlow();

  // ── Watch Zustand store for sidebar "Add to Canvas" requests ───────────
  const pendingNodeType = useCanvasStore((s) => s.pendingNodeType);
  const clearPendingNode = useCanvasStore((s) => s.clearPendingNode);

  useEffect(() => {
    if (!pendingNodeType) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const position = screenToFlowPosition({ x: centerX, y: centerY });

    addNodes({
      id: `${pendingNodeType}-${Date.now()}`,
      type: pendingNodeType,
      position,
      data: { label: pendingNodeType.replace("_", " ") },
    });

    clearPendingNode();
  }, [pendingNodeType, addNodes, screenToFlowPosition, clearPendingNode]);

  // ── Edge connection — attach tone based on source node type ────────────
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const tone: EdgeTone = sourceNode
        ? (NODE_TYPE_TO_TONE[sourceNode.type ?? ""] ?? "zinc")
        : "zinc";

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "default",
            data: { tone, label: sourceNode?.type?.replace("_node", "") ?? "" },
            animated: false,
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  // ── Drag-and-drop from sidebar ─────────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNodes({
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.replace("_node", " node") },
      });
    },
    [addNodes, screenToFlowPosition]
  );

  return (
    <div className="h-screen w-full bg-[#101010]" onDrop={onDrop} onDragOver={onDragOver}>
      {nodes.length === 0 && <CanvasEmptyState />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={{ type: "default" }}
        minZoom={0.2}
        maxZoom={3}
        panOnScroll
        panOnScrollSpeed={0.9}
        panOnDrag={[1, 2]}
        selectionOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        elevateNodesOnSelect
        fitView
      >
        <Background color="#262626" gap={20} />
        <Controls />
        <Panel position="top-right">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-blue-500 active:scale-95">
            Run Workflow
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Public export — intentionally does NOT wrap in ReactFlowProvider.
// The provider is held by WorkflowCanvas (parent) so sidebar + canvas share it.
// ---------------------------------------------------------------------------

export function EditorCanvas() {
  return <EditorCanvasInner />;
}
