/**
 * Design tokens for the workflow builder UI.
 *
 * - Field tones  → surface controls (textarea, text-field, toggle, upload zone).
 * - Accent tones → React Flow handles and connection chrome.
 */

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
  dark: "border-zinc-700 bg-[#171717]/50 hover:border-zinc-600 text-zinc-500",
  light: "border-zinc-300 bg-[#f5f5f5]/80 hover:border-zinc-400 text-zinc-600",
  neutral: "border-zinc-400 bg-[#e5e5e5]/80 hover:border-zinc-500 text-zinc-600",
};

// ---------------------------------------------------------------------------
// React Flow handles
// ---------------------------------------------------------------------------

export type AccentTone = "yellow" | "orange" | "blue" | "zinc";

/** Hex fill used in Handle `style` props (programmatic, cannot use Tailwind). */
export const accentHandleHex: Record<AccentTone, string> = {
  yellow: "#fcc804",
  orange: "#f59e42",
  blue: "#3b82f6",
  zinc: "#71717a",
};
