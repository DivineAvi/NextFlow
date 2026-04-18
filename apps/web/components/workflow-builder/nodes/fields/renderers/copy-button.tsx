import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, Copy } from "lucide-react";

interface CopyButtonProps {
  value: string;
}

/** Copy-to-clipboard button with a 1.2s visual acknowledgment. */
export default function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setCopied(false);
      }, 1200);
    } catch {
      // Clipboard write failed — silent; consider adding a toast here.
    }
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      type="button"
      title={copied ? "Copied!" : "Copy to clipboard"}
      className="inline-flex h-6 w-6 justify-center items-center text-zinc-100 text-xs rounded-md transition duration-300 ease-out hover:bg-neutral-700 border-none"
      style={{ padding: 0 }}
    >
      <span className="flex items-center justify-center h-full w-full">
        {copied ? <CircleCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </span>
    </button>
  );
}
