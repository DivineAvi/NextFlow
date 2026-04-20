// Number renderer
// Renders a number input with a custom number input
import { inputSurfaceTone, inputTextTone, type FieldTone } from "@/ui/tones/tones";
import { useCanvasStore } from "@/store/canvas-store";
import { useState, useEffect } from "react";
import { useIsHandleConnected } from "./use-handle-connected";

export type Tone = FieldTone;

interface NumberInputRendererProps {
  id: string;
  nodeId: string;
  tone: Tone;
  initialValue?: number;
  placeholder?: string;
}

export function NumberInputRenderer({
  id,
  nodeId,
  tone,
  initialValue,
  placeholder,
}: NumberInputRendererProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const connected = useIsHandleConnected(nodeId, id);
  const [localValue, setLocalValue] = useState<number | "">(initialValue ?? "");

  useEffect(() => {
    setLocalValue(initialValue ?? "");
  }, [initialValue]);

  const handleBlur = () => {
    updateNodeData(nodeId, { [id]: localValue === "" ? undefined : localValue });
  };
  return (
    <input
      type="number"
      id={id}
      value={localValue}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val === "" ? "" : Number(val));
      }}
      onBlur={handleBlur}
      inputMode="numeric"
      pattern="[0-9]*"
      onKeyDown={(e) => {
        // Only allow: backspace, tab, left/right arrows, delete, numbers, and period
        if (
          !(
            (e.key >= '0' && e.key <= '9') ||
            ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '.', '-'].includes(e.key)
          )
        ) {
          e.preventDefault();
        }
      }}
      placeholder={placeholder}
      disabled={connected}
      className={`nodrag nopan px-1 flex-1 w-full border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-opacity ${connected ? "opacity-40 cursor-not-allowed" : ""}`}
    />
  );
}
