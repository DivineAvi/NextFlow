"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { inputSurfaceTone, inputTextTone } from "@/ui/tones/tones";
import { ChevronDown, Check } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(initialValue);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Position dropdown below the trigger button using fixed coords
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 160),
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <div className="relative w-full nodrag nopan">
      <button
        ref={buttonRef}
        type="button"
        disabled={connected}
        onClick={() => !connected && setIsOpen((o) => !o)}
        className={`${connected ? "opacity-40 cursor-not-allowed" : ""}
          flex items-center justify-between
          w-full px-1 rounded-sm border transition-all duration-200
          text-[11px] font-medium outline-none
          ${inputSurfaceTone[tone]} ${inputTextTone[tone]}
          ${isOpen ? "border-[var(--wf-border-subtle)]" : "border-transparent hover:brightness-105"}
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            style={dropdownStyle}
            className="p-0.5 bg-[var(--wf-bg-surface)] border border-[var(--wf-border)] rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div
              className="max-h-[160px] overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setInternalValue(opt.value);
                    updateNodeData(nodeId, { [id]: opt.value });
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between gap-2
                    w-full px-2.5 py-1.5 my-0.5 rounded-md text-left text-[11px] leading-snug
                    transition-colors duration-100
                    ${
                      internalValue === opt.value
                        ? "bg-[var(--wf-btn-bg-hover)] text-[var(--wf-text-primary)]"
                        : "text-[var(--wf-text-muted)] hover:bg-[var(--wf-btn-bg)] hover:text-[var(--wf-text-secondary)]"
                    }
                  `}
                >
                  {opt.label}
                  {internalValue === opt.value && (
                    <Check size={9} className="shrink-0 opacity-70" />
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
