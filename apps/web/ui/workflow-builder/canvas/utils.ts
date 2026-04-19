import { AvailableNodesList } from "@nextflow/core";
import type { Node } from "reactflow";
import { EDGE_COLORS } from "@/ui/tones/tones";
import { HANDLER_TYPE_TO_TONE } from "../type";

// Human-readable default label for a node type
function defaultLabel(type: string): string {
  return type
    .replace(/_node$/, "")      // strip trailing _node
    .replace(/_/g, " ")         // underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

export function GenerateDefaultNodeData(nodeType: string): Record<string, any> {
  const def = AvailableNodesList.find((n) => n.type === nodeType);
  const data: Record<string, any> = {
    label: def?.title ?? defaultLabel(nodeType),
    status: "PENDING",
  };

  if (def?.controls) {
    for (const ctrl of def.controls) {
      if ("defaultValue" in ctrl) {
        data[ctrl.id] = ctrl.defaultValue;
      }
    }
  }

  return data;
}

export function MapEdgeColors(
  sourceNode: Node | undefined,
  handleId: string | null
): string {
  if (!sourceNode || !handleId) return EDGE_COLORS["yellow"].stroke;

  const sourceDef = AvailableNodesList.find((n) => n.type === sourceNode.type);
  if (!sourceDef) return EDGE_COLORS["yellow"].stroke;

  const outputPort = sourceDef.outputs.find((o) => o.id === handleId);
  if (!outputPort) return EDGE_COLORS["yellow"].stroke;

  const tone = HANDLER_TYPE_TO_TONE[outputPort.type];
  return tone ? EDGE_COLORS[tone].stroke : EDGE_COLORS["yellow"].stroke;
}
