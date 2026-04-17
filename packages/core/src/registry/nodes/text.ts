import {z} from "zod";
import { CoreNodeDefinition } from "./base";

export const textNodeDefinition: CoreNodeDefinition = {
  type: "text_node",
  label: "Text Node",
  description: "Simple text input with textarea",
  configSchema: z.object({
    text: z.string(),
  }),
  inputs: [
    {
      id: "text",
      label: "Text",
      dataType: "string",
      hasHandle: false,
      control: "textarea",
      defaultValue: "",
    }
  ],
  outputs: [{ id: "output", label: "Text Data", dataType: "string" }],
  previewType: "none", // No special preview, the textarea IS the preview
};