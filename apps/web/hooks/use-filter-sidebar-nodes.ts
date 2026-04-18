import type { SidebarNode } from "@/config/sidebar-nodes";

/**
 * Filters sidebar nodes by label, description, and type (case-insensitive).
 * Pure function — kept separate from the sidebar config so it can be
 * tested independently and reused across search dialogs.
 */
export function filterSidebarNodes(
  nodes: SidebarNode[],
  query: string,
): SidebarNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  return nodes.filter(({ label, description, type }) => {
    const l = label.toLowerCase();
    const d = description.toLowerCase();
    const t = type.toLowerCase();
    return l.includes(q) || d.includes(q) || t.includes(q);
  });
}
