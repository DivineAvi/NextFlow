import { verifyWebhook } from "@clerk/backend/webhooks";

/**
 * Clerk Dashboard → Webhooks → Add endpoint → URL: /api/webhooks/clerk
 * Subscribe to e.g. user.created, user.updated, user.deleted.
 * Set signing secret as CLERK_WEBHOOK_SIGNING_SECRET in .env.local.
 */
export async function POST(request: Request) {
  try {
    const evt = await verifyWebhook(request);

    switch (evt.type) {
      case "user.created":
      case "user.updated":
        // Sync user to your DB (Prisma, Drizzle, etc.)
        break;
      case "user.deleted":
        break;
      default:
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
