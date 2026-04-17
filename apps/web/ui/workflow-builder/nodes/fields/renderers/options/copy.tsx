import { CircleCheck, Copy } from "lucide-react";
import { useState } from "react";

interface CopyRendererProps {
  value: string;
}

export default function CopyRenderer({ value }: CopyRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      // Optionally handle copy failure
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex h-6 w-6 justify-center items-center text-zinc-100 text-xs rounded-md transition duration-300 ease-out hover:bg-neutral-700 border-none"
      title={copied ? "Copied!" : "Copy to clipboard"}
      style={{ padding: 0 }} // Remove extra space around icon
    >
      <span className="flex items-center justify-center h-full w-full">
        {copied ? (
          <CircleCheck className="h-3 w-3 " />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </span>
    </button>
  );
}