"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp, ChevronDown, ArrowLeft,
  Upload, Download, LayoutGrid, Workflow,
} from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { useShallow } from "zustand/react/shallow";
import { useReactFlow } from "reactflow";

export function WorkflowMenuButton() {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const { workflowName, setWorkflowName, nodes, edges, setNodes, setEdges } = useCanvasStore(
    useShallow((s) => ({
      workflowName: s.workflowName,
      setWorkflowName: s.setWorkflowName,
      nodes: s.nodes,
      edges: s.edges,
      setNodes: s.setNodes,
      setEdges: s.setEdges,
    }))
  );

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ name: workflowName, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase() || "workflow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }, [workflowName, nodes, edges]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          setNodes(data.nodes);
          setEdges(data.edges);
          if (data.name) setWorkflowName(data.name);
          setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 50);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
    setMenuOpen(false);
  }, [setNodes, setEdges, setWorkflowName, fitView]);

  return (
    <div ref={menuRef} className="relative flex items-center gap-2 bg-[var(--wf-btn-bg)] p-2 rounded-xl">
      {/* Logo + chevron button */}
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className={`flex items-center gap-1.5 h-9 px-2.5 rounded-xl border-none transition-all hover:bg-[var(--wf-btn-bg-hover)] ${
          menuOpen
            ? "border-blue-500 bg-[var(--wf-bg-surface)]"
            : "border-[var(--wf-border)] "
        }`}
      >
        <Workflow size={16} className="text-blue-400 shrink-0" />
        {menuOpen ? (
          <ChevronUp size={12} className="text-[var(--wf-text-primary)]" />
        ) : (
          <ChevronDown size={12} className="text-[var(--wf-text-primary)]" />
        )}
      </button>

      {/* Editable workflow name */}
      <input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="nodrag nopan w-10 bg-transparent outline-none text-sm font-semibold text-[var(--wf-text-primary)] placeholder:text-[var(--wf-text-muted)] min-w-0 max-w-[180px] truncate"
        placeholder="Untitled"
        spellCheck={false}
      />

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[200] w-56 rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-bg-surface)] shadow-2xl py-1.5 overflow-hidden">
          <MenuItem
            icon={<ArrowLeft size={15} />}
            label="Back"
            onClick={() => { setMenuOpen(false); router.push("/dashboard"); }}
          />

          <div className="my-1.5 border-t border-[var(--wf-border)]" />

          <MenuItem
            icon={<Upload size={15} />}
            label="Import JSON"
            onClick={() => importRef.current?.click()}
          />
          <MenuItem
            icon={<Download size={15} />}
            label="Export JSON"
            onClick={handleExport}
          />

          <div className="my-1.5 border-t border-[var(--wf-border)]" />

          <MenuItem
            icon={<LayoutGrid size={15} />}
            label="Workspaces"
            onClick={() => { setMenuOpen(false); router.push("/dashboard"); }}
            suffix={<ChevronDown size={12} className="rotate-[-90deg] text-[var(--wf-text-faint)]" />}
          />
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={importRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}

function MenuItem({
  icon, label, onClick, suffix,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  suffix?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--wf-text-primary)] hover:bg-[var(--wf-btn-bg)] transition-colors"
    >
      <span className="text-[var(--wf-text-secondary)] shrink-0">{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {suffix}
    </button>
  );
}
