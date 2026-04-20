"use client";

import { cn } from "@nextflow/utils";
import { Search } from "lucide-react";
import { useState } from "react";

import type { SidebarNode } from "@/config/sidebar-nodes";
import { NodeLibrarySearchDialog } from "./node-library-search-dialog";
import NodeLibraryItem from "./node-library-item";
import { useCanvasStore } from "@/store/canvas-store";

interface NodeLibraryProps {
  nodes: SidebarNode[];
  isSearchable: boolean;
  isCollapsed: boolean;
}

export function NodeLibrary({ isSearchable, nodes, isCollapsed }: NodeLibraryProps) {
  const [sectionHidden, setSectionHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const requestAddNode = useCanvasStore((s) => s.requestAddNode);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSelect = (node: SidebarNode) => {
    requestAddNode(node.type);
  };

  return (
    <>
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isCollapsed
            ? "grid-rows-[0fr] opacity-0 translate-y-[-100%]"
            : "grid-rows-[1fr] opacity-100 translate-y-0"
        )}
      >
        <div className="relative overflow-hidden">
          <button
            type="button"
            onClick={() => setSectionHidden(!sectionHidden)}
            className="flex h-9 w-full items-center justify-between truncate rounded-md px-4 text-sm font-medium hover:cursor-pointer hover:bg-zinc-200/30 hover:transition-colors hover:duration-200 dark:text-zinc-600 dark:hover:bg-zinc-800/50"
          >
            <span>Quick </span>
          </button>

          {isSearchable && !isCollapsed && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open node search"
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md p-1 text-sm font-medium hover:cursor-pointer hover:bg-zinc-200/30 hover:text-zinc-700 hover:transition-colors hover:duration-200 dark:text-zinc-600 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
            >
              <Search size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">

      {!sectionHidden &&
        nodes.map((node) => {
          return (
            <NodeLibraryItem key={node.id} node={node} isCollapsed={isCollapsed} onDragStart={onDragStart} onClick={handleSelect} />
          )
        })}
        </div>

      <NodeLibrarySearchDialog
        nodes={nodes}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSelect}
      />
    </>
  );
}
