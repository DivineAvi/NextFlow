import { useCallback } from "react";
import { Connection, addEdge } from "reactflow";
import { useCanvasStore } from "@/store/canvas-store";
import { AvailableNodesList, hasCycle } from "@nextflow/core";
import { HANDLER_TYPE_TO_TONE } from "../type";

export function useConnectionHandler() {
  const { nodes, edges, setEdges, pushHistory } = useCanvasStore();

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      const sourceDef = AvailableNodesList.find((n) => n.type === sourceNode.type);
      const targetDef = AvailableNodesList.find((n) => n.type === targetNode.type);

      const outputPort = sourceDef?.outputs.find((o) => o.id === params.sourceHandle);
      const inputPort = targetDef?.inputs.find((i) => i.id === params.targetHandle);

      // Type validation: only allow compatible port types
      if (!outputPort || !inputPort) return;
      if (outputPort.type !== inputPort.type && inputPort.type !== "any") return;

      // DAG validation: reject cycles
      if (hasCycle(params.source, params.target, edges)) return;

      // If a port doesn't accept multiple connections, remove the existing edge first
      let currentEdges = edges;
      if (!inputPort.acceptsMultiple) {
        currentEdges = edges.filter(
          (e) => !(e.target === params.target && e.targetHandle === params.targetHandle)
        );
      }

      const tone = HANDLER_TYPE_TO_TONE[outputPort.type] ?? "yellow";

      pushHistory();
      setEdges(addEdge({ ...params, type: "default", data: { tone } }, currentEdges));
    },
    [nodes, edges, setEdges, pushHistory]
  );

  return { onConnect };
}
