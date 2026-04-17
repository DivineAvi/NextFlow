import { z } from "zod";
import { CoreNodeDefinition } from "./base";

export const uploadVideoNodeDefinition: CoreNodeDefinition = {
  type: "upload_video",
  label: "Upload Video",
  description: "Upload mp4, mov, webm, m4v via Transloadit",
  configSchema: z.object({
    file: z.string(),
  }),
  inputs: [
    {
      id: "file",
      label: "Drop Video",
      dataType: "video_url",
      hasHandle: false,
      control: "file",
      options: ["mp4", "mov", "webm", "m4v"],
    }
  ],
  outputs: [{ id: "output", label: "Video URL", dataType: "video_url" }],
  previewType: "video", // Spec: "Video player preview after upload"
};