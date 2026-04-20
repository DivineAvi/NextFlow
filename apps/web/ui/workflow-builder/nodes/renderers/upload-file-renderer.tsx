"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { File, Image, Video, X, CheckCircle2 } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { uploadZoneTone } from "@/ui/tones/tones";
import type { Tone } from "./tone";
import type { FileUploadControlDef } from "@nextflow/core";

type FileType = FileUploadControlDef["fileType"];

const FILE_TYPE_CONFIG: Record<
  FileType,
  { accept: string; icon: typeof File | typeof Image | typeof Video }
> = {
  image:    { accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif", icon: Image },
  video:    { accept: "video/mp4,video/webm,video/mov,video/quicktime,video/x-m4v", icon: Video },
  document: { accept: ".pdf,.doc,.docx,.txt,application/pdf", icon: File },
  any:      { accept: "*/*", icon: File },
};

interface UploadFileRendererProps {
  id: string;
  nodeId: string;
  tone: Tone;
  placeholder?: string;
  fileType?: FileType;
  initialValue?: string;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number; fileName: string }
  | { phase: "done"; fileName: string; url: string }
  | { phase: "error"; message: string };

async function uploadToTransloadit(
  file: File,
  fileType: FileType,
  onProgress: (pct: number) => void
): Promise<string> {
  const paramsRes = await fetch(`/api/transloadit?type=${fileType}`);
  if (!paramsRes.ok) throw new Error("Failed to get upload credentials");
  const { params, signature } = await paramsRes.json();

  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append("params", params);
    formData.append("signature", signature);
    formData.append("file", file, file.name);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 75));
    };

    xhr.onload = async () => {
      if (xhr.status >= 400) {
        reject(new Error(`Upload failed (${xhr.status})`));
        return;
      }
      try {
        const assembly = JSON.parse(xhr.responseText);
        if (assembly.error) { reject(new Error(assembly.message || assembly.error)); return; }

        // Poll until assembly completes
        let result = assembly;
        let attempts = 0;
        while (!["ASSEMBLY_COMPLETED", "ASSEMBLY_ERROR"].includes(result.ok) && attempts < 60) {
          await new Promise((r) => setTimeout(r, 1500));
          const pollRes = await fetch(result.assembly_ssl_url || result.assembly_url);
          result = await pollRes.json();
          onProgress(75 + Math.min(attempts * 3, 24));
          attempts++;
        }

        if (result.ok === "ASSEMBLY_ERROR") {
          reject(new Error(result.message || "Upload processing failed"));
          return;
        }

        const upload = result.uploads?.[0];
        const url: string | undefined = upload?.ssl_url || upload?.url;
        if (!url) { reject(new Error("No URL returned from Transloadit")); return; }

        onProgress(100);
        resolve(url);
      } catch (e: any) {
        reject(e);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("POST", "https://api2.transloadit.com/assemblies");
    xhr.send(formData);
  });
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
  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;
  const abortRef = useRef(false);

  const [state, setState] = useState<UploadState>(() => {
    if (initialValue && !initialValue.startsWith("data:")) {
      return { phase: "done", fileName: "Uploaded file", url: initialValue };
    }
    return { phase: "idle" };
  });

  useEffect(() => {
    if (initialValue && !initialValue.startsWith("data:") && state.phase === "idle") {
      setState({ phase: "done", fileName: "Uploaded file", url: initialValue });
    }
  }, [initialValue]);

  const handleFile = useCallback(
    async (file: File) => {
      abortRef.current = false;
      setState({ phase: "uploading", progress: 0, fileName: file.name });

      try {
        const url = await uploadToTransloadit(file, fileType, (pct) => {
          if (abortRef.current) return;
          setState({ phase: "uploading", progress: pct, fileName: file.name });
        });

        if (abortRef.current) return;
        updateNodeData(nodeId, { [id]: url, [`${id}_name`]: file.name });
        setState({ phase: "done", fileName: file.name, url });
      } catch (e: any) {
        if (abortRef.current) return;
        setState({ phase: "error", message: e.message ?? "Upload failed" });
      }
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

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      abortRef.current = true;
      setState({ phase: "idle" });
      updateNodeData(nodeId, { [id]: null });
    },
    [nodeId, id, updateNodeData]
  );

  // ── Error state ────────────────────────────────────────────────────────────
  if (state.phase === "error") {
    return (
      <div className="w-full min-w-0">
        <div className="nodrag nopan flex h-auto min-h-6 w-full items-start gap-1.5 rounded-sm px-2 py-1 text-[10px] border border-red-700 bg-red-950/40">
          <span className="flex-1 break-words text-red-400 leading-tight">{state.message}</span>
          <button
            type="button"
            onClick={() => setState({ phase: "idle" })}
            className="nodrag nopan mt-0.5 opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  // ── Uploading state ────────────────────────────────────────────────────────
  if (state.phase === "uploading") {
    return (
      <div className="w-full min-w-0 flex flex-col gap-1">
        <div className={`nodrag nopan flex h-6 w-full items-center gap-1.5 rounded-sm px-2 text-[10px] ${uploadZoneTone[tone]}`}>
          <Icon size={11} className="shrink-0 opacity-50" />
          <span className="flex-1 truncate opacity-60 max-w-[100px]">{state.fileName}</span>
          <span className="shrink-0 opacity-50 tabular-nums">{state.progress}%</span>
          <button
            type="button"
            onClick={handleClear}
            className="nodrag nopan shrink-0 opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={11} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] w-full rounded-full bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-200"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Done state ─────────────────────────────────────────────────────────────
  if (state.phase === "done") {
    return (
      <div className={`nodrag nopan flex justify-between h-6 w-full items-center gap-1.5 rounded-sm px-2 text-[10px] ${uploadZoneTone[tone]}`}>
        <CheckCircle2 size={11} className="shrink-0 text-green-400" />
        <span className="flex-1 truncate opacity-70 max-w-[100px]">{state.fileName}</span>
        <button
          type="button"
          onClick={handleClear}
          className="nodrag nopan cursor-pointer hover:bg-zinc-700 rounded-sm flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // ── Idle state ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-w-0">
      <button
        type="button"
        onClick={handleClick}
        className={`nodrag nopan flex h-6 w-full cursor-pointer items-center justify-between rounded-sm border-none px-2 text-[10px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${uploadZoneTone[tone]}`}
      >
        <span className="opacity-60">{placeholder}</span>
        <Icon size={11} className="opacity-80" />
      </button>
    </div>
  );
}
