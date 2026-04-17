import { BaseFieldProps } from "../base";
import { inputSurfaceTone, inputTextTone, type FieldTone } from "../../../tokens/tones";

export type Tone = FieldTone;

type PresentationalFieldProps = Omit<BaseFieldProps, "required" | "type">;

interface TextFieldRendererProps extends PresentationalFieldProps {
    id: string;
    tone: Tone;
    initialValue?: string;
    placeholder?: string;
}

export default function TextFieldRenderer({
    id,
    tone,
    initialValue,
    placeholder,
}: TextFieldRendererProps) {
    return (
        <input
            id={id}
            type="text"
            defaultValue={initialValue}
            placeholder={placeholder}
            className={`nodrag nopan p-1 h-5 w-full min-w-0 border-transparent ${inputSurfaceTone[tone]} ${inputTextTone[tone]} border-1 rounded-sm text-[11px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] outline-none select-none transition-all duration-300`}
        />
    );
}
