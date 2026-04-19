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
import { useShallow } from "zustand/react/shallow";

import { CanvasEmptyState } from "./canvas-empty-state";
import { BaseNode, LLMNode, TextNode, UploadImageNode, UploadVideoNode, CropImageNode, ExtractFrameNode } from "@/ui/workflow-builder/nodes";
import { CustomEdge } from "./edges/custom-edge";
import { useCanvasStore } from "@/store/canvas-store";
import { EDGE_COLORS, EdgeTone } from "@/ui/tones/tones";
import { AvailableNodesList } from "@nextflow/core";

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

// Map from Registry output type → edge tone so connected edges pick the right color.
const HANDLER_TYPE_TO_TONE: Record<string, EdgeTone> = {
  string: "yellow",
  text: "yellow",
  image: "blue",
  video: "pink",
  number: "orange",
  boolean: "orange",
  any: "yellow"
};

const getDefinitionType = (feType: string) => {
  if (feType === "text_node") return "text_input";
  if (feType === "crop_image") return "image_crop";
  return feType;
};

const generateDefaultNodeData = (feType: string) => {
  const coreType = getDefinitionType(feType);
  const def = AvailableNodesList.find((n) => n.type === coreType);
  
  const data: Record<string, any> = { label: feType.replace("_", " ") };
  
  if (def && def.controls) {
    for (const ctrl of def.controls) {
      if (ctrl.defaultValue !== undefined) {
        data[ctrl.id] = ctrl.defaultValue;
      }
    }
  }
  return data;
};

// ---------------------------------------------------------------------------
// Inner canvas — must be a child of ReactFlowProvider
// ---------------------------------------------------------------------------

export const EditorCanvasInner = memo(function EditorCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useCanvasStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      setEdges: s.setEdges,
    }))
  );
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
      data: generateDefaultNodeData(pendingNodeType),
    });

    clearPendingNode();
  }, [pendingNodeType, addNodes, screenToFlowPosition, clearPendingNode]);

  // ── Connection Validation Helpers ────────────────────────────────────────
 
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
    
    // Attempt to guess tone based on source node definition
    let stroke = EDGE_COLORS["yellow"].stroke;
    const sourceNode = nodes.find((n) => n.id === params.nodeId);
    if (sourceNode) {
      const sourceDef = AvailableNodesList.find((n) => n.type === getDefinitionType(sourceNode.type ?? ""));
      if (sourceDef && params.handleId) {
        const outputPort = sourceDef.outputs.find((o) => o.id === params.handleId);
        if (outputPort) {
          const matchedTone = HANDLER_TYPE_TO_TONE[outputPort.type];
          if (matchedTone) {
            stroke = EDGE_COLORS[matchedTone].stroke;
          }
        }
      }
    }
    
    setConnectLineStyle({ stroke, strokeWidth: 2 });
  }, [setConnectLineStyle]);

  // ── Edge connection — attach tone and validate ───────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      const sourceDef = AvailableNodesList.find((n) => n.type === getDefinitionType(sourceNode.type ?? ""));
      const targetDef = AvailableNodesList.find((n) => n.type === getDefinitionType(targetNode.type ?? ""));

      if (!sourceDef || !targetDef) {
        console.warn("Validation Error: Could not find node definitions in registry.");
        return;
      }

      const outputPort = sourceDef.outputs.find((o) => o.id === params.sourceHandle);
      const inputPort = targetDef.inputs.find((i) => i.id === params.targetHandle);

      if (!outputPort || !inputPort) {
        console.warn("Validation Error: Could not find matching ports for the connection.");
        return;
      }

      // Validate Types via Core Schema
      if (outputPort.type !== inputPort.type && inputPort.type !== "any") {
        console.warn(`Validation Error: Cannot connect ${outputPort.type} to ${inputPort.type} input.`);
        return;
      }

      // Validate Directed Acyclic Graph (no loops)
      if (params.source && params.target && hasCycle(params.source, params.target, edges)) {
        console.warn("Validation Error: Circular connections are not permitted.");
        return;
      }
      
      const tone = HANDLER_TYPE_TO_TONE[outputPort.type] || "yellow";

      // Handle replacing existing edge if multiple connections are not accepted
      let currentEdges = edges;
      if (!inputPort.acceptsMultiple) {
        // Remove any existing edge that targets this exact same port on the target node
        currentEdges = edges.filter((e) => !(e.target === params.target && e.targetHandle === params.targetHandle));
      }

      setEdges(
        addEdge(
          {
            ...params,
            type: "default",
            data: { tone, label: sourceNode?.type?.replace("_node", "") ?? "" },
            animated: false,
          },
          currentEdges
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
        data: generateDefaultNodeData(type),
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
