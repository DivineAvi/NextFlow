// Textfield renderer
// Renders a text input with a custom text input
import { inputSurfaceTone, inputTextTone } from "@/ui/tones/tones";
import { Tone } from "./tone";
import { useCanvasStore } from "@/store/canvas-store";
import { useState, useEffect } from "react";

interface TextFieldRendererProps {
  id: string;
  nodeId: string;
  tone: Tone;
  initialValue?: string;
  placeholder?: string;
}

export function TextFieldRenderer({
  id,
  nodeId,
  tone,
  initialValue,
  placeholder,
}: TextFieldRendererProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const [localValue, setLocalValue] = useState(initialValue || "");

  useEffect(() => {
    setLocalValue(initialValue || "");
  }, [initialValue]);

  const handleBlur = () => {
    updateNodeData(nodeId, { [id]: localValue });
  };
  return (
    <input
      id={id}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`nodrag nopan p-1 h-5 w-full min-w-0 border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none select-none transition-all duration-300`}
    />
  );
}
