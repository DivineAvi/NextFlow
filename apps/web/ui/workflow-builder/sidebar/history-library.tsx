"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2, XCircle, Loader2, Clock, AlertTriangle,
  RefreshCw, ChevronRight,
} from "lucide-react";
import { cn } from "@nextflow/utils";
import { useCanvasStore } from "@/store/canvas-store";
import { useShallow } from "zustand/react/shallow";

interface NodeRun {
  id: string;
  nodeId: string;
  nodeType?: string;
  nodeLabel?: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  error?: string;
  startedAt?: string;
  endedAt?: string;
  inputs?: any;
  outputs?: any;
}

interface WorkflowRun {
  id: string;
  scope: "FULL" | "SELECTED" | "SINGLE";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  nodeRuns: NodeRun[];
  workflow?: { name: string };
}

function durationMs(run: { startedAt?: string; endedAt?: string }): string {
  if (!run.startedAt) return "—";
  const end = run.endedAt ? new Date(run.endedAt) : new Date();
  const ms = end.getTime() - new Date(run.startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusColor(status: string) {
  return {
    COMPLETED: "text-green-400",
    FAILED:    "text-red-400",
    RUNNING:   "text-yellow-400",
    PARTIAL:   "text-orange-400",
    PENDING:   "text-zinc-500",
  }[status] ?? "text-zinc-500";
}

function StatusIcon({ status, className }: { status: string; className?: string }) {
  const cls = cn("size-3.5 shrink-0", statusColor(status), className);
  switch (status) {
    case "COMPLETED": return <CheckCircle2 className={cls} />;
    case "FAILED":    return <XCircle className={cls} />;
    case "RUNNING":   return <Loader2 className={cn(cls, "animate-spin")} />;
    case "PARTIAL":   return <AlertTriangle className={cls} />;
    default:          return <Clock className={cls} />;
  }
}

function NodeRunRow({ nr }: { nr: NodeRun }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-1.5 group">
      <div className="mt-0.5">
        <StatusIcon status={nr.status} className="size-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--wf-text-primary)] truncate font-medium">
          {nr.nodeLabel || nr.nodeType || nr.nodeId}
        </p>
        {nr.error && (
          <p className="text-[10px] text-red-400 truncate mt-0.5">✕ {nr.error}</p>
        )}
        {nr.outputs?.output && (
          <p className="text-[10px] text-[var(--wf-text-muted)] line-clamp-2 break-all mt-0.5">
            ↳ {
              typeof nr.outputs.output === "string" && nr.outputs.output.startsWith("data:")
                ? "[image data]"
                : String(nr.outputs.output)
            }
          </p>
        )}
      </div>
      <span className="text-[10px] text-[var(--wf-text-faint)] shrink-0 mt-0.5">{durationMs(nr)}</span>
    </div>
  );
}

function RunRow({ run, index, total, expanded, onToggle }: {
  run: WorkflowRun;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      {/* Run header row — styled like a sidebar item */}
      <button
        onClick={onToggle}
        className={cn(
          "flex h-9 w-full items-center gap-3 rounded-lg px-4 bg-[var(--wf-btn-bg)/20] text-sm transition-all hover:cursor-pointer hover:bg-[var(--wf-btn-bg-hover)]",
          expanded && "bg-[var(--wf-btn-bg)]"
        )}
      >
        <StatusIcon status={run.status} />
        <span className="flex-1 text-left text-sm font-medium text-[var(--wf-text-primary)] truncate">
          Run #{total - index}
        </span>
        <span className="text-[10px] text-[var(--wf-text-muted)] shrink-0">{durationMs(run)}</span>
        <ChevronRight
          size={12}
          className={cn(
            "text-[var(--wf-text-faint)] shrink-0 transition-transform duration-200",
            expanded && "rotate-90"
          )}
        />
      </button>

      {/* Expanded node list */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {/* Timestamp row */}
          <div className="flex items-center gap-2 px-4 py-1">
            <span className="text-[10px] text-[var(--wf-text-faint)]">
              {new Date(run.createdAt).toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--wf-text-faint)]">·</span>
            <span className="text-[10px] text-[var(--wf-text-faint)] capitalize">{run.scope?.toLowerCase()}</span>
          </div>

          {run.nodeRuns.length === 0 ? (
            <p className="px-4 py-1.5 text-[11px] text-[var(--wf-text-muted)]">No nodes executed yet.</p>
          ) : (
            <div className="flex flex-col pb-1">
              {run.nodeRuns.map((nr) => (
                <NodeRunRow key={nr.id} nr={nr} />
              ))}
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export function HistorySidebar() {
  const { workflowId, historySidebarOpen } = useCanvasStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      historySidebarOpen: s.historySidebarOpen,
    }))
  );
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!workflowId) return;
    try {
      const res = await fetch(`/api/runs?workflowId=${workflowId}`);
      if (!res.ok) return;
      const data = await res.json();
      setRuns(data);
    } catch {}
  }, [workflowId]);

  useEffect(() => {
    setRuns([]);
    if (!workflowId) return;
    setIsLoading(true);
    fetchRuns().finally(() => setIsLoading(false));
  }, [workflowId]);

  useEffect(() => {
    const hasActiveRun = runs.some((r) => r.status === "PENDING" || r.status === "RUNNING");
    if (!hasActiveRun) return;
    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, [runs, fetchRuns]);

  return (
    <aside className={cn(
      "flex h-screen shrink-0 flex-col border-none border-[var(--wf-border)] bg-[var(--wf-bg-sidebar)] transition-all duration-300",
      historySidebarOpen ? "w-64" : "w-0 border-l-0"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-none border-[var(--wf-border)] shrink-0">
        <h2 className="text-sm font-semibold text-[var(--wf-text-primary)]">History</h2>
        <button
          onClick={() => { setIsLoading(true); fetchRuns().finally(() => setIsLoading(false)); }}
          title="Refresh"
          className="text-[var(--wf-text-muted)] hover:text-[var(--wf-text-secondary)] transition hover:cursor-pointer hover:bg-[var(--wf-btn-bg-hover)] rounded-lg p-2"
        >
          <RefreshCw size={13} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Run list */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2">
        {runs.length === 0 ? (
          <p className="text-xs text-[var(--wf-text-muted)] text-center py-6">
            {isLoading ? "Loading…" : "No runs yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-[1px]">
            {runs.map((run, idx) => (
              <RunRow
                key={run.id}
                run={run}
                index={idx}
                total={runs.length}
                expanded={expandedRun === run.id}
                onToggle={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
