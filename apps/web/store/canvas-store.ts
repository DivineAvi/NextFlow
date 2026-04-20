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
  triggerRunId: string | null;
  nodeStatuses: Record<string, { status: string; output?: any; error?: string }>;
}

interface CanvasStore {
  nodes: Node[];
  edges: Edge[];

  workflowId: string | null;
  workflowName: string;

  pendingNodeType: string | null;
  hoveredEdgeId: string | null;

  execution: ExecutionState;

  history: HistoryEntry[];
  historyIndex: number;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;

  updateNodeData: (nodeId: string, data: Record<string, any>) => void;
  updateEdgeData: (edgeId: string, data: Record<string, any>) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  requestAddNode: (type: string) => void;
  clearPendingNode: () => void;
  setHoveredEdgeId: (id: string | null) => void;

  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;

  setExecutionRunning: (runId: string, triggerRunId: string) => void;
  setExecutionIdle: () => void;
  applyNodeStatuses: (statuses: Record<string, { status: string; output?: any; error?: string }>) => void;

  historySidebarOpen: boolean;
  toggleHistorySidebar: () => void;

  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;

  theme: "dark" | "light";
  toggleTheme: () => void;

  runWorkflow: () => Promise<void>;
  runNode: (nodeId: string) => Promise<void>;
  runSelected: () => Promise<void>;
  runConnectedComponent: (nodeIds: string[]) => Promise<void>;

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
  workflowName: "Untitled",
  pendingNodeType: null,
  hoveredEdgeId: null,
  execution: {
    isRunning: false,
    runId: null,
    triggerRunId: null,
    nodeStatuses: {},
  },
  history: [],
  historyIndex: -1,
  historySidebarOpen: false,
  toggleHistorySidebar: () => set((s) => ({ historySidebarOpen: !s.historySidebarOpen })),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  theme: "dark",
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

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

  setExecutionRunning: (runId, triggerRunId) =>
    set((state) => ({
      execution: {
        ...state.execution,
        isRunning: true,
        runId,
        triggerRunId,
        nodeStatuses: Object.fromEntries(
          state.nodes.map((n) => [n.id, { status: "PENDING" }])
        ),
      },
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: "PENDING", error: undefined, output: undefined },
      })),
    })),

  setExecutionIdle: () =>
    set((state) => ({
      execution: { ...state.execution, isRunning: false },
    })),

  applyNodeStatuses: (statuses) => {
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
            ...(s.error !== undefined ? { error: s.error } : {}),
          },
        };
      }),
    }));
  },

  runWorkflow: async () => {
    const { nodes, edges, workflowId, execution, setExecutionRunning, setExecutionIdle, setWorkflowId } = get();
    if (execution.isRunning) return;
    set((s) => ({ execution: { ...s.execution, isRunning: true } }));
    try {
      const res = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, nodes, edges, scope: "FULL" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Run failed"); }
      const { runId, triggerRunId, workflowId: newWorkflowId } = await res.json();
      if (newWorkflowId && newWorkflowId !== workflowId) setWorkflowId(newWorkflowId);
      setExecutionRunning(runId, triggerRunId);
    } catch (e: any) { console.error("runWorkflow error:", e.message); setExecutionIdle(); }
  },

  runNode: async (nodeId: string) => {
    const { nodes, edges, workflowId, execution, setExecutionRunning, setExecutionIdle, setWorkflowId } = get();
    if (execution.isRunning) return;
    set((s) => ({ execution: { ...s.execution, isRunning: true } }));

    // Collect nodeId + all its ancestors via backwards BFS
    const included = new Set<string>();
    const queue = [nodeId];
    while (queue.length > 0) {
      const cur = queue.pop()!;
      if (included.has(cur)) continue;
      included.add(cur);
      for (const e of edges) {
        if (e.target === cur && !included.has(e.source)) queue.push(e.source);
      }
    }
    const subNodes = nodes.filter((n) => included.has(n.id));
    const subEdges = edges.filter((e) => included.has(e.source) && included.has(e.target));

    try {
      const res = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, nodes: subNodes, edges: subEdges, scope: "SINGLE" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Run failed"); }
      const { runId, triggerRunId, workflowId: newWorkflowId } = await res.json();
      if (newWorkflowId && newWorkflowId !== workflowId) setWorkflowId(newWorkflowId);
      setExecutionRunning(runId, triggerRunId);
    } catch (e: any) { console.error("runNode error:", e.message); setExecutionIdle(); }
  },

  runSelected: async () => {
    const { nodes, edges, workflowId, execution, setExecutionRunning, setExecutionIdle, setWorkflowId } = get();
    if (execution.isRunning) return;
    set((s) => ({ execution: { ...s.execution, isRunning: true } }));
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) { setExecutionIdle(); return; }
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target));

    try {
      const res = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, nodes: selectedNodes, edges: selectedEdges, scope: "SELECTED" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Run failed"); }
      const { runId, triggerRunId, workflowId: newWorkflowId } = await res.json();
      if (newWorkflowId && newWorkflowId !== workflowId) setWorkflowId(newWorkflowId);
      setExecutionRunning(runId, triggerRunId);
    } catch (e: any) { console.error("runSelected error:", e.message); setExecutionIdle(); }
  },

  runConnectedComponent: async (nodeIds: string[]) => {
    const { nodes, edges, workflowId, execution, setExecutionRunning, setExecutionIdle, setWorkflowId } = get();
    if (execution.isRunning) return;
    set((s) => ({ execution: { ...s.execution, isRunning: true } }));

    // BFS both directions from every seed node — unions all connected components
    const included = new Set<string>();
    const queue = [...nodeIds];
    while (queue.length > 0) {
      const cur = queue.pop()!;
      if (included.has(cur)) continue;
      included.add(cur);
      for (const e of edges) {
        if (e.target === cur && !included.has(e.source)) queue.push(e.source);
        if (e.source === cur && !included.has(e.target)) queue.push(e.target);
      }
    }
    const subNodes = nodes.filter((n) => included.has(n.id));
    const subEdges = edges.filter((e) => included.has(e.source) && included.has(e.target));

    try {
      const res = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, nodes: subNodes, edges: subEdges, scope: "FULL" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Run failed"); }
      const { runId, triggerRunId, workflowId: newWorkflowId } = await res.json();
      if (newWorkflowId && newWorkflowId !== workflowId) setWorkflowId(newWorkflowId);
      setExecutionRunning(runId, triggerRunId);
    } catch (e: any) { console.error("runConnectedComponent error:", e.message); setExecutionIdle(); }
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
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
