import { NodeRegistry } from "./nodes";

// Minimal duck-typed shapes so this module has no reactflow dependency
interface FlowNode {
  id: string;
  type?: string | null;
  data?: Record<string, any> | null;
}

interface FlowEdge {
  source: string;
  target: string;
  targetHandle?: string | null;
  sourceHandle?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Checks whether a value is considered "present" (not empty)
// ---------------------------------------------------------------------------
function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function isFileValue(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  return v.startsWith("data:") || v.startsWith("http");
}

// ---------------------------------------------------------------------------
// Structural validation — run at the API boundary before any DB writes.
// Checks:
//   1. Every node type exists in NodeRegistry
//   2. Every required input is either wired via an edge OR present in node.data
//   3. File nodes (upload_image_node / upload_video_node) have non-empty data
// ---------------------------------------------------------------------------
export function validateWorkflowPayload(
  nodes: FlowNode[],
  edges: FlowEdge[]
): ValidationResult {
  const errors: string[] = [];

  // Build a quick lookup: nodeId → set of incoming targetHandles
  const wiredHandles = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!edge.targetHandle) continue;
    if (!wiredHandles.has(edge.target)) wiredHandles.set(edge.target, new Set());
    wiredHandles.get(edge.target)!.add(edge.targetHandle);
  }

  for (const node of nodes) {
    const label = node.data?.label ?? node.id;
    const type = node.type ?? "";

    // 1. Unknown node type
    if (!(type in NodeRegistry)) {
      errors.push(`Node "${label}": unknown type "${type}"`);
      continue;
    }

    const def = NodeRegistry[type as keyof typeof NodeRegistry];
    const incoming = wiredHandles.get(node.id) ?? new Set<string>();

    // 2. Required inputs must be wired or present in data
    for (const input of def.inputs) {
      if (!input.required) continue;
      const wired = incoming.has(input.id);
      const inData = hasValue(node.data?.[input.id]);
      if (!wired && !inData) {
        errors.push(
          `Node "${label}": required input "${input.label}" is missing and not connected`
        );
      }
    }

    // 3. File nodes — validate the uploaded data is present
    if (type === "upload_image_node") {
      const file = node.data?.image_file;
      if (!hasValue(file)) {
        errors.push(`Node "${label}": no image file uploaded`);
      } else if (!isFileValue(file)) {
        errors.push(`Node "${label}": image file is not a valid data URI or URL`);
      }
    }

    if (type === "upload_video_node") {
      const file = node.data?.video_file;
      if (!hasValue(file)) {
        errors.push(`Node "${label}": no video file uploaded`);
      } else if (!isFileValue(file)) {
        errors.push(`Node "${label}": video file is not a valid data URI or URL`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Runtime validation — run inside the orchestrator after inputs are resolved.
// Checks that required inputs have actual values and files are non-empty.
// ---------------------------------------------------------------------------
export function validateResolvedInputs(
  _nodeId: string,
  nodeType: string,
  _nodeLabel: string,
  inputs: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  if (!(nodeType in NodeRegistry)) {
    return { valid: false, errors: [`Unknown node type "${nodeType}"`] };
  }

  const def = NodeRegistry[nodeType as keyof typeof NodeRegistry];

  for (const input of def.inputs) {
    const value = inputs[input.id];

    if (input.required && !hasValue(value)) {
      errors.push(`"${input.label}" is required but has no value`);
      continue;
    }

    // File inputs must be a valid data URI or URL when present
    if ((input.type === "image" || input.type === "video") && hasValue(value)) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (!isFileValue(v)) {
          errors.push(
            `"${input.label}" contains an invalid file value (expected data URI or URL)`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
