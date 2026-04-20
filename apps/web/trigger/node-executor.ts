import { task } from "@trigger.dev/sdk/v3";
import { llmNodeTask } from "./llm";
import { cropImageTask, extractFrameTask, uploadFileTask } from "./media";

export interface NodeExecutorPayload {
  nodeId: string;
  nodeType: string;
  inputs: Record<string, any>;
}

export const nodeExecutorTask = task({
  id: "node-executor",
  maxDuration: 600,
  run: async (payload: NodeExecutorPayload): Promise<{ output: any }> => {
    const { nodeType, inputs } = payload;

    switch (nodeType) {
      case "llm_node": {
        const rawImages = inputs["image_input"];
        const imageUrls: string[] = Array.isArray(rawImages)
          ? rawImages.filter(Boolean)
          : rawImages
          ? [rawImages]
          : [];

        const result = await llmNodeTask.triggerAndWait({
          systemPrompt: inputs["system_prompt"] ?? undefined,
          userMessage: inputs["user_prompt"] ?? "",
          imageUrls,
          model: inputs["model"] || "gemini-1.5-flash",
        });

        if (!result.ok) throw new Error(String(result.error ?? "LLM task failed"));
        return result.output;
      }

      case "image_crop_node": {
        const result = await cropImageTask.triggerAndWait({
          imageUrl: inputs["image_input"] ?? "",
          xPercent: Number(inputs.x) || 0,
          yPercent: Number(inputs.y) || 0,
          widthPercent: Number(inputs.width) || 100,
          heightPercent: Number(inputs.height) || 100,
        });
        if (!result.ok) throw new Error(String(result.error ?? "Crop task failed"));
        return result.output;
      }

      case "extract_frame_node": {
        const result = await extractFrameTask.triggerAndWait({
          videoUrl: inputs["video_input"] ?? "",
          timestamp: inputs["timestamp"] ?? 0,
        });
        if (!result.ok) throw new Error(String(result.error ?? "Extract frame task failed"));
        return result.output;
      }

      case "text_node":
        return { output: inputs.text ?? "" };

      case "upload_image_node": {
        const r = await uploadFileTask.triggerAndWait({
          dataUrl: inputs.image_file ?? "",
          fileName: inputs.image_file_name,
        });
        if (!r.ok) throw new Error(String(r.error ?? "Upload image task failed"));
        return r.output;
      }

      case "upload_video_node": {
        const r = await uploadFileTask.triggerAndWait({
          dataUrl: inputs.video_file ?? "",
          fileName: inputs.video_file_name,
        });
        if (!r.ok) throw new Error(String(r.error ?? "Upload video task failed"));
        return r.output;
      }

      default:
        return { output: inputs.output ?? "" };
    }
  },
});
