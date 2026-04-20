import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Above this size, use the Gemini File API instead of inlineData to avoid
// hitting the 20 MB request body limit.
const FILE_API_THRESHOLD = 4 * 1024 * 1024; // 4 MB

function getClients() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return {
    genAI: new GoogleGenerativeAI(apiKey),
    fileManager: new GoogleAIFileManager(apiKey),
  };
}

/** Detect MIME type from magic bytes — never trust Content-Type alone. */
function mimeFromBytes(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf, 0, 12);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return "image/heic";
  return "image/jpeg";
}

/**
 * Convert a single image source to a Gemini Part.
 * - Small images  (<4 MB): sent as inlineData (no round-trip to File API).
 * - Large images  (≥4 MB): uploaded to Gemini File API and passed as fileData.
 * Throws on any failure so callers get an explicit error instead of silent data loss.
 */
async function imagePartFromSource(
  source: string,
  fileManager: GoogleAIFileManager,
  index: number
): Promise<Part> {
  if (!source) throw new Error(`Image ${index + 1}: empty source`);

  let arrayBuffer: ArrayBuffer;

  if (source.startsWith("data:")) {
    const commaIdx = source.indexOf(",");
    const base64Data = source.slice(commaIdx + 1);
    arrayBuffer = Buffer.from(base64Data, "base64").buffer;
  } else if (source.startsWith("http")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Image ${index + 1}: fetch failed (HTTP ${response.status}) — ${source}`);
    }
    arrayBuffer = await response.arrayBuffer();
  } else {
    throw new Error(`Image ${index + 1}: unsupported source — ${source.slice(0, 80)}`);
  }

  const mimeType = mimeFromBytes(arrayBuffer);

  // Small image — send inline
  if (arrayBuffer.byteLength < FILE_API_THRESHOLD) {
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    return { inlineData: { data: base64Data, mimeType } };
  }

  // Large image — upload to Gemini File API, pass by reference
  const tmpPath = join(tmpdir(), `${randomUUID()}.img`);
  try {
    await writeFile(tmpPath, Buffer.from(arrayBuffer));
    const upload = await fileManager.uploadFile(tmpPath, {
      mimeType,
      displayName: `image-${index + 1}`,
    });
    return { fileData: { fileUri: upload.file.uri, mimeType } };
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
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
    const { genAI, fileManager } = getClients();
    const modelId = payload.model || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelId });

    const sources = (payload.imageUrls ?? []).filter(
      (s): s is string => typeof s === "string" && s.length > 0
    );

    // Fetch all images concurrently — fail fast if any image is unreachable
    const imageParts = await Promise.all(
      sources.map((src, i) => imagePartFromSource(src, fileManager, i))
    );

    // Images must come before the text part in Gemini's content block
    const userParts: Part[] = [...imageParts, { text: payload.userMessage }];

    const request: Record<string, unknown> = {
      contents: [{ role: "user", parts: userParts }],
    };
    if (payload.systemPrompt?.trim()) {
      request.systemInstruction = { parts: [{ text: payload.systemPrompt }] };
    }

    const result = await model.generateContent(request as any);
    return { output: result.response.text() };
  },
});
