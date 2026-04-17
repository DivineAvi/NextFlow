import React from "react";
import type { FieldTone } from "../../../tokens/tones";

interface LabelRendererProps {
  htmlFor?: string;
  children: React.ReactNode;
  tone?: FieldTone;
  className?: string;
}

export default function LabelRenderer({
  htmlFor,
  children,
  tone = "neutral",
  className = "",
}: LabelRendererProps) {
  // Style will use tone for color, but defaults kept simple
  const toneClasses: Record<FieldTone, string> = {
    dark: "text-[#737373]",
    light: "text-zinc-900",
    neutral: "text-zinc-700",
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`text-[10px] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </label>
  );
}