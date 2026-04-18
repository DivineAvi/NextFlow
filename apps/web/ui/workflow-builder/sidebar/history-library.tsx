"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@nextflow/utils";

interface NodeRun {
  id: string;
  nodeId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  error?: string;
  startedAt?: Date;
  endedAt?: Date;
  inputs?: any;
  outputs?: any;
}

interface WorkflowRun {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  createdAt: string;
  nodeRuns: NodeRun[];
}

export function HistorySidebar() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, we would poll or subscribe via SSE to the WorkflowRun's status
    // For this prototype, we'll fetch once or mock it since the DB connection needs to be active.
    // fetch("/api/workflows/history").then(r => r.json()).then(setRuns);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-500 bg-green-500/10";
      case "FAILED": return "text-red-500 bg-red-500/10";
      case "RUNNING": return "text-yellow-500 bg-yellow-500/10";
      case "PARTIAL": return "text-orange-500 bg-orange-500/10";
      default: return "text-zinc-500 bg-zinc-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "FAILED": return <XCircle className="w-4 h-4 text-red-500" />;
      case "RUNNING": return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="flex h-full w-80 flex-col border-l border-zinc-800 bg-[#121212] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">Workflow History</h2>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {runs.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">No runs yet.</p>
        ) : (
           runs.map((run) => (
             <div key={run.id} className="flex flex-col rounded-lg border border-zinc-800/80 bg-[#1c1c1c] overflow-hidden">
               <button
                 onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                 className="flex items-center gap-3 px-3 py-2.5 text-left transition hover:bg-zinc-800/40"
               >
                 {getStatusIcon(run.status)}
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-semibold text-zinc-200 truncate">Run {run.id.slice(-6)}</p>
                   <p className="text-[10px] text-zinc-500">{new Date(run.createdAt).toLocaleString()}</p>
                 </div>
                 <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase", getStatusColor(run.status))}>
                   {run.status}
                 </span>
                 <ChevronRight className={cn("w-4 h-4 text-zinc-500 transition-transform", expandedRun === run.id && "rotate-90")} />
               </button>

               {/* Node Details (Expanded) */}
               {expandedRun === run.id && (
                 <div className="flex flex-col gap-1 border-t border-zinc-800/80 p-2 bg-zinc-900/30">
                   {run.nodeRuns?.length > 0 ? run.nodeRuns.map(nodeRun => (
                     <div key={nodeRun.id} className="px-2 py-1.5 rounded bg-zinc-800/30 border border-zinc-800 flex flex-col gap-1">
                       <div className="flex items-center justify-between">
                         <span className="text-[11px] text-zinc-300 font-medium">{nodeRun.nodeId}</span>
                         {getStatusIcon(nodeRun.status)}
                       </div>
                       {nodeRun.error && (
                         <p className="text-[10px] text-red-400">Error: {nodeRun.error}</p>
                       )}
                       {nodeRun.outputs && (
                         <div className="text-[10px] text-zinc-400 truncate">
                           Output: {JSON.stringify(nodeRun.outputs)}
                         </div>
                       )}
                     </div>
                   )) : (
                     <p className="text-[10px] text-zinc-500 pl-2">No nodes executed.</p>
                   )}
                 </div>
               )}
             </div>
           ))
        )}
      </div>
    </div>
  );
}
