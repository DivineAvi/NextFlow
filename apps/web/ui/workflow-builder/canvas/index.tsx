"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EmptyState } from './empty-state';
import { BaseNode, LLMNode, TextNode } from '../nodes';

const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Text' }, type: 'text_node' },
];

export function EditorCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const nodeTypes = useMemo(() => ({
    llm_node: LLMNode,
    text_node: TextNode,
    base_node: BaseNode, // You can use the same component for multiple types
  }), []);


  return (
    <div className="h-screen w-full bg-[#101010]">
        {nodes.length === 0 && <EmptyState />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        minZoom={0.2}
        maxZoom={3}
        // --- TRACKPAD PANNING SETTINGS ---
        panOnScroll={true}           // Move canvas with trackpad scroll
        selectionOnDrag={true}       // Allows selecting nodes while dragging
        panOnDrag={[1, 2]}           // Allow panning with left (1) or middle (2) click
        panOnScrollSpeed={0.9}
        zoomOnScroll={false}         // Disable the default zoom-on-scroll
        zoomOnPinch={true}           // Still allow pinch-to-zoom if desired
        zoomOnDoubleClick={false}    // Professional editors usually disable this
        // ---------------------------------
        // This is where your Registry will plug in later
        elevateNodesOnSelect={true}
        nodeTypes={nodeTypes} 
        fitView
      >
        <Background color="#262626" gap={20} />
        <Controls/>
        <Panel position="top-right" className="bg-white p-2 rounded shadow">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Run Workflow
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}