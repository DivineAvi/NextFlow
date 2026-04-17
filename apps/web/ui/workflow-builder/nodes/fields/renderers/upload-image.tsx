import { useRef, useState } from "react";
import { BaseFieldProps } from "../base";
import { uploadZoneTone, type FieldTone } from "../../../tokens/tones";

export type Tone = FieldTone;

type PresentationalFieldProps = Omit<BaseFieldProps, "required" | "type">;

interface UploadImageRendererProps extends PresentationalFieldProps {
    id: string;
    tone: Tone;
    initialValue?: string;
    /** Shown when no file name is set */
    placeholder?: string;
    /** MIME accept string (e.g. images only, or any type). */
    accept?: string;
    multiple?: boolean;
}

export default function UploadImageRenderer({
    id,
    tone,
    initialValue,
    placeholder = "Drop file or click",
    accept = "image/*",
    multiple,
}: UploadImageRendererProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [label, setLabel] = useState(initialValue ?? "");

    return (
        <>
            <input
                id={id}
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="sr-only"
                onChange={(e) => {
                    const files = e.target.files;
                    if (!files?.length) {
                        setLabel("");
                        return;
                    }
                    setLabel(
                        Array.from(files)
                            .map((f) => f.name)
                            .join(", "),
                    );
                }}
            />
            <button
                type="button"
                className={`nodrag nopan flex h-10 w-full cursor-pointer items-center justify-center rounded-sm border border-dashed px-2 text-center text-[10px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${uploadZoneTone[tone]}`}
                onClick={() => inputRef.current?.click()}
            >
                {label || placeholder}
            </button>
        </>
    );
}
