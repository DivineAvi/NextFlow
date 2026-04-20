"use client";

import Link from "next/link";
import { useSidebarResize } from "@/hooks/use-sidebar-resize";
import { ScrollArea } from "@nextflow/ui";
import { cn } from "@nextflow/utils";
import { SIDEBAR_NODES } from "@/config/sidebar-nodes";
import { NodeLibrary } from "./node-library";
import { SidebarToggle } from "./sidebar-toggle";
import { SidebarResizer } from "./sidebar-resizer";
import { UserAuthButton } from "@/ui/user-auth-button";
import { ChevronLeft } from "lucide-react";

export function AppSidebar() {
  const { isCollapsed, isResizing, startResizing, toggleCollapse, currentWidth } =
    useSidebarResize();

  return (
    <aside
      style={{ width: `${currentWidth}px` }}
      className={cn(
        "group relative flex justify-between h-screen flex-col dark:bg-black bg-[#F5F5F5] text-zinc-300 border-r border-zinc-800/50 shrink-0",
        !isResizing && "transition-[width] duration-200 ease-in-out"
      )}
    >
      <div>
        <div className="flex items-center justify-between px-2 pt-2">
          <SidebarToggle toggleCollapse={toggleCollapse} />
          {!isCollapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              <ChevronLeft size={12} />
              Dashboard
            </Link>
          )}
        </div>
        <ScrollArea className="relative flex flex-1 w-full min-w-0 flex-col gap-[1px] p-2">
          <NodeLibrary nodes={SIDEBAR_NODES} isSearchable isCollapsed={isCollapsed} />
        </ScrollArea>
        <SidebarResizer startResizing={startResizing} isResizing={isResizing} />
      </div>

      <div className="p-2">
        <UserAuthButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
