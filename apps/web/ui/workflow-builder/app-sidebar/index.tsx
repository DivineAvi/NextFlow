"use client";

import { useSidebarResize } from "./use-sidebar-resize";
import { ScrollArea } from "@nextflow/ui";
import { cn } from "@nextflow/utils";
import { SIDEBAR_NODES } from "./use-sidebar-config";
import { NodeLibrary } from "./node-library";
import { SidebarToggle } from "./sidebar-toggle";
import { SidebarResizer } from "./sidebar-resizer";
export function Sidebar() {
  const {
    isCollapsed,
    isResizing,
    startResizing,
    toggleCollapse,
    currentWidth,
  } = useSidebarResize();

  return (
    <aside
      style={{ width: `${currentWidth}px` }}
      className={cn(
        "group relative flex h-screen flex-col dark:bg-black bg-[#F5F5F5] text-zinc-300 border-r border-zinc-800/50 shrink-0",

        !isResizing && "transition-[width] duration-200 ease-in-out"
      )}
    >

      <SidebarToggle toggleCollapse={toggleCollapse} />
      <ScrollArea className="relative flex w-full min-w-0 flex-col gap-[1px] p-2">
        <NodeLibrary
          nodes={SIDEBAR_NODES}
          isSearchable
          isCollapsed={isCollapsed}
        />
      </ScrollArea>
  
      <SidebarResizer startResizing={startResizing} isResizing={isResizing} />
    </aside>
  );
}
