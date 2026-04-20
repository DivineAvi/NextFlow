import { createHmac } from "crypto";
import { NextResponse } from "next/server";

/**
 * GET /api/transloadit
 * Returns signed Transloadit assembly params for the browser (Uppy plugin).
 * The secret never leaves the server; the signature authorises the upload.
 */
const TEMPLATE_IDS: Record<string, string> = {
  image: "3005d2c37bd846cab3a08730c220d82a",
  video: "153c6292cef84f1a899c689cde4179b1",
};

export async function GET(request: Request) {
  const authKey = process.env.TRANSLOADIT_KEY;
  const authSecret = process.env.TRANSLOADIT_SECRET;

  if (!authKey || !authSecret) {
    return NextResponse.json(
      { error: "Transloadit credentials not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fileType = searchParams.get("type") ?? "any";
  const templateId = TEMPLATE_IDS[fileType];

  // Expires 1 hour from now — ISO 8601 as used by the Transloadit Node.js SDK
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Always use raw storage — no processing templates.
  // Media processing (crop, frame extract) happens server-side in Trigger.dev tasks.
  const params = JSON.stringify({
    auth: { key: authKey, expires },
    steps: {
      ":original": { robot: "/upload/handle" },
    },
  });

  const signature =
    "sha384:" +
    createHmac("sha384", authSecret).update(params).digest("hex");

  return NextResponse.json({ params, signature });
}
