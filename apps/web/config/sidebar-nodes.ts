import { LucideImage, LucideText, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/** Lucide icons or custom SVG components. */
export type SidebarNodeIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export interface SidebarNode {
  id: string;
  label: string;
  /** Matches the key registered in `nodeTypes` on the canvas. */
  type: string;
  description: string;
  icon: SidebarNodeIcon;
  iconColor?: string;
}

export const SIDEBAR_NODES: SidebarNode[] = [
  {
    id: "text-node",
    label: "Text Node",
    type: "text_node",
    description: "A text node is a node that can be used to create a text input.",
    icon: LucideText,
  },
  {
    id: "image-node",
    label: "Image Node",
    type: "image-node",
    description: "An image node is a node that can be used to create an image input.",
    icon: LucideImage,
  },
];
