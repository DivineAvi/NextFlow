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
import SidebarItem from "./sidebar-item";

export function AppSidebar() {
  const { isCollapsed, isResizing, startResizing, toggleCollapse, currentWidth } =
    useSidebarResize();

  return (
    <aside
      style={{ width: `${currentWidth}px` }}
      className={cn(
        "group relative flex justify-between h-screen flex-col bg-[var(--wf-bg-sidebar)] text-[var(--wf-text-secondary)] border-none shrink-0",
        !isResizing && "transition-[width] duration-200 ease-in-out"
      )}
    >
      <div>
        <div className="flex items-center">
          <SidebarToggle toggleCollapse={toggleCollapse} />
        </div>
        <ScrollArea className="relative flex flex-1 w-full min-w-0 flex-col gap-[1px] p-2">
        <SidebarItem icon_url="https://optim-images.krea.ai/https---s-krea-ai-icons-HomeIcon-png-128.webp " label="Home" isCollapsed={isCollapsed} />
        <SidebarItem icon_url="https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-128.webp" label="Node Editor" isCollapsed={isCollapsed} />
        </ScrollArea>
        <ScrollArea className="relative flex flex-1 w-full min-w-0 flex-col gap-[1px] p-2">

          <NodeLibrary nodes={SIDEBAR_NODES} isSearchable isCollapsed={isCollapsed} />
        </ScrollArea>
        <SidebarResizer startResizing={startResizing} isResizing={isResizing} />
      </div>

      <div className="p-2 relative flex group">
        <UserAuthButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
