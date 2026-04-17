import { useState } from "react";
import { BaseFieldProps } from "../base";
import { toggleTrackTone, type FieldTone } from "../../../tokens/tones";

export type Tone = FieldTone;

type PresentationalFieldProps = Omit<BaseFieldProps, "required" | "type">;

function parseOn(value: string | undefined): boolean {
    return value === "true" || value === "1" || value === "on";
}

interface ToggleRendererProps extends PresentationalFieldProps {
    id: string;
    tone: Tone;
    initialValue?: string;
}

export default function ToggleRenderer({ id, tone, initialValue }: ToggleRendererProps) {
    const [on, setOn] = useState(() => parseOn(initialValue));

    const trackClass =
        "nodrag nopan relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border px-0.5 shadow-[0_0.5px_0px_0_rgba(255,255,255,0.10)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#525252]";
    const thumbClass =
        "pointer-events-none block h-4 w-4 rounded-full bg-zinc-300 shadow transition-all duration-300";

    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={on}
            className={`${trackClass} ${on ? "border-transparent bg-zinc-600" : toggleTrackTone[tone]}`}
            onClick={() => setOn((v) => !v)}
        >
            <span className={[thumbClass, on && "ml-auto bg-white"].filter(Boolean).join(" ")} />
        </button>
    );
}
