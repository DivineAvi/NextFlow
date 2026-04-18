import { inputSurfaceTone, inputTextTone, type FieldTone } from "@/tokens/tones";
import type { BaseFieldProps } from "../types";

export type Tone = FieldTone;

type PresentationalFieldProps = Omit<BaseFieldProps, "required" | "type">;

interface TextareaRendererProps extends PresentationalFieldProps {
  id: string;
  tone: Tone;
  initialValue?: string;
  placeholder?: string;
}

export default function TextareaRenderer({
  id,
  tone,
  initialValue,
  placeholder,
}: TextareaRendererProps) {
  return (
    <textarea
      id={id}
      defaultValue={initialValue}
      placeholder={placeholder}
      className={`nodrag nopan p-1 flex-1 w-full min-h-[90px] border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none !resize-y`}
    />
  );
}
