import { useEdges } from "reactflow";

export function useIsHandleConnected(nodeId: string, handleId: string): boolean {
  const edges = useEdges();
  return edges.some((e) => e.target === nodeId && e.targetHandle === handleId);
}
