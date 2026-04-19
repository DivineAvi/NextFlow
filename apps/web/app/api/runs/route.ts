import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@nextflow/core";

// GET /api/runs — returns all WorkflowRuns for the authenticated user, newest first
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const runs = await db.workflowRun.findMany({
      where: {
        workflow: {
          user: { clerkId: userId },
        },
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
