// Upload file renderer
// Renders a file upload input with a custom file upload input

import { useState, useCallback, useEffect } from "react";
import { uploadZoneTone } from "@/ui/tones/tones";
import { File, Image, Video, X } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { Tone } from "./tone";

// IMPORT THE CORE TYPE
import type { FileUploadControlDef } from "@nextflow/core"; 

// ALIGN WITH CORE SCHEMA ('document' and 'any' instead of just 'file')
type FileType = FileUploadControlDef["fileType"];

// Allowed list of file types
const FILE_TYPE_CONFIG: Record<FileType, { accept: string; icon: typeof File | typeof Image | typeof Video }> = {
  image: { accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif", icon: Image },
  video: { accept: "video/mp4,video/webm,video/mov,video/avi", icon: Video },
  document: { accept: ".pdf,.doc,.docx,.txt,application/pdf", icon: File },
  any: { accept: "*/*", icon: File },
};

// Helper to compress an image to a smaller size
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const MAX = 32;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.4));
    };
    img.src = url;
  });
}

// Helper to get the full Base64 string for the backend engine
function getFullBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

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
  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;

  // Hydrate local state if the node loads with existing data from a saved workflow
  useEffect(() => {
    if (initialValue && !file) {
      setFile({ name: "Uploaded File", preview: fileType === "image" ? initialValue : undefined });
    }
  }, [initialValue, fileType]);

  const handleClick = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.accept;

    input.onchange = async (e) => {
      const selected = (e.target as HTMLInputElement).files?.[0];
      if (!selected) return;

      // Prepare the payload for the backend
      const fullBase64 = await getFullBase64(selected);
      
      if (fileType === "image") {
        // UI gets the tiny thumbnail, backend gets the full resolution
        const preview = await compressImage(selected);
        setFile({ name: selected.name, preview });
      } else {
        setFile({ name: selected.name });
      }

      // 4. FIRE THE BRIDGE: Send the data to the Node's props.data
      updateNodeData(nodeId, { [id]: fullBase64 });
    };

    input.click();
  }, [config.accept, fileType, nodeId, id]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from re-opening the file picker
    setFile(null);
    updateNodeData(nodeId, { [id]: null }); // Clear the data in React Flow
  };

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
      ) : (
        <div className={`nodrag nopan flex justify-between h-6 w-full items-center gap-1.5 rounded-sm px-2 text-[10px] ${uploadZoneTone[tone]}`}>
          {/* Thumbnail or icon */}
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className="h-4 w-4 shrink-0 rounded-[2px] object-cover"
            />
          ) : (
            <Icon size={12} className="shrink-0 opacity-50" />
          )}

          {/* Filename */}
          <span className="flex-1 truncate opacity-70 max-w-[80px]">{file.name}</span>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="nodrag nopan cursor-pointer hover:bg-zinc-700 text-white font-bold rounded-sm flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={13} strokeWidth={2.5} color="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
}