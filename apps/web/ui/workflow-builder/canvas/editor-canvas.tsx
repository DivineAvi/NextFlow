"use client";

import React, { useCallback, useEffect, useMemo, memo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
  OnConnectStartParams,
} from "reactflow";
import "reactflow/dist/style.css";

import { CanvasEmptyState } from "./canvas-empty-state";
import { BaseNode, LLMNode, TextNode, UploadImageNode, UploadVideoNode, CropImageNode, ExtractFrameNode } from "@/ui/workflow-builder/nodes";
import { CustomEdge } from "./edges/custom-edge";
import { useCanvasStore } from "@/store/canvas-store";
import { EDGE_COLORS, EdgeTone } from "@/ui/tones/tones";

// ---------------------------------------------------------------------------
// Module-scope constants — identities NEVER change across re-renders.
// Putting these inside the component rebuilds the object every render and
// triggers ReactFlow error #002.
// ---------------------------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  llm_node: LLMNode,
  text_node: TextNode,
  base_node: BaseNode,
  upload_image: UploadImageNode,
  upload_video: UploadVideoNode,
  crop_image: CropImageNode,
  extract_frame: ExtractFrameNode,
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
const HANDLER_TYPE_TO_TONE: Record<string, EdgeTone> = {
  text: "yellow",
  image: "blue",
  video: "pink",
  number: "orange",
  boolean: "orange",
};

// ---------------------------------------------------------------------------
// Inner canvas — must be a child of ReactFlowProvider
// ---------------------------------------------------------------------------

export const EditorCanvasInner = memo(function EditorCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const { screenToFlowPosition, addNodes } = useReactFlow();
  const [connectLineStyle, setConnectLineStyle] = useState<React.CSSProperties>({ stroke: "zinc", strokeWidth: 2, strokeOpacity: 0.2 });
  // ── Watch Zustand store for sidebar "Add to Canvas" requests ───────────
  const pendingNodeType = useCanvasStore((s) => s.pendingNodeType);
  const clearPendingNode = useCanvasStore((s) => s.clearPendingNode);
  const setHoveredEdgeId = useCanvasStore((s) => s.setHoveredEdgeId);
  const hoveredEdgeId = useCanvasStore((s) => s.hoveredEdgeId);
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

  // ── Connection Validation Helpers ────────────────────────────────────────
 
  const getSourceOutputType = (nodeType: string): string => {
    if (["text_node", "llm_node"].includes(nodeType)) return "TEXT";
    if (["upload_image", "crop_image", "extract_frame"].includes(nodeType)) return "IMAGE";
    if (["upload_video"].includes(nodeType)) return "VIDEO";
    return "UNKNOWN";
  };

  const getTargetInputType = (handleId: string): string => {
    if (handleId.includes("image")) return "IMAGE";
    if (handleId.includes("video")) return "VIDEO";
    return "TEXT"; // Default to TEXT for text outputs, prompts, timestamps
  };

  const hasCycle = (source: string, target: string, allEdges: any[]): boolean => {
    // If adding an edge from source -> target, a cycle occurs if there is a path from target -> source
    const visited = new Set<string>();
    const stack = [target];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === source) return true;
      if (!visited.has(current)) {
        visited.add(current);
        const outgoing = allEdges.filter((e) => e.source === current).map((e) => e.target);
        stack.push(...outgoing);
      }
    }
    return false;
  };

  const onConnectStart = useCallback((
    event: React.MouseEvent | React.TouchEvent,
    params: OnConnectStartParams
  ) => {
    console.log(params);
    let stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["text"]].stroke;
    if (params.handleId?.includes("image")) stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["image"]].stroke;
    else if (params.handleId?.includes("video")) stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["video"]].stroke;
    else if (params.handleId?.includes("number")) stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["number"]].stroke;
    else if (params.handleId?.includes("boolean")) stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["boolean"]].stroke;
    else stroke = EDGE_COLORS[HANDLER_TYPE_TO_TONE["text"]].stroke;
    
    setConnectLineStyle({ stroke, strokeWidth: 2 });
  }, [setConnectLineStyle]);

  // ── Edge connection — attach tone and validate ───────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      if (!sourceNode) return;

      const outType = getSourceOutputType(sourceNode.type ?? "");
      const inType = getTargetInputType(params.targetHandle ?? "");

      // Validate Types
      if (outType !== inType) {
        console.warn(`Validation Error: Cannot connect ${outType} to ${inType} input.`);
        return;
      }

      // Validate Directed Acyclic Graph (no loops)
      if (params.source && params.target && hasCycle(params.source, params.target, edges)) {
        console.warn("Validation Error: Circular connections are not permitted.");
        return;
      }
      let tone: EdgeTone = "pink";
      if (params.sourceHandle?.includes("image")) {
        tone = HANDLER_TYPE_TO_TONE["image"];
      } else if (params.sourceHandle?.includes("video")) {
        tone = HANDLER_TYPE_TO_TONE["video"];
      } else if (params.sourceHandle?.includes("number")) {
        tone = HANDLER_TYPE_TO_TONE["number"];
      } else if (params.sourceHandle?.includes("boolean")) {
        tone = HANDLER_TYPE_TO_TONE["boolean"];
      } else {
        tone = HANDLER_TYPE_TO_TONE["text"];
      }

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
    [setEdges, nodes, edges]
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
        onConnectStart={onConnectStart}
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
        connectionLineStyle={connectLineStyle}
        zoomOnPinch
        onEdgeMouseEnter={(_event, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={(_event, edge) => setHoveredEdgeId(null)}
        zoomOnDoubleClick={false}
        elevateNodesOnSelect
        fitView
      >
        <Background color="#262626" gap={20} />
        <Controls />
        <MiniMap 
          position="bottom-right" 
          nodeColor="#52525B" 
          maskColor="rgba(0, 0, 0, 0.4)" 
          style={{ backgroundColor: '#1c1c1c', borderRadius: '12px', border: '1px solid #27272a' }}
        />
        <Panel position="top-right">
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/execute-workflow", {
                  method: "POST",
                  body: JSON.stringify({
                    workflowId: "temp-draft-id", // Later fetched dynamically or upserted prior
                    nodes,
                    edges,
                  }),
                });
                if (!res.ok) throw new Error("Trigger failed");
                // TODO: Open sidebar or start polling
              } catch (e) {
                console.error(e);
              }
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-blue-500 active:scale-95"
          >
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
