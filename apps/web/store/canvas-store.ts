import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from "reactflow";

const MAX_HISTORY = 50;

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

interface ExecutionState {
  isRunning: boolean;
  runId: string | null;
  // Map of nodeId → { status, output }
  nodeStatuses: Record<string, { status: string; output?: any }>;
}

interface CanvasStore {
  // --- Core ReactFlow State ---
  nodes: Node[];
  edges: Edge[];

  // --- Workflow Persistence ---
  workflowId: string | null;
  workflowName: string;

  // --- Sidebar Bridge ---
  pendingNodeType: string | null;
  hoveredEdgeId: string | null;

  // --- Execution State ---
  execution: ExecutionState;

  // --- Undo / Redo ---
  history: HistoryEntry[];
  historyIndex: number;

  // --- Core ReactFlow Actions ---
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;

  // --- Data Management ---
  updateNodeData: (nodeId: string, data: Record<string, any>) => void;
  updateEdgeData: (edgeId: string, data: Record<string, any>) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // --- Sidebar Bridge ---
  requestAddNode: (type: string) => void;
  clearPendingNode: () => void;
  setHoveredEdgeId: (id: string | null) => void;

  // --- Workflow Persistence ---
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;

  // --- Execution ---
  setExecutionRunning: (runId: string) => void;
  setExecutionIdle: () => void;
  applyNodeStatuses: (statuses: Record<string, { status: string; output?: any }>) => void;

  // --- Undo / Redo ---
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: "Untitled Workflow",
  pendingNodeType: null,
  hoveredEdgeId: null,
  execution: {
    isRunning: false,
    runId: null,
    nodeStatuses: {},
  },
  history: [],
  historyIndex: -1,

  // ReactFlow boilerplate — delegates mutations to ReactFlow internals
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  updateNodeData: (nodeId, newData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),

  updateEdgeData: (edgeId, newData) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, ...newData } } : edge
      ),
    })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  requestAddNode: (type) => set({ pendingNodeType: type }),
  clearPendingNode: () => set({ pendingNodeType: null }),
  setHoveredEdgeId: (id) => set({ hoveredEdgeId: id }),

  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  setExecutionRunning: (runId) =>
    set((state) => ({
      execution: {
        ...state.execution,
        isRunning: true,
        runId,
        // Reset statuses to RUNNING for all nodes
        nodeStatuses: Object.fromEntries(
          state.nodes.map((n) => [n.id, { status: "RUNNING" }])
        ),
      },
    })),

  setExecutionIdle: () =>
    set((state) => ({
      execution: { ...state.execution, isRunning: false },
    })),

  applyNodeStatuses: (statuses) => {
    // Update both execution state and node data.status / data.output
    set((state) => ({
      execution: {
        ...state.execution,
        nodeStatuses: { ...state.execution.nodeStatuses, ...statuses },
      },
      nodes: state.nodes.map((n) => {
        const s = statuses[n.id];
        if (!s) return n;
        return {
          ...n,
          data: {
            ...n.data,
            status: s.status,
            ...(s.output !== undefined ? { output: s.output } : {}),
          },
        };
      }),
    }));
  },

  // --- Undo / Redo ---
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    // Discard any "future" history when a new action happens
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
