/**
 * Single source of truth for data-type → visual color tokens.
 *
 * Every edge stroke, handle fill, node border, glow, and badge derives
 * from this map. Nothing else should hard-code a color for a data type.
 */

export interface DataTypeTokens {
  /** Raw hex — used wherever a CSS string is required (SVG, inline style). */
  hex: string;
  /** CSS drop-shadow value for edge glow filters. */
  edgeGlow: string;
  /** Tailwind border class for node bodies. */
  border: string;
  /** Tailwind box-shadow class for node glow while RUNNING / COMPLETED. */
  shadow: string;
  /** Tailwind classes for the edge label badge. */
  badge: string;
  /** rgba string used as the CSS custom property --pulse-shadow-color. */
  pulseRgba: string;
}

export const DATA_TYPE_COLORS: Record<string, DataTypeTokens> = {
  string: {
    hex:       "#fcc804",
    edgeGlow:  "drop-shadow(0 0 6px #fcc80488)",
    border:    "border-yellow-500",
    shadow:    "shadow-[0_0_15px_rgba(252,200,4,0.35)]",
    badge:     "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    pulseRgba: "rgba(252,200,4,0.4)",
  },
  text: {
    hex:       "#fcc804",
    edgeGlow:  "drop-shadow(0 0 6px #fcc80488)",
    border:    "border-yellow-500",
    shadow:    "shadow-[0_0_15px_rgba(252,200,4,0.35)]",
    badge:     "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    pulseRgba: "rgba(252,200,4,0.4)",
  },
  image: {
    hex:       "#0080ff",
    edgeGlow:  "drop-shadow(0 0 6px #0080ff88)",
    border:    "border-[#0080ff]",
    shadow:    "shadow-[0_0_15px_rgba(0,128,255,0.5)]",
    badge:     "bg-[#0080ff]/20 text-[#0080ff] border-[#0080ff]/40",
    pulseRgba: "rgba(0,128,255,0.4)",
  },
  video: {
    hex:       "#e069d3",
    edgeGlow:  "drop-shadow(0 0 6px #e069d388)",
    border:    "border-[#e069d3]",
    shadow:    "shadow-[0_0_15px_rgba(224,105,211,0.5)]",
    badge:     "bg-[#e069d3]/20 text-[#e069d3] border-[#e069d3]/40",
    pulseRgba: "rgba(224,105,211,0.4)",
  },
  number: {
    hex:       "#ec0240",
    edgeGlow:  "drop-shadow(0 0 6px #ec024088)",
    border:    "border-[#ec0240]",
    shadow:    "shadow-[0_0_15px_rgba(236,2,64,0.5)]",
    badge:     "bg-[#ec0240]/20 text-[#ec0240] border-[#ec0240]/40",
    pulseRgba: "rgba(236,2,64,0.4)",
  },
  boolean: {
    hex:       "#ec0240",
    edgeGlow:  "drop-shadow(0 0 6px #ec024088)",
    border:    "border-[#ec0240]",
    shadow:    "shadow-[0_0_15px_rgba(236,2,64,0.5)]",
    badge:     "bg-[#ec0240]/20 text-[#ec0240] border-[#ec0240]/40",
    pulseRgba: "rgba(236,2,64,0.4)",
  },
  any: {
    hex:       "#71717a",
    edgeGlow:  "drop-shadow(0 0 4px #71717a66)",
    border:    "border-zinc-500",
    shadow:    "shadow-[0_0_15px_rgba(113,113,122,0.35)]",
    badge:     "bg-zinc-700/50 text-zinc-400 border-zinc-600/40",
    pulseRgba: "rgba(113,113,122,0.4)",
  },
};

/** Fallback for unknown types. */
const FALLBACK = DATA_TYPE_COLORS.any;

/** Look up color tokens for a data type string; falls back to "any". */
export function getTypeColor(type: string): DataTypeTokens {
  return DATA_TYPE_COLORS[type] ?? FALLBACK;
}

/**
 * Legacy tone names used in node components (e.g. tone="blue").
 * Maps tone → the equivalent data type so node borders stay consistent.
 */
export const TONE_TO_DATA_TYPE: Record<string, string> = {
  yellow: "string",
  blue:   "image",
  pink:   "video",
  orange: "number",
  green:  "string",
  purple: "string",
  zinc:   "any",
  gray:   "any",
};

/** Resolve a legacy tone name to its color tokens. */
export function getToneColor(tone: string): DataTypeTokens {
  return getTypeColor(TONE_TO_DATA_TYPE[tone] ?? "any");
}
