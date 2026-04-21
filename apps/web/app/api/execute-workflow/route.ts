import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, validateWorkflowPayload } from "@nextflow/core";
import { workflowOrchestrator } from "@/trigger/orchestrator";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nodes, edges, sourceNodes, workflowId: bodyWorkflowId, scope = "FULL" } = body;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: "nodes and edges are required" },
        { status: 400 }
      );
    }

    const validation = validateWorkflowPayload(nodes, edges);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Workflow validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Upsert the user record (Clerk → DB sync)
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `user-${userId}@nextflow.app`,
      },
    });

    // Resolve the workflow: use supplied ID if it's valid, otherwise create a new one
    let workflowId = bodyWorkflowId && bodyWorkflowId !== "temp-draft-id"
      ? bodyWorkflowId
      : null;

    if (workflowId) {
      // Verify the workflow belongs to this user
      const existing = await db.workflow.findUnique({
        where: { id: workflowId },
        select: { userId: true },
      });
      if (!existing || existing.userId !== user.id) workflowId = null;
    }

    if (!workflowId) {
      const workflow = await db.workflow.create({
        data: {
          name: "Untitled Workflow",
          definition: { nodes, edges } as any,
          userId: user.id,
        },
      });
      workflowId = workflow.id;
    } else {
      // Keep definition in sync
      await db.workflow.update({
        where: { id: workflowId },
        data: { definition: { nodes, edges } as any },
      });
    }

    // Create a run record
    const run = await db.workflowRun.create({
      data: {
        workflowId,
        scope,
        status: "PENDING",
      },
    });

    // Fire-and-forget — orchestrator runs inside Trigger.dev
    const handle = await workflowOrchestrator.trigger({
      workflowRunId: run.id,
      nodes,
      edges,
      sourceNodes,
      scope,
    });

    return NextResponse.json({
      runId: run.id,
      triggerRunId: handle.id,
      workflowId,
      status: run.status,
    });
  } catch (error: any) {
    console.error("Execute Workflow Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger workflow" },
      { status: 500 }
    );
  }
}
