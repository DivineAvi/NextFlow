"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@nextflow/utils";

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

function StatusBadge({ status }: { status: string }) {
  const cls = {
    COMPLETED: "text-green-400 bg-green-500/10 border-green-500/30",
    FAILED:    "text-red-400 bg-red-500/10 border-red-500/30",
    RUNNING:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    PARTIAL:   "text-orange-400 bg-orange-500/10 border-orange-500/30",
    PENDING:   "text-zinc-400 bg-zinc-800 border-zinc-700",
  }[status] ?? "text-zinc-400 bg-zinc-800 border-zinc-700";

  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border", cls)}>
      {status}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED": return <CheckCircle2 className="size-3.5 text-green-400 shrink-0" />;
    case "FAILED":    return <XCircle      className="size-3.5 text-red-400 shrink-0" />;
    case "RUNNING":   return <Loader2      className="size-3.5 text-yellow-400 animate-spin shrink-0" />;
    case "PARTIAL":   return <AlertTriangle className="size-3.5 text-orange-400 shrink-0" />;
    default:          return <Clock        className="size-3.5 text-zinc-500 shrink-0" />;
  }
}

export function HistorySidebar() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) return;
      const data = await res.json();
      setRuns(data);
    } catch {
      // silently fail
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchRuns().finally(() => setIsLoading(false));
  }, [fetchRuns]);

  // Poll every 3 seconds while any run is active
  useEffect(() => {
    const hasActiveRun = runs.some((r) => r.status === "PENDING" || r.status === "RUNNING");
    if (!hasActiveRun) return;

    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, [runs, fetchRuns]);

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-l border-zinc-800 bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">History</h2>
        <button
          onClick={() => { setIsLoading(true); fetchRuns().finally(() => setIsLoading(false)); }}
          title="Refresh"
          className="text-zinc-500 hover:text-zinc-300 transition"
        >
          <RefreshCw size={13} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Run list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto p-2">
        {runs.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            {isLoading ? "Loading…" : "No runs yet. Click Run to start."}
          </p>
        ) : (
          runs.map((run, idx) => (
            <div
              key={run.id}
              className="rounded-lg border border-zinc-800/80 bg-[#1a1a1a] overflow-hidden"
            >
              {/* Run summary row */}
              <button
                onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/30 transition"
              >
                <StatusIcon status={run.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    Run #{runs.length - idx}
                    {run.workflow?.name ? ` · ${run.workflow.name}` : ""}
                  </p>
                  <p className="text-[10px] text-zinc-500 flex gap-1.5">
                    <span>{new Date(run.createdAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>{durationMs(run)}</span>
                    <span>·</span>
                    <span className="capitalize">{run.scope?.toLowerCase()}</span>
                  </p>
                </div>
                <StatusBadge status={run.status} />
                <ChevronRight
                  size={13}
                  className={cn("text-zinc-600 transition-transform shrink-0", expandedRun === run.id && "rotate-90")}
                />
              </button>

              {/* Node-level details */}
              {expandedRun === run.id && (
                <div className="border-t border-zinc-800/60 bg-zinc-900/20 px-2 py-1.5 flex flex-col gap-1">
                  {run.nodeRuns.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 px-1">No nodes executed yet.</p>
                  ) : (
                    run.nodeRuns.map((nr) => (
                      <div
                        key={nr.id}
                        className="flex flex-col gap-0.5 rounded bg-zinc-800/30 border border-zinc-800 px-2 py-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-zinc-200 font-medium truncate flex-1">
                            {nr.nodeLabel || nr.nodeType || nr.nodeId}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] text-zinc-500">{durationMs(nr)}</span>
                            <StatusIcon status={nr.status} />
                          </div>
                        </div>

                        {nr.error && (
                          <p className="text-[10px] text-red-400 truncate">
                            ✕ {nr.error}
                          </p>
                        )}

                        {nr.outputs?.output && (
                          <p className="text-[10px] text-zinc-400 line-clamp-2 break-all">
                            ↳ {
                              typeof nr.outputs.output === "string" && nr.outputs.output.startsWith("data:")
                                ? "[image data]"
                                : String(nr.outputs.output)
                            }
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
