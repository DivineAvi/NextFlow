import { SidebarNode } from "@/config/sidebar-nodes";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@nextflow/ui";
import { cn } from "@nextflow/utils";

export default function NodeLibraryItem({ node, isCollapsed, onDragStart }: { node: SidebarNode, isCollapsed: boolean, onDragStart: (e: React.DragEvent, nodeType: string) => void }) {
  const Icon = node.icon;
  return (
    <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className="flex w-full items-center justify-start"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex h-9 w-full items-center rounded-lg py-2 text-white transition-all hover:cursor-pointer",
                      isCollapsed ? "justify-start px-2" : "justify-start gap-3 px-4"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span
                      className={cn(
                        "font-suisse text-sm font-medium whitespace-nowrap transition-all duration-300 truncate",
                        isCollapsed ? "hidden w-0 opacity-0" : "w-auto opacity-100"
                      )}
                    >
                      {node.label}
                    </span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" hidden={!isCollapsed} hideWhenDetached>
                {node.label}
              </TooltipContent>
            </Tooltip>
  );
}