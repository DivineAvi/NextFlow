import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@nextflow/core";
import { tasks } from "@trigger.dev/sdk/v3";
import { workflowOrchestrator } from "@/trigger/orchestrator";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowId, nodes, edges } = await request.json();

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: "Must provide nodes and edges to run." },
        { status: 400 }
      );
    }

    // 1. Create a WorkflowRun record
    const run = await db.workflowRun.create({
      data: {
        workflowId,
        status: "PENDING",
      },
    });

    // 2. Trigger the orchestrator asynchronously inside Trigger.dev
    await tasks.trigger(workflowOrchestrator, {
      workflowRunId: run.id,
      nodes,
      edges,
    });

    // 3. Return the ID immediately so the client can begin polling or opening the history view
    return NextResponse.json({ runId: run.id, status: run.status });
  } catch (error: any) {
    console.error("Execute Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger workflow" },
      { status: 500 }
    );
  }
}
