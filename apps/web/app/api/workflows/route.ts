import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@nextflow/core";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await db.workflow.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, definition } = json;

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `unknown-${userId}@example.com`,
      },
    });

    const workflow = await db.workflow.create({
      data: {
        name: name || "Untitled",
        definition: definition || { nodes: [], edges: [] },
        userId: user.id,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
