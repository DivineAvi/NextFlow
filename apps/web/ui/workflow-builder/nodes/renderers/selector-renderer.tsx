"use client";

import { useState, useEffect } from "react";
import { inputSurfaceTone, inputTextTone } from "@/ui/tones/tones";
import { SelectControlDef } from "@nextflow/core";
import { useCanvasStore } from "@/store/canvas-store";
import { Tone } from "./tone";
import { useIsHandleConnected } from "./use-handle-connected";

interface SelectorProps {
  id: string;
  nodeId: string;
  tone: Tone;
  options: SelectControlDef["options"];
  value?: string;
  placeholder?: string;
}

export function SelectorRenderer({
  id,
  nodeId,
  tone,
  options,
  value: initialValue,
  placeholder,
}: SelectorProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const connected = useIsHandleConnected(nodeId, id);
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    setInternalValue(initialValue);
  }, [initialValue]);

  return (
    <div className="relative w-full nodrag nopan">
      <select
        disabled={connected}
        value={internalValue ?? ""}
        onChange={(e) => {
          setInternalValue(e.target.value);
          updateNodeData(nodeId, { [id]: e.target.value });
        }}
        className={`
          w-full px-1.5 py-0.5 rounded-sm border border-transparent
          text-[11px] font-medium outline-none appearance-none cursor-pointer
          transition-all duration-200
          ${inputSurfaceTone[tone]} ${inputTextTone[tone]}
          ${connected ? "opacity-40 cursor-not-allowed" : "hover:brightness-105 focus:border-[var(--wf-border-subtle)]"}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
