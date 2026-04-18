import { task, tasks } from "@trigger.dev/sdk/v3";
import type { Node, Edge } from "reactflow";
import { llmNodeTask } from "./llm";
import { cropImageTask, extractFrameTask } from "./media";
import { db } from "@nextflow/core";

export const workflowOrchestrator = task({
  id: "workflow-orchestrator",
  maxDuration: 3600, // up to 1 hour
  run: async (payload: {
    workflowRunId: string;
    nodes: Node[];
    edges: Edge[];
  }) => {
    const { workflowRunId, nodes, edges } = payload;
    
    // We'll map each nodeId to a Promise that resolves when the node completes
    const nodePromises = new Map<string, Promise<any>>();
    // We'll also store the resolved outputs
    const nodeOutputs = new Map<string, any>();

    // Mark workflow as running
    await db.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    const runNode = async (node: Node): Promise<any> => {
      // 1. Find dependencies (incoming edges)
      const incomingEdges = edges.filter(e => e.target === node.id);
      const dependencies = incomingEdges.map(e => e.source);

      // 2. Wait for all dependencies to complete
      for (const depId of dependencies) {
        if (!nodePromises.has(depId)) {
          // If a dependency hasn't been started, this means the DAG might not be valid 
          // or we shouldn't be here yet, but we'll initiate it if it's not in the map
          nodePromises.set(depId, runNode(nodes.find(n => n.id === depId)!));
        }
        await nodePromises.get(depId);
      }

      // 3. Mark node as RUNNING in DB
      const nodeRun = await db.nodeRun.create({
        data: {
          workflowRunId,
          nodeId: node.id,
          status: "RUNNING",
          startedAt: new Date(),
        }
      });

      try {
        // Collect inputs from dependencies based on handles
        let inputs: Record<string, any> = { ...node.data };
        for (const edge of incomingEdges) {
          const depOutput = nodeOutputs.get(edge.source);
          if (edge.targetHandle && depOutput?.output) {
            // Aggregate if needed (e.g. LLM image inputs array)
            if (inputs[edge.targetHandle]) {
              if (Array.isArray(inputs[edge.targetHandle])) {
                inputs[edge.targetHandle].push(depOutput.output);
              } else {
                inputs[edge.targetHandle] = [inputs[edge.targetHandle], depOutput.output];
              }
            } else {
              inputs[edge.targetHandle] = depOutput.output;
            }
          }
        }

        // 4. Trigger specific task based on node type
        let result: any = { output: node.data.output || "Direct Input" }; // fallback

        if (node.type === "llm_node") {
          result = await tasks.triggerAndWait(llmNodeTask, {
            systemPrompt: inputs["system-prompt"],
            userMessage: inputs["prompt-input"] || inputs["text-output"] || "Run generation",
            imageUrls: Array.isArray(inputs["image-input"]) ? inputs["image-input"] : (inputs["image-input"] ? [inputs["image-input"]] : []),
          }).then(r => r.payload);
        } 
        else if (node.type === "crop_image") {
          result = await tasks.triggerAndWait(cropImageTask, {
            imageUrl: inputs["image-input"],
            xPercent: parseInt(inputs.x) || 0,
            yPercent: parseInt(inputs.y) || 0,
            widthPercent: parseInt(inputs.width) || 100,
            heightPercent: parseInt(inputs.height) || 100,
          }).then(r => r.payload);
        }
        else if (node.type === "extract_frame") {
          result = await tasks.triggerAndWait(extractFrameTask, {
            videoUrl: inputs["video-input"],
            timestamp: parseFloat(inputs.timestamp) || 0.0,
          }).then(r => r.payload);
        }

        nodeOutputs.set(node.id, result);

        // Mark node as COMPLETED
        await db.nodeRun.update({
          where: { id: nodeRun.id },
          data: { status: "COMPLETED", endedAt: new Date(), outputs: result }
        });

        return result;

      } catch (error: any) {
        await db.nodeRun.update({
          where: { id: nodeRun.id },
          data: { status: "FAILED", endedAt: new Date(), error: error.message }
        });
        throw error;
      }
    };

    // Find all terminal nodes (nodes with no outgoing edges)
    // Or just try to execute every node, and caching ensures they only run once
    try {
      for (const node of nodes) {
        if (!nodePromises.has(node.id)) {
          nodePromises.set(node.id, runNode(node));
        }
      }
      
      await Promise.all(Array.from(nodePromises.values()));

      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "COMPLETED", endedAt: new Date() },
      });

      return { success: true, outputs: Object.fromEntries(nodeOutputs) };
    } catch (error: any) {
      // If any promise completely throws, mark run as failed or partial
      const partialCompletion = Object.keys(nodeOutputs).length > 0;
      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: partialCompletion ? "PARTIAL" : "FAILED", endedAt: new Date() },
      });
      console.error("Workflow failed:", error);
      throw error;
    }
  },
});
