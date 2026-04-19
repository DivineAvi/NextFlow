import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@nextflow/core";

// GET /api/runs/[runId] — returns a single run with all node runs
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { runId } = await params;

    const run = await db.workflowRun.findUnique({
      where: { id: runId },
      include: {
        nodeRuns: { orderBy: { startedAt: "asc" } },
        workflow: { select: { name: true, userId: true } },
      },
    });

    if (!run) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership via workflow → user
    const owner = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!owner || run.workflow.userId !== owner.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(run);
  } catch (error: any) {
    console.error("Run fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch run" }, { status: 500 });
  }
}
