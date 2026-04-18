import { useRef, useState } from "react";
import { uploadZoneTone, type FieldTone } from "@/tokens/tones";
import type { BaseFieldProps } from "../types";

export type Tone = FieldTone;

type PresentationalFieldProps = Omit<BaseFieldProps, "required" | "type">;

interface UploadImageRendererProps extends PresentationalFieldProps {
  id: string;
  tone: Tone;
  initialValue?: string;
  /** Shown when no file has been selected. */
  placeholder?: string;
  /** MIME accept string, e.g. "image/*" or "video/*". */
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    setLabel(files?.length ? Array.from(files).map((f) => f.name).join(", ") : "");
  }

  return (
    <>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
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
