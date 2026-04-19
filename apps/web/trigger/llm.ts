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
    const modelId = payload.model || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelId });

    const parts: Part[] = [];

    if (payload.systemPrompt?.trim()) {
      parts.push({ text: `System Instructions:\n${payload.systemPrompt}\n\n` });
    }

    // Attach images before the user message (better context for the model)
    for (const imageSource of payload.imageUrls ?? []) {
      const imagePart = await imagePartFromSource(imageSource);
      if (imagePart) parts.push(imagePart);
    }

    parts.push({ text: payload.userMessage });

    const result = await model.generateContent(parts);
    const responseText = result.response.text();

    return { output: responseText };
  },
});
