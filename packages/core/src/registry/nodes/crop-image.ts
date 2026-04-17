import { CoreNodeDefinition } from "./base";
import { z } from "zod";
export const cropImageNodeDefinition: CoreNodeDefinition = {
  type: "crop_image",
  label: "Crop Image",
  description: "Executes via FFmpeg on Trigger.dev",
  configSchema: z.object({
    image_url: z.string(),
    x_percent: z.string(),
    y_percent: z.string(),
    width_percent: z.string(),
    height_percent: z.string(),
  }),
  inputs: [
    {
      id: "image_url",
      label: "Image URL",
      dataType: "image_url",
      hasHandle: true,
      control: "none",
      required: true, // Spec: "Required"
    },
    // Spec requires these to accept "text/number (0-100)", so we use "text" control for flexibility
    { id: "x_percent", label: "X (%)", dataType: "string", hasHandle: true, control: "text", defaultValue: "0" },
    { id: "y_percent", label: "Y (%)", dataType: "string", hasHandle: true, control: "text", defaultValue: "0" },
    { id: "width_percent", label: "Width (%)", dataType: "string", hasHandle: true, control: "text", defaultValue: "100" },
    { id: "height_percent", label: "Height (%)", dataType: "string", hasHandle: true, control: "text", defaultValue: "100" }
  ],
  outputs: [{ id: "output", label: "Cropped Image URL", dataType: "image_url" }],
  previewType: "image",
  triggerTaskName: "ffmpeg-crop-task",
};