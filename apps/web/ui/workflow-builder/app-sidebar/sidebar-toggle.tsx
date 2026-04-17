import { cn } from "@nextflow/utils";
import { PanelLeft } from "lucide-react";

export function SidebarToggle({ toggleCollapse }: { toggleCollapse: () => void }) {
  return (
      <div className="flex flex-col gap-2 p-2">
        <div className="flex h-12 w-full items-center justify-start">
          <button
            onClick={toggleCollapse}
            className={cn(
              "hover:cursor-pointer transition-background-color duration-200",
              "focus-visible:border-ring focus-visible:ring-ring/50",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-book whitespace-nowrap transition-all outline-none",
              "focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              "text-zinc-500 dark:text-zinc-400",
              "hover:text-zinc-700 dark:hover:text-zinc-200",
              "hover:bg-zinc-200/30 dark:hover:bg-zinc-800/50",
              "size-9 rounded-md"
            )}
          >
            <PanelLeft size={20} />
          </button>
        </div>
      </div>
  );
}