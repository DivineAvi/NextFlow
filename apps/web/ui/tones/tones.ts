/**
 * Design tokens for the workflow builder UI.
 *
 * - Field tones  → surface controls (textarea, text-field, toggle, upload zone).
 * - Accent tones → React Flow handles and connection chrome.
 */
// ---------------------------------------------------------------------------
// Tone system for edges — maps to the AccentTone palette
// ---------------------------------------------------------------------------
export type EdgeTone = "yellow" | "orange" | "blue" | "zinc" | "green" | "pink" | "purple" | "gray" | "brown" | "black" | "white";

export const EDGE_COLORS: Record<EdgeTone, { stroke: string; glow: string; badge: string }> = {
  yellow: {
    stroke: "#fcc804",
    glow: "drop-shadow(0 0 6px #fcc80488)",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  orange: {
    stroke: "#f97316",
    glow: "drop-shadow(0 0 6px #f9731688)",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  blue: {
    stroke: "#3b82f6",
    glow: "drop-shadow(0 0 6px #3b82f688)",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  zinc: {
    stroke: "#71717a",
    glow: "drop-shadow(0 0 4px #71717a66)",
    badge: "bg-zinc-700/50 text-zinc-400 border-zinc-600/40",
  },
  green: {
    stroke: "#22c55e",
    glow: "drop-shadow(0 0 6px #22c55e88)",
    badge: "bg-green-500/20 text-green-300 border-green-500/40",
  },
  pink: {
    stroke: "#f472b6",
    glow: "drop-shadow(0 0 6px #f472b688)",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
  purple: {
    stroke: "#a855f7",
    glow: "drop-shadow(0 0 6px #a855f788)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  gray: {
    stroke: "#71717a",
    glow: "drop-shadow(0 0 6px #71717a88)",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  },
  brown: {
    stroke: "#a855f7",
    glow: "drop-shadow(0 0 6px #a855f788)",
    badge: "bg-brown-500/20 text-brown-300 border-brown-500/40",
  },
  black: {
    stroke: "#000000",
    glow: "drop-shadow(0 0 6px #00000088)",
    badge: "bg-black-500/20 text-black-300 border-black-500/40",
  },
  white: {
    stroke: "#ffffff",
    glow: "drop-shadow(0 0 6px #ffffff88)",
    badge: "bg-white-500/20 text-white-300 border-white-500/40",
  },
};

// ---------------------------------------------------------------------------
// Field controls
// ---------------------------------------------------------------------------


export type FieldTone = "dark" | "light" | "neutral";

export const inputSurfaceTone: Record<FieldTone, string> = {
  dark: "bg-[#171717] focus:border-[#525252]",
  light: "bg-[#f5f5f5] focus:border-[#525252]",
  neutral: "bg-[#e5e5e5] focus:border-[#525252]",
};

export const inputTextTone: Record<FieldTone, string> = {
  dark: "text-white placeholder:text-zinc-500",
  light: "text-zinc-900 placeholder:text-zinc-500",
  neutral: "text-zinc-900 placeholder:text-zinc-500",
};

export const toggleTrackTone: Record<FieldTone, string> = {
  dark: "border-transparent bg-[#171717]",
  light: "border-zinc-300 bg-[#f5f5f5]",
  neutral: "border-zinc-400 bg-[#e5e5e5]",
};

export const uploadZoneTone: Record<FieldTone, string> = {
  dark: "border-zinc-700 bg-[#171717] hover:border-zinc-600 text-zinc-500",
  light: "border-zinc-300 bg-[#f5f5f5]/80 hover:border-zinc-400 text-zinc-600",
  neutral: "border-zinc-400 bg-[#e5e5e5]/80 hover:border-zinc-500 text-zinc-600",
};

// ---------------------------------------------------------------------------
// React Flow handles
// ---------------------------------------------------------------------------

export type AccentTone = "yellow" | "orange" | "blue" | "zinc" | "pink" | "purple" | "gray" | "brown" | "black" | "white";

/** Hex fill used in Handle `style` props (programmatic, cannot use Tailwind). */
export const accentHandleHex: Record<AccentTone, string> = {
  yellow: "#fcc804",
  orange: "#f59e42",
  blue: "#3b82f6",
  zinc: "#71717a",
  pink: "#f472b6",
  purple: "#a855f7",
  gray: "#71717a",
  brown: "#a855f7",
  black: "#000000",
  white: "#ffffff",
};
