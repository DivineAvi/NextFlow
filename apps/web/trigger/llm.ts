import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
]);

function cleanMimeType(raw: string | null, fallback = "image/jpeg"): string {
  // Strip charset/params: "image/jpeg; charset=utf-8" → "image/jpeg"
  const clean = (raw ?? "").split(";")[0].trim().toLowerCase();
  return clean && ALLOWED_IMAGE_MIMES.has(clean) ? clean : fallback;
}

async function imagePartFromSource(source: string): Promise<Part> {
  if (!source) throw new Error("Empty image source");

  // base64 data URI
  if (source.startsWith("data:")) {
    const [header, base64Data] = source.split(",");
    const mimeType = cleanMimeType(header.split(":")[1]?.split(";")[0] ?? null);
    return { inlineData: { data: base64Data, mimeType } };
  }

  // Remote URL — download and inline
  if (source.startsWith("http")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch image (${response.status}): ${source}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = cleanMimeType(response.headers.get("content-type"));
    return { inlineData: { data: base64Data, mimeType } };
  }

  throw new Error(`Unsupported image source format: ${source.slice(0, 80)}`);
}

export const llmNodeTask = task({
  id: "llm-node-task",
  maxDuration: 300,
  run: async (payload: {
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
    model?: string;
  }) => {
    const modelId = payload.model || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelId });

    const userParts: Part[] = [];

    // Images first, then text — Gemini requires inlineData before text parts.
    for (const imageSource of payload.imageUrls ?? []) {
      if (!imageSource) continue;
      try {
        userParts.push(await imagePartFromSource(imageSource));
      } catch (err) {
        console.warn("Skipping image, failed to load:", err);
      }
    }

    userParts.push({ text: payload.userMessage });

    const request: Record<string, unknown> = {
      contents: [{ role: "user", parts: userParts }],
    };
    if (payload.systemPrompt?.trim()) {
      request.systemInstruction = { parts: [{ text: payload.systemPrompt }] };
    }
    const result = await model.generateContent(request as any);
    const responseText = result.response.text();

    return { output: responseText };
  },
});
