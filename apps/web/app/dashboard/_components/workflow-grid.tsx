"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { NewWorkflowButton } from "./new-workflow-button";
import { WorkflowSearch } from "./workflow-search";
import { WORKFLOW_TEMPLATES } from "@/config/templates";

interface Workflow {
  id: string;
  name: string;
  updatedAt: string;
}

type Tab = "projects" | "templates";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const CARD_GRADIENTS = [
  "from-blue-950 to-zinc-900",
  "from-violet-950 to-zinc-900",
  "from-emerald-950 to-zinc-900",
  "from-rose-950 to-zinc-900",
  "from-amber-950 to-zinc-900",
  "from-cyan-950 to-zinc-900",
];

function DotPattern({ id }: { id: string }) {
  return (
    <svg className="w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`dots-${id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dots-${id})`} />
    </svg>
  );
}

function TemplateCard({ template }: { template: (typeof WORKFLOW_TEMPLATES)[0] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const useTemplate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          definition: { nodes: template.nodes, edges: template.edges },
        }),
      });
      const workflow = await res.json();
      if (workflow.id) router.push(`/workflow/${workflow.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group relative flex aspect-video w-full cursor-pointer rounded-xl bg-gradient-to-br ${template.gradient} border border-zinc-800 hover:border-zinc-600 transition-all duration-200 overflow-hidden`}
        onClick={useTemplate}
      >
        <DotPattern id={`tmpl-${template.id}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">{template.icon}</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {loading ? (
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Loader2 size={12} className="animate-spin" />
              Creating…
            </div>
          ) : (
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
              Use Template
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-zinc-300 font-medium truncate">{template.name}</span>
        <span className="text-xs text-zinc-600 leading-tight line-clamp-1">{template.description}</span>
      </div>
    </div>
  );
}

export function WorkflowGrid() {
  const [tab, setTab] = useState<Tab>("projects");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((data) => setWorkflows(Array.isArray(data) ? data : []))
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Tab bar + search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {(["projects", "templates"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <WorkflowSearch onSearch={setQuery} />
      </div>

      {/* Projects tab */}
      {tab === "projects" && (
        <>
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-zinc-600 text-sm">
              <Loader2 size={14} className="animate-spin" />
              Loading workflows…
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              <div className="flex flex-col gap-2">
                <NewWorkflowButton />
                <span className="text-sm text-zinc-300 font-medium">New Workflow</span>
              </div>

              {filteredWorkflows.map((workflow, i) => (
                <div key={workflow.id} className="flex flex-col gap-2">
                  <Link
                    href={`/workflow/${workflow.id}`}
                    className={`group flex aspect-video w-full rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} border border-zinc-800 hover:border-zinc-600 transition-all duration-200 overflow-hidden`}
                  >
                    <DotPattern id={workflow.id} />
                  </Link>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-zinc-300 font-medium truncate">{workflow.name}</span>
                    <span className="text-xs text-zinc-600">Edited {timeAgo(workflow.updatedAt)}</span>
                  </div>
                </div>
              ))}

              {filteredWorkflows.length === 0 && !loading && query === "" && (
                <div className="col-span-full py-8 text-center text-sm text-zinc-600">
                  No workflows yet. Create your first one above.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Templates tab */}
      {tab === "templates" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-zinc-600">
              No templates match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
