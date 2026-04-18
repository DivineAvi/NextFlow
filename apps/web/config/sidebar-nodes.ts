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
import type { EdgeTone } from "@/ui/workflow-builder/canvas/edges/custom-edge";

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
  /** Colour hint for the edge that comes out of this node. */
  tone: EdgeTone;
  category: NodeCategory;
  /** Optional keyboard shortcut hint shown in the dropdown. */
  shortcut?: string;
}

export const SIDEBAR_NODES: SidebarNode[] = [
  // ── Input ─────────────────────────────────────────────────────────────
  {
    id: "text-node",
    label: "Text",
    type: "text_node",
    description: "A free-form text input. Pipe it into any node that accepts a string.",
    icon: AlignLeft,
    tone: "yellow",
    category: "Input",
    shortcut: "T",
  },
  {
    id: "upload-image-node",
    label: "Upload Image",
    type: "upload_image",
    description: "Upload a JPG, PNG, WebP, or GIF and expose it as an image URL.",
    icon: ImageIcon,
    tone: "orange",
    category: "Input",
  },
  {
    id: "upload-video-node",
    label: "Upload Video",
    type: "upload_video",
    description: "Upload an MP4, MOV, or WebM and expose it as a video URL.",
    icon: Film,
    tone: "orange",
    category: "Input",
  },

  // ── AI ────────────────────────────────────────────────────────────────
  {
    id: "llm-node",
    label: "Run LLM",
    type: "llm_node",
    description: "Call Gemini (or any configured model) with a prompt and optional images.",
    icon: Sparkles,
    tone: "blue",
    category: "AI",
    shortcut: "L",
  },

  // ── Image ─────────────────────────────────────────────────────────────
  {
    id: "crop-image-node",
    label: "Crop Image",
    type: "crop_image",
    description: "Crop an image to a percentage-based rectangle via FFmpeg.",
    icon: Crop,
    tone: "orange",
    category: "Image",
  },
  {
    id: "extract-frame-node",
    label: "Extract Frame",
    type: "extract_frame",
    description: "Grab a single frame from a video at a given timestamp.",
    icon: FileText,
    tone: "zinc",
    category: "Video",
  },
];

/** All unique categories in display order. */
export const NODE_CATEGORIES: NodeCategory[] = ["Input", "AI", "Image", "Video", "Utility"];
