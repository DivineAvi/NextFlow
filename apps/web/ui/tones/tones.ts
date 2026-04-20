/**
 * Design tokens for the workflow builder UI.
 *
 * - Field tones  → surface controls (textarea, text-field, toggle, upload zone).
 * - Accent tones → React Flow handles and connection chrome.
 *
 * Edge and handle colors are derived from the central DATA_TYPE_COLORS map in
 * tokens/data-type-colors.ts — do not hard-code colors here.
 */
import { getTypeColor, getToneColor, TONE_TO_DATA_TYPE } from "@/ui/workflow-builder/tokens/data-type-colors";

// ---------------------------------------------------------------------------
// Edge color system — derived from DATA_TYPE_COLORS
// ---------------------------------------------------------------------------
export type EdgeTone = "yellow" | "orange" | "blue" | "zinc" | "green" | "pink" | "purple" | "gray" | "brown" | "black" | "white";

function edgeEntry(type: string) {
  const t = getTypeColor(type);
  return { stroke: t.hex, glow: t.edgeGlow, badge: t.badge };
}

export const EDGE_COLORS: Record<EdgeTone, { stroke: string; glow: string; badge: string }> = {
  yellow: edgeEntry("string"),
  orange: edgeEntry("number"),
  blue:   edgeEntry("image"),
  pink:   edgeEntry("video"),
  zinc:   edgeEntry("any"),
  green:  edgeEntry("string"),
  purple: edgeEntry("string"),
  gray:   edgeEntry("any"),
  brown:  edgeEntry("any"),
  black:  { stroke: "#000000", glow: "drop-shadow(0 0 6px #00000088)", badge: "bg-zinc-900/50 text-zinc-400 border-zinc-800/40" },
  white:  { stroke: "#ffffff", glow: "drop-shadow(0 0 6px #ffffff88)", badge: "bg-white/10 text-white border-white/20" },
};

// ---------------------------------------------------------------------------
// Field controls
// ---------------------------------------------------------------------------


export type FieldTone = "dark" | "light" | "neutral";

export const inputSurfaceTone: Record<FieldTone, string> = {
  dark:    "bg-[var(--wf-bg-input)] focus:border-[var(--wf-border-subtle)]",
  light:   "bg-[var(--wf-bg-input)] focus:border-[var(--wf-border-subtle)]",
  neutral: "bg-[var(--wf-bg-input)] focus:border-[var(--wf-border-subtle)]",
};

export const inputTextTone: Record<FieldTone, string> = {
  dark:    "text-[var(--wf-text-primary)] placeholder:text-[var(--wf-text-faint)]",
  light:   "text-[var(--wf-text-primary)] placeholder:text-[var(--wf-text-faint)]",
  neutral: "text-[var(--wf-text-primary)] placeholder:text-[var(--wf-text-faint)]",
};

export const toggleTrackTone: Record<FieldTone, string> = {
  dark:    "border-transparent bg-[var(--wf-bg-input)]",
  light:   "border-transparent bg-[var(--wf-bg-input)]",
  neutral: "border-transparent bg-[var(--wf-bg-input)]",
};

export const uploadZoneTone: Record<FieldTone, string> = {
  dark:    "border-[var(--wf-border)] bg-[var(--wf-bg-input)] hover:border-[var(--wf-border-subtle)] text-[var(--wf-text-muted)]",
  light:   "border-[var(--wf-border)] bg-[var(--wf-bg-input)] hover:border-[var(--wf-border-subtle)] text-[var(--wf-text-muted)]",
  neutral: "border-[var(--wf-border)] bg-[var(--wf-bg-input)] hover:border-[var(--wf-border-subtle)] text-[var(--wf-text-muted)]",
};

// ---------------------------------------------------------------------------
// React Flow handles
// ---------------------------------------------------------------------------

export type AccentTone = "yellow" | "orange" | "blue" | "zinc" | "pink" | "purple" | "gray" | "brown" | "black" | "white";

/** Hex fill used in Handle `style` props (programmatic, cannot use Tailwind).
 *  Derived from DATA_TYPE_COLORS via TONE_TO_DATA_TYPE. */
export const accentHandleHex: Record<AccentTone, string> = Object.fromEntries(
  (["yellow","orange","blue","zinc","pink","purple","gray","brown","black","white"] as AccentTone[]).map(
    (tone) => [tone, getToneColor(tone).hex]
  )
) as Record<AccentTone, string>;
