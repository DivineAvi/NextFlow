import { create } from "zustand";
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange 
} from "reactflow";

interface CanvasStore {
  // --- ReactFlow Core State ---
  nodes: Node[];
  edges: Edge[];
  
  // --- Sidebar Canvas Bridge State ---
  pendingNodeType: string | null;
  hoveredEdgeId: string | null;

  // --- Core ReactFlow Actions ---
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  
  // --- Data Management Actions ---
  updateNodeData: (nodeId: string, data: any) => void;
  updateEdgeData: (edgeId: string, data: any) => void;
  /** Used by Sidebar to request a node creation */
  requestAddNode: (type: string) => void;
  clearPendingNode: () => void;
  setHoveredEdgeId: (id: string | null) => void;

  // --- Workflow Management ---
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  pendingNodeType: null,
  hoveredEdgeId: null,

  // ReactFlow change handlers (boilerplate for scaling)
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  updateNodeData: (nodeId: string, newData: Record<string, any>) => 
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          // MUST return a new node object AND a new data object
          return { 
            ...node, 
            data: { ...node.data, ...newData } 
          };
        }
        return node;
      }),
    })),

  updateEdgeData: (edgeId: string, newData: Record<string, any>) =>
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, ...newData } };
        }
        return edge;
      }),
    })),
  // Bridge actions
  requestAddNode: (type) => set({ pendingNodeType: type }),
  clearPendingNode: () => set({ pendingNodeType: null }),
  setHoveredEdgeId: (id) => set({ hoveredEdgeId: id }),

  // setters for hydration/serialization
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));