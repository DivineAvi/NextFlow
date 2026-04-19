import { useCallback } from "react";
import { Connection, addEdge, useReactFlow } from "reactflow";
import { useCanvasStore } from "@/store/canvas-store";
import { AvailableNodesList, hasCycle } from "@nextflow/core";
import { HANDLER_TYPE_TO_TONE } from "../type";

export function useConnectionHandler() {
  const { nodes, edges, setEdges, updateNodeData } = useCanvasStore();

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (!sourceNode || !targetNode) return;

    const sourceDef = AvailableNodesList.find((n) => n.type === sourceNode.type);
    const targetDef = AvailableNodesList.find((n) => n.type === targetNode.type);
    
    const outputPort = sourceDef?.outputs.find((o) => o.id === params.sourceHandle);
    const inputPort = targetDef?.inputs.find((i) => i.id === params.targetHandle);

    // 1. Validation Logic
    if (!outputPort || !inputPort) return;
    if (outputPort.type !== inputPort.type && inputPort.type !== "any") return;
    if (hasCycle(params.source!, params.target!, edges)) return;

    // 2. Business Logic (Replacing existing edges if single-port)
    let currentEdges = edges;
    if (!inputPort.acceptsMultiple) {
      currentEdges = edges.filter(
        (e) => !(e.target === params.target && e.targetHandle === params.targetHandle)
      );
    }

    // 3. Update State
    const tone = HANDLER_TYPE_TO_TONE[outputPort.type] || "yellow";
    setEdges(addEdge({ ...params, type: "default", data: { tone } }, currentEdges));
    updateNodeData(params.target!, { targetHandle: nodes.find((n) => n.id === params.target)?.data.targetHandle });
  }, [nodes, edges, setEdges]);

  return { onConnect };
}