import { task } from "@trigger.dev/sdk/v3";
import type { Node, Edge } from "reactflow";
import { llmNodeTask } from "./llm";
import { cropImageTask, extractFrameTask } from "./media";
import { db } from "@nextflow/core";

export const workflowOrchestrator = task({
  id: "workflow-orchestrator",
  maxDuration: 3600,
  run: async (payload: {
    workflowRunId: string;
    nodes: Node[];
    edges: Edge[];
    scope?: "FULL" | "SELECTED" | "SINGLE";
  }) => {
    const { workflowRunId, nodes, edges } = payload;

    // Map: nodeId → Promise<{ output: any }>
    const nodePromises = new Map<string, Promise<{ output: any }>>();
    // Map: nodeId → resolved output value
    const nodeOutputs = new Map<string, { output: any }>();

    await db.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    const runNode = async (node: Node): Promise<{ output: any }> => {
      // 1. Resolve all direct dependencies first (DAG traversal)
      const incomingEdges = edges.filter((e) => e.target === node.id);

      for (const edge of incomingEdges) {
        if (!nodePromises.has(edge.source)) {
          const dep = nodes.find((n) => n.id === edge.source);
          if (dep) nodePromises.set(dep.id, runNode(dep));
        }
        await nodePromises.get(edge.source);
      }

      // 2. Record this node as RUNNING
      const nodeRun = await db.nodeRun.create({
        data: {
          workflowRunId,
          nodeId: node.id,
          nodeType: node.type ?? "",
          nodeLabel: node.data?.label ?? node.type ?? node.id,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      try {
        // 3. Build inputs: start from static node data, then overlay connected outputs
        const inputs: Record<string, any> = { ...(node.data ?? {}) };

        for (const edge of incomingEdges) {
          const depResult = nodeOutputs.get(edge.source);
          if (!depResult || edge.targetHandle == null) continue;

          const upstreamValue = depResult.output;
          const key = edge.targetHandle;

          // Ports with acceptsMultiple collect into arrays
          const existing = inputs[key];
          if (Array.isArray(existing)) {
            inputs[key] = [...existing, upstreamValue];
          } else if (existing !== undefined && existing !== null && existing !== "") {
            inputs[key] = [existing, upstreamValue];
          } else {
            inputs[key] = upstreamValue;
          }
        }

        // 4. Execute the correct Trigger.dev sub-task based on node type
        let result: { output: any };

        switch (node.type) {
          case "llm_node": {
            const rawImages = inputs["image_input"];
            const imageUrls: string[] = Array.isArray(rawImages)
              ? rawImages.filter(Boolean)
              : rawImages
              ? [rawImages]
              : [];

            const llmResult = await llmNodeTask.triggerAndWait({
              systemPrompt: inputs["system_prompt"] ?? undefined,
              userMessage: inputs["user_prompt"] ?? "",
              imageUrls,
              model: inputs["model"] || "gemini-1.5-flash",
            });

            if (!llmResult.ok) throw new Error(String(llmResult.error ?? "LLM task failed"));
            result = llmResult.output;
            break;
          }

          case "image_crop_node": {
            const cropResult = await cropImageTask.triggerAndWait({
              imageUrl: inputs["image_input"] ?? "",
              xPercent: Number(inputs.x) || 0,
              yPercent: Number(inputs.y) || 0,
              widthPercent: Number(inputs.width) || 100,
              heightPercent: Number(inputs.height) || 100,
            });
            if (!cropResult.ok) throw new Error(String(cropResult.error ?? "Crop task failed"));
            result = cropResult.output;
            break;
          }

          case "extract_frame_node": {
            const frameResult = await extractFrameTask.triggerAndWait({
              videoUrl: inputs["video_input"] ?? "",
              timestamp: inputs["timestamp"] ?? 0,
            });
            if (!frameResult.ok) throw new Error(String(frameResult.error ?? "Extract frame task failed"));
            result = frameResult.output;
            break;
          }

          case "text_node":
            result = { output: inputs.text ?? "" };
            break;

          case "upload_image_node":
            result = { output: inputs.image_file ?? "" };
            break;

          case "upload_video_node":
            result = { output: inputs.video_file ?? "" };
            break;

          default:
            result = { output: node.data?.output ?? "" };
        }

        nodeOutputs.set(node.id, result);

        await db.nodeRun.update({
          where: { id: nodeRun.id },
          data: {
            status: "COMPLETED",
            endedAt: new Date(),
            outputs: result,
            inputs: inputs,
          },
        });

        return result;
      } catch (error: any) {
        await db.nodeRun.update({
          where: { id: nodeRun.id },
          data: {
            status: "FAILED",
            endedAt: new Date(),
            error: error.message ?? String(error),
          },
        });
        throw error;
      }
    };

    // Kick off all nodes concurrently — each internally awaits its dependencies
    for (const node of nodes) {
      if (!nodePromises.has(node.id)) {
        nodePromises.set(node.id, runNode(node));
      }
    }

    const settled = await Promise.allSettled(nodePromises.values());

    const anyFailed = settled.some((r) => r.status === "rejected");
    const anySucceeded = nodeOutputs.size > 0;

    const finalStatus = anyFailed
      ? anySucceeded
        ? "PARTIAL"
        : "FAILED"
      : "COMPLETED";

    await db.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: finalStatus, endedAt: new Date() },
    });

    return {
      success: finalStatus === "COMPLETED",
      status: finalStatus,
      outputs: Object.fromEntries(nodeOutputs),
    };
  },
});
