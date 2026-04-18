import { inputSurfaceTone, inputTextTone, type FieldTone } from "@/ui/tones/tones";

export type Tone = FieldTone;

interface TextareaRendererProps {
  id: string;
  tone: Tone;
  initialValue?: number;
  placeholder?: string;
}

export default function NumberInputRenderer({
  id,
  tone,
  initialValue,
  placeholder,
}: TextareaRendererProps) {
  return (
    <input 
      type="number"
      id={id}
      defaultValue={initialValue}
      placeholder={placeholder}
      className={`nodrag nopan px-1 flex-1 w-full border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
  );
}
