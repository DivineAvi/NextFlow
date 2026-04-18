import { cn } from "@nextflow/utils";

interface SidebarResizerProps {
  startResizing: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export function SidebarResizer({ startResizing, isResizing }: SidebarResizerProps) {
  return (
    <div
      onMouseDown={startResizing}
      aria-hidden
      className={cn(
        "absolute -right-1.5 top-0 z-50 h-full w-3 cursor-col-resize flex items-center justify-center transition-opacity",
        isResizing ? "opacity-100" : "opacity-0 focus:opacity-100"
      )}
    >
      <div className="h-full w-0.5 bg-zinc-300/50" />
    </div>
  );
}
