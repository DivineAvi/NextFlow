import {z} from "zod";
import { CoreNodeDefinition } from "./base";

export const llmNodeDefinition: CoreNodeDefinition = {
  type: "llm_node",
  label: "Run Any LLM",
  description: "Executes via Trigger.dev task",
  configSchema: z.object({
    model: z.string(),
    system_prompt: z.string(),
    user_message: z.string(),
    images: z.array(z.string()),
  }),
  inputs: [
    {
      id: "model",
      label: "Model",
      dataType: "string",
      hasHandle: false, 
      control: "select",
      options: ["gemini-pro", "gemini-pro-vision", "gemini-1.5-flash"],
      defaultValue: "gemini-pro",
    },
    {
      id: "system_prompt",
      label: "System Prompt",
      dataType: "string",
      hasHandle: true,
      control: "textarea",
      required: false, // Spec: "(optional)"
    },
    {
      id: "user_message",
      label: "User Message",
      dataType: "string",
      hasHandle: true,
      control: "textarea",
      required: true, // Spec: "(required)"
    },
    {
      id: "images",
      label: "Images",
      dataType: "image_url",
      hasHandle: true,
      acceptsMultiple: true, // Spec: "(optional, supports multiple)"
      control: "none",
      required: false,
    }
  ],
  outputs: [{ id: "output", label: "Text Response", dataType: "string" }],
  previewType: "text", // Spec: "Results must be displayed directly on the LLM node itself"
  triggerTaskName: "run-gemini-task",
};