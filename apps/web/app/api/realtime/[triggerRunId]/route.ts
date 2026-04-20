import { auth } from "@clerk/nextjs/server";
import { runs } from "@trigger.dev/sdk/v3";

export const dynamic = "force-dynamic";

const TERMINAL = new Set(["COMPLETED", "FAILED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE", "INTERRUPTED", "CRASHED"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ triggerRunId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { triggerRunId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const run of runs.subscribeToRun(triggerRunId)) {
          const nodeStatuses = (run.metadata as Record<string, unknown> | undefined)?.nodeStatuses;

          if (nodeStatuses) {
            const data = JSON.stringify({ nodeStatuses, runStatus: run.status });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          if (TERMINAL.has(run.status)) break;
        }
      } catch {
        // subscription ended or run not found
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
