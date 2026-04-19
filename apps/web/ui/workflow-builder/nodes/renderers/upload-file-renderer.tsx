"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import { uploadZoneTone } from "@/ui/tones/tones";
import { File, Image, Video, X, Loader2 } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { Tone } from "./tone";
import { PreviewRenderer } from "./preview-renderer";
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

interface FileEntry {
  name: string;
  preview?: string;
}

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
  const [file, setFile] = useState<FileEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uppyRef = useRef<Uppy | null>(null);
  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;

  // Hydrate from saved workflow state
  useEffect(() => {
    if (initialValue && !file) {
      const isImage =
        fileType === "image" ||
        /\.(jpe?g|png|webp|gif)(\?|$)/i.test(initialValue);
      setFile({ name: "Uploaded file", preview: isImage ? initialValue : undefined });
    }
  }, [initialValue, fileType]);

  // Tear down Uppy instance on unmount
  useEffect(() => {
    return () => {
      uppyRef.current?.destroy();
    };
  }, []);

  const startUpload = useCallback(
    async (selected: globalThis.File) => {
      // Destroy any previous instance
      uppyRef.current?.destroy();

      setUploading(true);
      setUploadError(null);

      // Fetch signed assembly params from our server
      let assemblyOptions: { params: string; signature: string };
      try {
        const res = await fetch(`/api/transloadit?type=${fileType}`);
        const text = await res.text();
        if (!res.ok) throw new Error("Failed to get upload credentials");
        try {
          assemblyOptions = JSON.parse(text);
        } catch {
          throw new Error("Upload service returned an unexpected response");
        }
      } catch (err: any) {
        setUploading(false);
        setUploadError(err.message || "Could not reach upload service");
        return;
      }

      const uppy = new Uppy({ autoProceed: true, allowMultipleUploadBatches: false });

      uppy.use(Transloadit, {
        assemblyOptions,
        waitForEncoding: true,
      });

      uppy.on("transloadit:complete", (assembly) => {
        const a = assembly as any;
        // When a template is used, processed files are in results; fall back to uploads for raw storage
        const firstResultStep = a.results && Object.values(a.results)[0] as any[];
        const resultFile = firstResultStep?.[0];
        const uploadFile = a.uploads?.[0];

        const rawUrl: string | undefined =
          resultFile?.url || uploadFile?.url;

        const url = rawUrl ? encodeURI(decodeURI(rawUrl)) : undefined;

        if (url) {
          updateNodeData(nodeId, { [id]: url });
          setFile({
            name: selected.name,
            preview: fileType === "image" ? url : undefined,
          });
        } else {
          setUploadError("Upload succeeded but no URL was returned");
        }
        setUploading(false);
        uppy.destroy();
        uppyRef.current = null;
      });

      uppy.on("transloadit:assembly-error", (_assembly, error) => {
        setUploadError(error.message || "Assembly failed");
        setUploading(false);
        uppy.destroy();
        uppyRef.current = null;
      });

      uppy.on("error", (error) => {
        setUploadError(error.message || "Upload failed");
        setUploading(false);
        uppy.destroy();
        uppyRef.current = null;
      });

      uppyRef.current = uppy;

      try {
        uppy.addFile({
          name: selected.name,
          type: selected.type || "application/octet-stream",
          data: selected,
        });
      } catch (err: any) {
        setUploadError(err.message || "Failed to add file");
        setUploading(false);
        uppy.destroy();
        uppyRef.current = null;
      }
    },
    [fileType, nodeId, id, updateNodeData]
  );

  const handleClick = useCallback(() => {
    if (uploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.accept;
    input.onchange = (e) => {
      const selected = (e.target as HTMLInputElement).files?.[0];
      if (selected) startUpload(selected);
    };
    input.click();
  }, [uploading, config.accept, startUpload]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    uppyRef.current?.cancelAll();
    setFile(null);
    setUploadError(null);
    setUploading(false);
    updateNodeData(nodeId, { [id]: null });
  };

  if (uploading) {
    return (
      <div
        className={`nodrag nopan flex h-6 w-full items-center gap-1.5 rounded-sm px-2 text-[10px] ${uploadZoneTone[tone]}`}
      >
        <Loader2 size={11} className="animate-spin opacity-70 shrink-0" />
        <span className="opacity-60 truncate">Uploading…</span>
        <button
          type="button"
          onClick={handleClear}
          className="nodrag nopan ml-auto opacity-40 hover:opacity-100 transition-opacity"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  if (uploadError) {
    return (
      <div className="w-full min-w-0">
        <div className="nodrag nopan flex h-auto min-h-6 w-full items-start gap-1.5 rounded-sm px-2 py-1 text-[10px] border border-red-700 bg-red-950/40">
          <span className="flex-1 break-words text-red-400 leading-tight">
            {uploadError}
          </span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="nodrag nopan mt-0.5 opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  const previewType = fileType === "video" ? "video" : fileType === "image" ? "image" : "other";

  return (
    <div className="w-full min-w-0">
      {!file ? (
        <button
          type="button"
          onClick={handleClick}
          className={`nodrag nopan flex h-6 w-full cursor-pointer items-center justify-between rounded-sm border-none px-2 text-[10px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${uploadZoneTone[tone]}`}
        >
          <span className="opacity-60">{placeholder}</span>
          <Icon size={11} className="opacity-80" />
        </button>
      ) : file.preview ? (
        <div className="w-full flex flex-col gap-1">
          <PreviewRenderer
            id={id}
            sourceId={nodeId}
            value={file.name}
            urls={[file.preview]}
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
          <span className="flex-1 truncate opacity-70 max-w-[80px]">{file.name}</span>
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
