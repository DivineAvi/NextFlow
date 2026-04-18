import { PlusCircle } from "lucide-react";

/** Shown on the canvas when no nodes have been added yet. */
export function CanvasEmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-1">
          <h3 className="text-lg text-zinc-300">Add a node</h3>
          <p className="text-s text-zinc-500">
            Drag a node from the sidebar to start building.
          </p>
        </div>
      </div>
    </div>
  );
}
