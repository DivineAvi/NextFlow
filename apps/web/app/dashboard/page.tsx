import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { GitBranch } from "lucide-react";
import { WorkflowGrid } from "./_components/workflow-grid";
import { HeroNewWorkflowButton } from "./_components/hero-new-workflow-button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
      <main className="flex flex-1 min-w-0 flex-col overflow-y-auto">
        {/* ── Hero ── */}
        <section className="relative flex h-[340px] shrink-0 items-start overflow-hidden bg-[#0d0d0d]">
          {/* Background canvas art */}
          <div className="pointer-events-none absolute inset-0">
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-dots)" />
            </svg>
            <div className="absolute right-24 top-16 h-28 w-44 rounded-xl border border-zinc-700/50 bg-zinc-900/80 shadow-xl backdrop-blur-sm" />
            <div className="absolute right-80 top-28 h-20 w-36 rounded-xl border border-zinc-700/40 bg-zinc-900/70 shadow-lg backdrop-blur-sm" />
            <div className="absolute right-12 top-48 h-20 w-40 rounded-xl border border-zinc-700/30 bg-zinc-900/60 shadow-md backdrop-blur-sm" />
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <line x1="65%" y1="42%" x2="75%" y2="58%" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="55%" y1="60%" x2="65%" y2="42%" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="65%" cy="42%" r="3" fill="#3b82f6" />
              <circle cx="75%" cy="58%" r="3" fill="#8b5cf6" />
              <circle cx="55%" cy="60%" r="3" fill="#10b981" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 px-10 pt-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <GitBranch size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Workflow Builder</h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
              Connect every tool and model into complex automated pipelines. Build powerful workflows without writing code.
            </p>
            <HeroNewWorkflowButton />
          </div>
        </section>

        {/* ── Projects grid — fetches its own data client-side ── */}
        <section className="flex flex-col gap-6 px-10 py-8">
          <WorkflowGrid />
        </section>
      </main>
    </div>
  );
}
