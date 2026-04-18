import React, { useState, useRef, useEffect } from "react";
import { inputSurfaceTone, inputTextTone, type FieldTone } from "@/ui/tones/tones";
import { ChevronDown, Check } from "lucide-react";

export type Tone = FieldTone;

interface Option {
  label: string;
  value: string;
}

interface SelectorProps {
  id: string;
  tone: Tone;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelector({
    id,
    tone,
    options,
    value: initialValue,
    onChange,
    placeholder,
  }: SelectorProps) {
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
            ${isOpen ? 'border-zinc-400 brightness-110' : 'border-transparent hover:brightness-105'}
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
          <div className="absolute z-[100] w-full mt-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setInternalValue(opt.value);
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between
                    w-full px-2.5 py-1.5 my-0.5 rounded-md text-left text-[11px]
                    transition-colors duration-100
                    ${internalValue === opt.value 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'}
                  `}
                >
                  {opt.label}
                  {internalValue === opt.value && <Check size={10} className="text-zinc-100" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }