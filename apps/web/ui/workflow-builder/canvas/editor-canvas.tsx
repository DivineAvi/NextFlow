"use client";

import React, { useCallback, useEffect, memo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  MiniMap,
  useReactFlow,
  OnConnectStartParams,
} from "reactflow";
import "reactflow/dist/style.css";

import { useShallow } from "zustand/react/shallow";
import { CanvasEmptyState } from "./canvas-empty-state";
import { useCanvasStore } from "@/store/canvas-store";
import { NODE_TYPES, EDGE_TYPES} from "../type";
import { GenerateDefaultNodeData } from "./utils";
import { useConnectionHandler } from "./use-connection-handler";
import { MapEdgeColors } from "./utils";




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
  const { onConnect } = useConnectionHandler();

  useEffect(() => {
    if (!pendingNodeType) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const position = screenToFlowPosition({ x: centerX, y: centerY });

    addNodes({
      id: `${pendingNodeType}-${Date.now()}`,
      type: pendingNodeType,
      position,
      data: GenerateDefaultNodeData(pendingNodeType),
    });

    clearPendingNode();
  }, [pendingNodeType, addNodes, screenToFlowPosition, clearPendingNode]);

  // ── Connection Validation Helpers ────────────────────────────────────────

  const onConnectStart = useCallback((
    _: React.MouseEvent | React.TouchEvent,
    params: OnConnectStartParams,
  ) => {
    
    const sourceNode = nodes.find((n) => n.id === params.nodeId);
    const stroke = MapEdgeColors(sourceNode, params.handleId);
      
    setConnectLineStyle({ stroke, strokeWidth: 2 });
  }, [setConnectLineStyle,nodes]);


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
        data: GenerateDefaultNodeData(type),
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
