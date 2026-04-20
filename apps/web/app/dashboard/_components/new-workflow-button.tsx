"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle } from "lucide-react";

export function NewWorkflowButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.id) router.push(`/workflow/${data.id}`);
    } catch (e: any) {
      setError(e.message ?? "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={create}
          className="group flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-red-800/60 bg-red-950/30 hover:border-red-700 transition-colors cursor-pointer"
        >
          <AlertCircle size={18} className="text-red-400" />
          <span className="text-[10px] text-red-400 px-3 text-center leading-tight">{error}</span>
          <span className="text-[10px] text-zinc-600">Click to retry</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 cursor-pointer"
    >
      {loading ? (
        <Loader2 size={24} className="text-zinc-400 animate-spin" />
      ) : (
        <div className="h-10 w-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-zinc-400 transition-colors">
          <Plus size={20} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        </div>
      )}
    </button>
  );
}
