import { SidebarNode } from "@/config/sidebar-nodes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@nextflow/ui";
import { cn } from "@nextflow/utils";

interface NodeLibraryItemProps {
  node: SidebarNode;
  isCollapsed: boolean;
  onDragStart: (e: React.DragEvent, nodeType: string) => void;
  onClick: (node: SidebarNode) => void;
}

export default function NodeLibraryItem({ node, isCollapsed, onDragStart, onClick }: NodeLibraryItemProps) {
  const Icon = node.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
          onClick={() => onClick(node)}
          className={cn(
                      "flex h-9 w-full rounded-lg py-2 text-[var(--wf-text-primary)] transition-all hover:cursor-pointer hover:bg-[var(--wf-btn-bg)]",
                      isCollapsed ? "justify-start px-2" : "justify-start gap-3 px-4"
          )}
        >
          {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
          {node.icon_url && <img src={node.icon_url} alt="icon" className="w-5 h-5 shrink-0" />}
          <span
            className={cn(
              "font-suisse text-sm font-medium whitespace-nowrap transition-all duration-300 truncate",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            {node.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={!isCollapsed} hideWhenDetached>
        {node.label}
      </TooltipContent>
    </Tooltip>
  );
}