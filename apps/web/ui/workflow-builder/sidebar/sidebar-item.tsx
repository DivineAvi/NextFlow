import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@nextflow/ui";
import { cn } from "@nextflow/utils";

export default function SidebarItem({ icon_url, label, isCollapsed, href }: { icon_url: string, label: string, isCollapsed: boolean, href: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex h-9 w-full rounded-lg py-2 text-[var(--wf-text-primary)] transition-all hover:cursor-pointer hover:bg-[var(--wf-btn-bg)]",
            isCollapsed ? "justify-start px-2" : "justify-start gap-3 px-4"
          )}
        >
          <img src={icon_url} alt="icon" className="w-5 h-5" />
          <span
            className={cn(
              "font-suisse text-sm font-medium whitespace-nowrap transition-all duration-300 truncate",
              isCollapsed ? "hidden w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={!isCollapsed} hideWhenDetached>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}