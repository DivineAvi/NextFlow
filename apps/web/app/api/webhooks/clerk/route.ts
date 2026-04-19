import { verifyWebhook } from "@clerk/backend/webhooks";
import { db } from "@nextflow/core";

export async function POST(request: Request) {
  try {
    const evt = await verifyWebhook(request);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, primary_email_address_id } = evt.data;
        const primaryEmail =
          email_addresses.find((e) => e.id === primary_email_address_id)
            ?.email_address ?? `user-${id}@nextflow.app`;

        await db.user.upsert({
          where: { clerkId: id },
          update: { email: primaryEmail },
          create: { clerkId: id, email: primaryEmail },
        });
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (id) {
          await db.user.deleteMany({ where: { clerkId: id } });
        }
        break;
      }

      default:
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
