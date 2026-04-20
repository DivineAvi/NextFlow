// Selector renderer
// Renders a select input with a custom dropdown menu

import React, { useState, useRef, useEffect } from "react";
import { inputSurfaceTone, inputTextTone, type FieldTone } from "@/ui/tones/tones";
import { ChevronDown, Check } from "lucide-react";
import { SelectControlDef } from "@nextflow/core";
import { useCanvasStore } from "@/store/canvas-store";
import { Tone } from "./tone";

interface SelectorProps {
  id: string;
  nodeId: string;
  tone: Tone;
  options: SelectControlDef['options'];
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
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(initialValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <div ref={containerRef} className="relative w-full nodrag nopan">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
            flex items-center justify-between
            w-full px-1 rounded-sm border transition-all duration-200
            text-[11px] font-medium outline-none
            ${inputSurfaceTone[tone]} ${inputTextTone[tone]}
            ${isOpen ? 'border-[var(--wf-border-subtle)]' : 'border-transparent hover:brightness-105'}
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
          `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 p-1 bg-[var(--wf-bg-surface)] border border-[var(--wf-border)] rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setInternalValue(opt.value);
                  updateNodeData(nodeId, { [id]: opt.value });
                  setIsOpen(false);
                }}
                className={`
                    flex items-center justify-between
                    w-full px-2.5 py-1.5 my-0.5 rounded-md text-left text-[11px]
                    transition-colors duration-100
                    ${internalValue === opt.value
                    ? 'bg-[var(--wf-btn-bg-hover)] text-[var(--wf-text-primary)]'
                    : 'text-[var(--wf-text-secondary)] hover:bg-[var(--wf-btn-bg)] hover:text-[var(--wf-text-primary)]'}
                  `}
              >
                {opt.label}
                {internalValue === opt.value && <Check size={10} className="text-[var(--wf-text-primary)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}