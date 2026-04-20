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
    hex:       "#3b82f6",
    edgeGlow:  "drop-shadow(0 0 6px #3b82f688)",
    border:    "border-blue-500",
    shadow:    "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    badge:     "bg-blue-500/20 text-blue-300 border-blue-500/40",
    pulseRgba: "rgba(59,130,246,0.4)",
  },
  video: {
    hex:       "#f472b6",
    edgeGlow:  "drop-shadow(0 0 6px #f472b688)",
    border:    "border-pink-500",
    shadow:    "shadow-[0_0_15px_rgba(244,114,182,0.5)]",
    badge:     "bg-pink-500/20 text-pink-300 border-pink-500/40",
    pulseRgba: "rgba(244,114,182,0.4)",
  },
  number: {
    hex:       "#f97316",
    edgeGlow:  "drop-shadow(0 0 6px #f9731688)",
    border:    "border-orange-500",
    shadow:    "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    badge:     "bg-orange-500/20 text-orange-300 border-orange-500/40",
    pulseRgba: "rgba(249,115,22,0.4)",
  },
  boolean: {
    hex:       "#f97316",
    edgeGlow:  "drop-shadow(0 0 6px #f9731688)",
    border:    "border-orange-500",
    shadow:    "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    badge:     "bg-orange-500/20 text-orange-300 border-orange-500/40",
    pulseRgba: "rgba(249,115,22,0.4)",
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
