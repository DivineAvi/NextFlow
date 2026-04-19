// Textarea renderer
// Renders a textarea input with a custom textarea input
import { inputSurfaceTone, inputTextTone } from "@/ui/tones/tones";
import { Tone } from "./tone";
import { useCanvasStore } from "@/store/canvas-store";
import { useEffect, useState } from "react";

interface TextareaRendererProps {
  id: string;
  nodeId: string;
  tone: Tone;
  initialValue?: string;
  placeholder?: string;
}

export function TextareaRenderer({
  id,
  nodeId,
  tone,
  initialValue,
  placeholder,
}: TextareaRendererProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const [localValue, setLocalValue] = useState(initialValue);
  // Sync local state if external data changes (e.g., Undo/Redo)
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    // Only push to global store on Blur (Performance Optimization)
    updateNodeData(nodeId, { [id]: localValue });
    console.log(`Updated node ${nodeId} data: ${localValue} ` );
  };
  
  return (
    <textarea
      id={id}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`nodrag nopan p-1 flex-1 w-full min-h-[90px] border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none resize-y`}
    />
  );
}
