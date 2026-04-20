export interface NodeAccentColors {
  hex: string;
  pulseRgba: string;
  /** Full-opacity border color (selected / completed / running) */
  borderColor: string;
  /** Full glow shadow (selected / completed) */
  activeShadow: string;
  /** Dim border color for idle (unselected) state */
  idleBorderColor: string;
  /** Soft glow shadow for idle state */
  idleShadow: string;
}

export const NODE_TYPE_COLORS: Record<string, NodeAccentColors> = {
  llm_node: {
    hex:             "#3b82f6",
    pulseRgba:       "rgba(59,130,246,0.45)",
    borderColor:     "#3b82f6",
    activeShadow:    "0 0 16px rgba(59,130,246,0.45)",
    idleBorderColor: "rgba(59,130,246,0.28)",
    idleShadow:      "0 0 10px rgba(59,130,246,0.14)",
  },
  text_node: {
    hex:             "#f59e0b",
    pulseRgba:       "rgba(245,158,11,0.45)",
    borderColor:     "#f59e0b",
    activeShadow:    "0 0 16px rgba(245,158,11,0.4)",
    idleBorderColor: "rgba(245,158,11,0.28)",
    idleShadow:      "0 0 10px rgba(245,158,11,0.13)",
  },
  upload_image_node: {
    hex:             "#3b82f6",
    pulseRgba:       "rgba(59,130,246,0.45)",
    borderColor:     "#3b82f6",
    activeShadow:    "0 0 16px rgba(59,130,246,0.45)",
    idleBorderColor: "rgba(59,130,246,0.28)",
    idleShadow:      "0 0 10px rgba(59,130,246,0.14)",
  },
  upload_video_node: {
    hex:             "#8b5cf6",
    pulseRgba:       "rgba(139,92,246,0.45)",
    borderColor:     "#8b5cf6",
    activeShadow:    "0 0 16px rgba(139,92,246,0.45)",
    idleBorderColor: "rgba(139,92,246,0.28)",
    idleShadow:      "0 0 10px rgba(139,92,246,0.14)",
  },
  image_crop_node: {
    hex:             "#3b82f6",
    pulseRgba:       "rgba(59,130,246,0.45)",
    borderColor:     "#3b82f6",
    activeShadow:    "0 0 16px rgba(59,130,246,0.45)",
    idleBorderColor: "rgba(59,130,246,0.28)",
    idleShadow:      "0 0 10px rgba(59,130,246,0.14)",
  },
  extract_frame_node: {
    hex:             "#3b82f6",
    pulseRgba:       "rgba(59,130,246,0.45)",
    borderColor:     "#3b82f6",
    activeShadow:    "0 0 16px rgba(59,130,246,0.45)",
    idleBorderColor: "rgba(59,130,246,0.28)",
    idleShadow:      "0 0 10px rgba(59,130,246,0.14)",
  },
};

const FALLBACK: NodeAccentColors = {
  hex:             "#71717a",
  pulseRgba:       "rgba(113,113,122,0.4)",
  borderColor:     "#71717a",
  activeShadow:    "0 0 14px rgba(113,113,122,0.35)",
  idleBorderColor: "rgba(113,113,122,0.22)",
  idleShadow:      "0 0 8px rgba(113,113,122,0.1)",
};

export function getNodeAccentColors(nodeType: string | undefined): NodeAccentColors {
  return (nodeType && NODE_TYPE_COLORS[nodeType]) ? NODE_TYPE_COLORS[nodeType] : FALLBACK;
}
