"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function HeroNewWorkflowButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const create = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.id) router.push(`/workflow/${data.id}`);
    } catch (e) {
      console.error("Failed to create workflow:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={create}
      disabled={loading}
      className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-lg hover:bg-zinc-100 transition-colors disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Creating…
        </>
      ) : (
        <>
          New Workflow
          <ArrowRight size={14} strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}
