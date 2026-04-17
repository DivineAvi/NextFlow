import {z} from "zod";
import { CoreNodeDefinition } from "./base";

export const uploadImageNodeDefinition: CoreNodeDefinition = {
  type: "upload_image",
  label: "Upload Image",
  description: "Upload jpg, png, webp, gif via Transloadit",
  configSchema: z.object({
    file: z.string(),
  }),
  inputs: [
    {
      id: "file",
      label: "Drop Image",
      dataType: "image_url",
      hasHandle: false,
      control: "file",
      options: ["jpg", "jpeg", "png", "webp", "gif"], // Frontend uses this to restrict uploads
    }
  ],
  outputs: [{ id: "output", label: "Image URL", dataType: "image_url" }],
  previewType: "image", // Spec: "Image preview after upload"
};