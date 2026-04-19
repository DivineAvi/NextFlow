import { NodeDefinition, } from "../schema";
export const hasCycle = (source: string, target: string, allEdges: any[]): boolean => {
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
  
  export const ValidateConnection = (
    sourceNodeType:NodeDefinition,
    inputHandleId: string,
    outputNodeType: NodeDefinition,
    outputHandleId: string,
    edges: any[]
  ): boolean => {

    if (!outputHandleId || !inputHandleId) return false;
    const outputPort = sourceNodeType.outputs.find((o) => o.id === outputHandleId);
    const inputPort = outputNodeType.inputs.find((i) => i.id === inputHandleId);

    if (!outputPort || !inputPort) return false;

    const outputType = outputPort.type;
    const inputType = inputPort.type;
    if (inputType !== outputType && outputType !== "any") return false;
    if (hasCycle(sourceNodeType.type, outputNodeType.type, edges)) return false;
    // Note: 'edges' is undefined in this scope, so remove the hasCycle call for now
    return true;
}