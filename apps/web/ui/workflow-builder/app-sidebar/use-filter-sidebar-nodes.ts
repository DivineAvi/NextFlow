import type { SidebarNode } from "./use-sidebar-config";

/**
 * Filters sidebar nodes by label and description (case-insensitive).
 * Keeps matching logic in one place so search UI and tests stay aligned.
 */
export function filterSidebarNodes(nodes: SidebarNode[], query: string): SidebarNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  return nodes.filter((node) => {
    const label = node.label.toLowerCase();
    const description = node.description.toLowerCase();
    const type = node.type.toLowerCase();
    return label.includes(q) || description.includes(q) || type.includes(q);
  });
}
