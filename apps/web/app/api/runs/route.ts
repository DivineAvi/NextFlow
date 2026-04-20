import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@nextflow/core";

// GET /api/runs?workflowId=xxx — returns WorkflowRuns for the authenticated user, optionally filtered by workflow
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");

    const runs = await db.workflowRun.findMany({
      where: {
        workflow: {
          user: { clerkId: userId },
        },
        ...(workflowId ? { workflowId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
        workflow: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(runs);
  } catch (error: any) {
    console.error("Runs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch runs" }, { status: 500 });
  }
}
