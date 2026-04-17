import z from "zod";
import { CoreNodeDefinition } from "./base";

export const extractFrameNodeDefinition: CoreNodeDefinition = {
  type: "extract_frame",
  label: "Extract Frame",
  description: "Executes via FFmpeg on Trigger.dev",
  configSchema: z.object({
    video_url: z.string(),
    timestamp: z.string(),
  }),
  inputs: [
    {
      id: "video_url",
      label: "Video URL",
      dataType: "video_url",
      hasHandle: true,
      control: "none",
      required: true, // Spec: "Required"
    },
    {
      id: "timestamp",
      label: "Timestamp",
      dataType: "string", // String to allow "50%" or "5s"
      hasHandle: true,
      control: "text",
      defaultValue: "0",
    }
  ],
  outputs: [{ id: "output", label: "Extracted Frame", dataType: "image_url" }],
  previewType: "image",
  triggerTaskName: "ffmpeg-extract-frame-task",
};