import { create } from "zustand";

/**
 * Lightweight bridge between the sidebar and the ReactFlow canvas.
 *
 * The sidebar calls `requestAddNode(type)` when the user clicks "Add to Canvas".
 * `EditorCanvasInner` watches `pendingNodeType` and resolves it with the real
 * `addNodes` + `screenToFlowPosition` hooks, then clears `pendingNodeType`.
 */
interface CanvasStore {
  /** Set by the sidebar; consumed + cleared by the canvas. */
  pendingNodeType: string | null;
  requestAddNode: (type: string) => void;
  clearPendingNode: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  pendingNodeType: null,
  requestAddNode: (type) => set({ pendingNodeType: type }),
  clearPendingNode: () => set({ pendingNodeType: null }),
}));
