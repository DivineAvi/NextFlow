"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GitBranch, LayoutDashboard, Workflow } from "lucide-react";
import { cn } from "@nextflow/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workflows", href: "/dashboard", icon: Workflow },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-zinc-800/60 bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <GitBranch size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold text-zinc-100 tracking-tight">NextFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info — email only, no logout */}
      {email && (
        <div className="border-t border-zinc-800/60 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              {email[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs text-zinc-300">{email}</span>
              <span className="text-[10px] text-zinc-600">Free</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
