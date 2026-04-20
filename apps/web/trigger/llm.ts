import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function imagePartFromSource(source: string): Promise<Part | null> {
  if (!source) return null;

  // base64 data URI: "data:image/jpeg;base64,..."
  if (source.startsWith("data:")) {
    const [header, base64Data] = source.split(",");
    const mimeType = header.split(":")[1]?.split(";")[0] || "image/jpeg";
    return { inlineData: { data: base64Data, mimeType } };
  }

  // Remote URL — download and convert
  if (source.startsWith("http")) {
    try {
      const response = await fetch(source);
      const arrayBuffer = await response.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      return { inlineData: { data: base64Data, mimeType } };
    } catch {
      console.warn("Failed to fetch image from URL:", source);
      return null;
    }
  }

  return null;
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

    // Images first, then the user text — Gemini requires inlineData parts
    // to not be followed by another text part in the same content block.
    for (const imageSource of payload.imageUrls ?? []) {
      const imagePart = await imagePartFromSource(imageSource);
      if (imagePart) userParts.push(imagePart);
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
