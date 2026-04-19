import {
  FileText,
  Sparkles,
  ImageIcon,
  Film,
  Crop,
  AlignLeft,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { EdgeTone } from "@/ui/tones/tones";
import { LLMNodeIcon, TextNodeIcon } from "@nextflow/ui";
import {NodeRegistry} from "@nextflow/core";
import { NODE_DEFINATIONS } from "@/ui/workflow-builder/type";
/** Lucide icons or custom SVG components. */
export type SidebarNodeIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export type NodeCategory = "Input" | "AI" | "Image" | "Video" | "Utility";


export interface SidebarNode {
  id: string;
  label: string;
  /** Must match the key registered in `nodeTypes` on the canvas. */
  type: string;
  description: string;
  icon: SidebarNodeIcon;
  category: NodeCategory;
  /** Optional keyboard shortcut hint shown in the dropdown. */
  shortcut?: string;
}

export const SIDEBAR_NODES: SidebarNode[] = [
  // ── Input ─────────────────────────────────────────────────────────────

  {
    id: NODE_DEFINATIONS.LLMNodeDefination.type,
    label: NODE_DEFINATIONS.LLMNodeDefination.title,
    type: NODE_DEFINATIONS.LLMNodeDefination.type,
    description: NODE_DEFINATIONS.LLMNodeDefination.description,
    icon: LLMNodeIcon,
    category: 'AI',
    shortcut: 'Ctrl+L',
  },
  {
    id: NODE_DEFINATIONS.TextNodeDefination.type,
    label: NODE_DEFINATIONS.TextNodeDefination.title,
    type: NODE_DEFINATIONS.TextNodeDefination.type,
    description: NODE_DEFINATIONS.TextNodeDefination.description,
    icon: TextNodeIcon,
    category: 'Input',
    shortcut: 'Ctrl+T',
  },
  {
    id: NODE_DEFINATIONS.ImageCropNodeDefination.type,
    label: NODE_DEFINATIONS.ImageCropNodeDefination.title,
    type: NODE_DEFINATIONS.ImageCropNodeDefination.type,
    description: NODE_DEFINATIONS.ImageCropNodeDefination.description,
    icon: ImageIcon,
    category: 'Image',
    shortcut: 'Ctrl+I',
  },

  {
    id: NODE_DEFINATIONS.ExtractFrameNodeDefination.type,
    label: NODE_DEFINATIONS.ExtractFrameNodeDefination.title,
    type: NODE_DEFINATIONS.ExtractFrameNodeDefination.type,
    description: NODE_DEFINATIONS.ExtractFrameNodeDefination.description,
    icon: Film,
    category: 'Video',
    shortcut: 'Ctrl+E',
  },
  {
    id: NODE_DEFINATIONS.UploadImageNodeDefination.type,
    label: NODE_DEFINATIONS.UploadImageNodeDefination.title,
    type: NODE_DEFINATIONS.UploadImageNodeDefination.type,
    description: NODE_DEFINATIONS.UploadImageNodeDefination.description,
    icon: ImageIcon,
    category: 'Input',
    shortcut: 'Ctrl+U',
  },
  {
    id: NODE_DEFINATIONS.UploadVideoNodeDefination.type,
    label: NODE_DEFINATIONS.UploadVideoNodeDefination.title,
    type: NODE_DEFINATIONS.UploadVideoNodeDefination.type,
    description: NODE_DEFINATIONS.UploadVideoNodeDefination.description,
    icon: Film,
    category: 'Input',
    shortcut: 'Ctrl+V',
  },
];
  
/** All unique categories in display order. */
export const NODE_CATEGORIES: NodeCategory[] = ["Input", "AI", "Image", "Video", "Utility"];
