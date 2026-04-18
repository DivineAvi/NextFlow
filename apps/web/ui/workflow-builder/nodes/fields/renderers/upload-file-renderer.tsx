import { useState, useCallback } from "react";
import { uploadZoneTone, type FieldTone } from "@/ui/tones/tones";
import { File, Image, Video, X } from "lucide-react";

export type Tone = FieldTone;
type FileType = "image" | "video" | "file";

const FILE_TYPE_CONFIG: Record<FileType, { accept: string; icon: typeof File }> = {
  image: { accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif", icon: File},
  video: { accept: "video/mp4,video/webm,video/mov,video/avi", icon: Video },
  file:  { accept: "*/*", icon: File },
};

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

interface FileEntry {
  name: string;
  preview?: string;
}

interface UploadFileRendererProps {
  id: string;
  tone: Tone;
  placeholder?: string;
  fileType?: FileType;
}

export default function UploadFileRenderer({
  id,
  tone,
  placeholder = "Add file",
  fileType = "file",
}: UploadFileRendererProps) {
  const [file, setFile] = useState<FileEntry | null>(null);
  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;

  const handleClick = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.accept;

    input.onchange = async (e) => {
      const selected = (e.target as HTMLInputElement).files?.[0];
      if (!selected) return;

      if (fileType === "image") {
        const preview = await compressImage(selected);
        setFile({ name: selected.name, preview });
      } else {
        setFile({ name: selected.name });
      }
    };

    input.click();
  }, [config.accept, fileType]);

  return (
    <div className="w-full min-w-0">
      {!file ? (
        // Empty state — matches screenshot: text left, icon right, dashed border
        <button
          type="button"
          onClick={handleClick}
          className={`nodrag nopan flex h-6 w-full cursor-pointer items-center justify-between rounded-sm border-none px-2 text-[10px] shadow-[0_0.5px_0px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${uploadZoneTone[tone]}`}
        >
          <span className="opacity-60">{placeholder}</span>
          <Icon size={11} className="opacity-80" />
        </button>
      ) : (
        // Filled state — matches screenshot: thumbnail + filename + X
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

          {/* Clear */}
          <button
            type="button"
            onClick={() => setFile(null)}
            className="nodrag nopan cursor-pointer hover:bg-zinc-700 text-white font-bold rounded-sm flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={13} strokeWidth={2.5} color="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
}