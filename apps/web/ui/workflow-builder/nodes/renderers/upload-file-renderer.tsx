"use client";

import { useState, useCallback, useEffect } from "react";
import { File, Image, Video, X } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { uploadZoneTone } from "@/ui/tones/tones";
import { PreviewRenderer } from "./preview-renderer";
import type { Tone } from "./tone";
import type { FileUploadControlDef } from "@nextflow/core";

type FileType = FileUploadControlDef["fileType"];

const FILE_TYPE_CONFIG: Record<
  FileType,
  { accept: string; icon: typeof File | typeof Image | typeof Video }
> = {
  image: {
    accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif",
    icon: Image,
  },
  video: {
    accept: "video/mp4,video/webm,video/mov,video/quicktime,video/x-m4v",
    icon: Video,
  },
  document: { accept: ".pdf,.doc,.docx,.txt,application/pdf", icon: File },
  any: { accept: "*/*", icon: File },
};

interface UploadFileRendererProps {
  id: string;
  nodeId: string;
  tone: Tone;
  placeholder?: string;
  fileType?: FileType;
  initialValue?: string;
}

export function UploadFileRenderer({
  id,
  nodeId,
  tone,
  placeholder = "Add file",
  fileType = "any",
  initialValue,
}: UploadFileRendererProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;

  // Restore display state from saved node data (could be a data URL or a CDN URL)
  useEffect(() => {
    if (initialValue && !fileName) {
      setFileName("Selected file");
      setPreview(
        fileType === "image" || initialValue.startsWith("data:image") ? initialValue : null
      );
    }
  }, [initialValue, fileType]);

  const handleFile = useCallback(
    (selected: globalThis.File) => {
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Store the base64 data URL directly in node data.
        // The actual upload to CDN happens inside the Trigger.dev uploadFileTask at execution time.
        updateNodeData(nodeId, { [id]: dataUrl });
        setFileName(selected.name);
        setPreview(fileType === "image" ? dataUrl : null);
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsDataURL(selected);
    },
    [fileType, nodeId, id, updateNodeData]
  );

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.accept;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleFile(f);
    };
    input.click();
  }, [config.accept, handleFile]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setPreview(null);
    setError(null);
    updateNodeData(nodeId, { [id]: null });
  };

  if (error) {
    return (
      <div className="w-full min-w-0">
        <div className="nodrag nopan flex h-auto min-h-6 w-full items-start gap-1.5 rounded-sm px-2 py-1 text-[10px] border border-red-700 bg-red-950/40">
          <span className="flex-1 break-words text-red-400 leading-tight">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="nodrag nopan mt-0.5 opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  const previewType =
    fileType === "video" ? "video" : fileType === "image" ? "image" : "other";

  return (
    <div className="w-full min-w-0">
      {!fileName ? (
        <button
          type="button"
          onClick={handleClick}
          className={`nodrag nopan flex h-6 w-full cursor-pointer items-center justify-between rounded-sm border-none px-2 text-[10px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${uploadZoneTone[tone]}`}
        >
          <span className="opacity-60">{placeholder}</span>
          <Icon size={11} className="opacity-80" />
        </button>
      ) : preview ? (
        <div className="w-full flex flex-col gap-1">
          <PreviewRenderer
            id={id}
            sourceId={nodeId}
            value={fileName}
            urls={[preview]}
            type={previewType}
          />
          <button
            type="button"
            onClick={handleClear}
            className={`nodrag nopan flex h-5 w-full cursor-pointer items-center justify-center gap-1 rounded-sm text-[10px] opacity-40 hover:opacity-100 transition-opacity ${uploadZoneTone[tone]}`}
          >
            <X size={10} />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <div
          className={`nodrag nopan flex justify-between h-6 w-full items-center gap-1.5 rounded-sm px-2 text-[10px] ${uploadZoneTone[tone]}`}
        >
          <Icon size={12} className="shrink-0 opacity-50" />
          <span className="flex-1 truncate opacity-70 max-w-[80px]">{fileName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="nodrag nopan cursor-pointer hover:bg-zinc-700 rounded-sm flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
