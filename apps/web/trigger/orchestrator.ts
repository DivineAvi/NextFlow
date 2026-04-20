import { task, metadata } from "@trigger.dev/sdk/v3";
import type { Node, Edge } from "reactflow";
import { db, validateResolvedInputs } from "@nextflow/core";
import { nodeExecutorTask, type NodeExecutorPayload } from "./node-executor";

// ---------------------------------------------------------------------------
// Topological sort — Kahn's algorithm
// Returns nodes grouped into execution levels. Nodes in the same level have
// no interdependencies and can run in parallel.
// Throws if a cycle is detected.
// ---------------------------------------------------------------------------
function topoSort(nodes: Node[], edges: Edge[]): Node[][] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adjList = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    adjList.get(edge.source)!.push(edge.target);
  }

  const levels: Node[][] = [];
  let queue = nodes.filter((n) => inDegree.get(n.id) === 0);
  let processed = 0;

  while (queue.length > 0) {
    levels.push(queue);
    processed += queue.length;
    const next: Node[] = [];
    for (const node of queue) {
      for (const targetId of adjList.get(node.id) ?? []) {
        const deg = (inDegree.get(targetId) ?? 1) - 1;
        inDegree.set(targetId, deg);
        if (deg === 0) {
          const target = nodeMap.get(targetId);
          if (target) next.push(target);
        }
      }
    }
    queue = next;
  }

  if (processed < nodes.length) {
    throw new Error("Workflow contains a cycle — cannot execute");
  }

  return levels;
}

// ---------------------------------------------------------------------------
// Build the resolved input map for a single node.
// Merges static node data with upstream outputs wired via edges.
// ---------------------------------------------------------------------------
function buildInputs(
  node: Node,
  edges: Edge[],
  nodeOutputs: Map<string, any>
): Record<string, any> {
  const inputs: Record<string, any> = { ...(node.data ?? {}) };

  for (const edge of edges.filter((e) => e.target === node.id)) {
    const upstreamValue = nodeOutputs.get(edge.source);
    if (upstreamValue === undefined || edge.targetHandle == null) continue;

    const key = edge.targetHandle;
    const existing = inputs[key];

    if (Array.isArray(existing)) {
      inputs[key] = [...existing, upstreamValue];
    } else if (existing !== undefined && existing !== null && existing !== "") {
      inputs[key] = [existing, upstreamValue];
    } else {
      inputs[key] = upstreamValue;
    }
  }

  return inputs;
}

// ---------------------------------------------------------------------------
// Orchestrator task
// ---------------------------------------------------------------------------
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

    const nodeOutputs = new Map<string, any>();
    const nodeStatuses: Record<string, { status: string; output?: any; error?: string }> = {};
    const done = new Map<string, boolean>();

    await db.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    let levels: Node[][];
    try {
      levels = topoSort(nodes, edges);
    } catch (err: any) {
      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "FAILED", endedAt: new Date() },
      });
      throw err;
    }

    for (const level of levels) {
      // ── 1. Partition: skip nodes whose dependencies failed ────────────────
      const executableNodes: Node[] = [];

      for (const node of level) {
        const depsFailed = edges
          .filter((e) => e.target === node.id)
          .some((e) => done.get(e.source) === false);

        if (depsFailed) {
          done.set(node.id, false);
          nodeStatuses[node.id] = { status: "SKIPPED" };
        } else {
          executableNodes.push(node);
        }
      }

      if (executableNodes.length === 0) {
        await metadata.set("nodeStatuses", nodeStatuses);
        continue;
      }

      // ── 2. Resolve inputs for every executable node ───────────────────────
      const inputsMap = new Map<string, Record<string, any>>();
      for (const node of executableNodes) {
        inputsMap.set(node.id, buildInputs(node, edges, nodeOutputs));
      }

      // ── 3. Validate resolved inputs before touching the DB ───────────────
      for (const node of executableNodes) {
        const inputs = inputsMap.get(node.id)!;
        const label = node.data?.label ?? node.type ?? node.id;
        const validation = validateResolvedInputs(node.id, node.type ?? "", label, inputs);
        if (!validation.valid) {
          // Fail this node immediately without creating a run
          done.set(node.id, false);
          nodeStatuses[node.id] = {
            status: "FAILED",
            error: validation.errors.join("; "),
          };
        }
      }

      const validNodes = executableNodes.filter((n) => !done.has(n.id));
      if (validNodes.length === 0) {
        await metadata.set("nodeStatuses", nodeStatuses);
        continue;
      }

      // ── 4. Create DB records and mark all as RUNNING ──────────────────────
      const nodeRunIds = new Map<string, string>();
      for (const node of validNodes) {
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
        nodeRunIds.set(node.id, nodeRun.id);
        nodeStatuses[node.id] = { status: "RUNNING" };
      }
      await metadata.set("nodeStatuses", nodeStatuses);

      // ── 5. Execute the valid nodes in parallel via batchTriggerAndWait ───
      const batchItems = validNodes.map((node) => ({
        payload: {
          nodeId: node.id,
          nodeType: node.type ?? "",
          inputs: inputsMap.get(node.id)!,
        } satisfies NodeExecutorPayload,
      }));

      const batchResult = await nodeExecutorTask.batchTriggerAndWait(batchItems);

      // ── 6. Process results and persist to DB ──────────────────────────────
      for (let i = 0; i < validNodes.length; i++) {
        const node = validNodes[i];
        const run = batchResult.runs[i];
        const nodeRunId = nodeRunIds.get(node.id)!;
        const inputs = inputsMap.get(node.id)!;

        if (run.ok) {
          const output = run.output.output;
          nodeOutputs.set(node.id, output);
          done.set(node.id, true);
          nodeStatuses[node.id] = { status: "COMPLETED", output };

          await db.nodeRun.update({
            where: { id: nodeRunId },
            data: {
              status: "COMPLETED",
              endedAt: new Date(),
              outputs: run.output,
              inputs,
            },
          });
        } else {
          const errorMsg = String(run.error ?? "Node execution failed");
          done.set(node.id, false);
          nodeStatuses[node.id] = { status: "FAILED", error: errorMsg };

          await db.nodeRun.update({
            where: { id: nodeRunId },
            data: {
              status: "FAILED",
              endedAt: new Date(),
              error: errorMsg,
            },
          });
        }
      }

      await metadata.set("nodeStatuses", nodeStatuses);
    }

    // ── Final workflow status ─────────────────────────────────────────────
    const anyFailed = [...done.values()].some((v) => v === false);
    const anySucceeded = [...done.values()].some((v) => v === true);
    const finalStatus = anyFailed ? (anySucceeded ? "PARTIAL" : "FAILED") : "COMPLETED";

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
