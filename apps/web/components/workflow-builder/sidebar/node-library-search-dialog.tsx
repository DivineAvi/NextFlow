"use client";

import { Dialog, DialogContent, DialogTitle, ScrollArea } from "@nextflow/ui";
import { cn } from "@nextflow/utils";
import { ArrowDown, ArrowUp, CornerDownLeft, LayoutGrid } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { SidebarNode } from "@/config/sidebar-nodes";
import { filterSidebarNodes } from "@/hooks/use-filter-sidebar-nodes";

// ---------------------------------------------------------------------------
// Internal components
// ---------------------------------------------------------------------------

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-6 min-w-6 items-center justify-center rounded-md",
        "border border-zinc-700/80 bg-zinc-800/90 px-1.5 font-mono text-[11px] font-medium text-zinc-300",
        "shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.25)]"
      )}
    >
      {children}
    </kbd>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface NodeLibrarySearchDialogProps {
  nodes: SidebarNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user picks a node from the list (e.g. add to canvas). */
  onSelect?: (node: SidebarNode) => void;
  /** Placeholder text for the search field. */
  searchPlaceholder?: string;
}

export function NodeLibrarySearchDialog({
  nodes,
  open,
  onOpenChange,
  onSelect,
  searchPlaceholder = "Search nodes…",
}: NodeLibrarySearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const searchFieldId = useId();

  const filtered = useMemo(() => filterSidebarNodes(nodes, query), [nodes, query]);

  const activeIndex =
    filtered.length === 0 ? 0 : Math.min(selectedIndex, filtered.length - 1);

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("");
    setSelectedIndex(0);
    setHoveredIndex(null);
    onOpenChange(next);
  }

  function handlePick(node: SidebarNode) {
    onSelect?.(node);
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open || filtered.length === 0) return;
    const id = filtered[activeIndex]?.id;
    if (!id) return;
    itemRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, activeIndex, filtered]);

  function moveSelection(delta: number) {
    if (filtered.length === 0) return;
    setHoveredIndex(null);
    setSelectedIndex((i) => {
      const current = Math.min(i, filtered.length - 1);
      const next = current + delta;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSelection(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); moveSelection(-1); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const node = filtered[activeIndex];
      if (node) handlePick(node);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden border-zinc-800/80 bg-[#1a1a1a] p-0 shadow-2xl",
          "rounded-2xl sm:max-w-lg"
        )}
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search nodes</DialogTitle>

        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-4 py-3.5">
          <LayoutGrid className="size-5 shrink-0 text-zinc-500" strokeWidth={1.75} aria-hidden />
          <label htmlFor={searchFieldId} className="sr-only">Search nodes</label>
          <input
            ref={inputRef}
            id={searchFieldId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              setHoveredIndex(null);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-[15px] text-zinc-100",
              "placeholder:text-zinc-500",
              "outline-none"
            )}
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[min(52vh,360px)]">
          <ul className="p-2" role="list" onMouseLeave={() => setHoveredIndex(null)}>
            {filtered.length === 0 ? (
              <li className="rounded-xl px-3 py-10 text-center text-sm text-zinc-500">
                No nodes match your search.
              </li>
            ) : (
              filtered.map((node, index) => {
                const Icon = node.icon;
                const isKeyboardActive = index === activeIndex;
                const isMouseHover = hoveredIndex === index && !isKeyboardActive;
                return (
                  <li key={node.id} className="py-0.5">
                    <button
                      type="button"
                      tabIndex={-1}
                      ref={(el) => {
                        if (el) itemRefs.current.set(node.id, el);
                        else itemRefs.current.delete(node.id);
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onClick={() => handlePick(node)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        isKeyboardActive
                          ? "bg-[#2563eb] text-white shadow-sm"
                          : isMouseHover
                            ? "bg-zinc-800/90 text-zinc-200"
                            : "text-zinc-200"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          isKeyboardActive ? "bg-white/15" : "bg-zinc-800"
                        )}
                      >
                        <Icon
                          className={cn("size-[22px]", isKeyboardActive ? "text-white" : "text-zinc-300")}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-suisse text-[15px] font-semibold tracking-tight">
                            {node.label}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                              isKeyboardActive ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-400"
                            )}
                          >
                            Node
                          </span>
                        </span>
                        {node.description && (
                          <span
                            className={cn(
                              "mt-1 block min-w-0 truncate text-[13px] leading-snug",
                              isKeyboardActive ? "text-blue-100/90" : "text-zinc-500"
                            )}
                          >
                            {node.description}
                          </span>
                        )}
                      </span>
                      {isKeyboardActive && (
                        <CornerDownLeft className="size-4 shrink-0 text-white/80" strokeWidth={2} aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>

        {/* Keyboard hints */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-zinc-800/80 px-4 py-3 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5">
              <Kbd><ArrowUp className="size-3" aria-hidden /></Kbd>
              <Kbd><ArrowDown className="size-3" aria-hidden /></Kbd>
            </span>
            <span className="text-zinc-400">Navigate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd><CornerDownLeft className="size-3" aria-hidden /></Kbd>
            <span className="text-zinc-400">Select</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            <span className="text-zinc-400">Close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
