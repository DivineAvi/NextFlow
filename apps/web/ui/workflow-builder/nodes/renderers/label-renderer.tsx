// Label renderer
// Renders a label for an input
import type { FieldTone } from "@/ui/tones/tones";
import React from "react";

interface LabelRendererProps {
  htmlFor?: string;
  children: React.ReactNode;
  tone?: FieldTone;
  className?: string;
}

const TONE_CLASSES: Record<FieldTone, string> = {
  dark: "text-[#737373]",
  light: "text-zinc-900",
  neutral: "text-zinc-700",
};

export function LabelRenderer({
  htmlFor,
  children,
  tone = "neutral",
  className = "",
}: LabelRendererProps) {
  return (
    <label htmlFor={htmlFor} className={`text-[10px] ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </label>
  );
}
