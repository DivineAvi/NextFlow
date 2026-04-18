import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const llmNodeTask = task({
  id: "llm-node-task",
  maxDuration: 300,
  run: async (payload: {
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
  }) => {
    try {
      const parts: Part[] = [];

      if (payload.systemPrompt) {
        parts.push({ text: `System Instructions: ${payload.systemPrompt}` });
      }

      for (const url of (payload.imageUrls || [])) {
        // Fetch the image to get its buffer and mime type
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }

      parts.push({ text: payload.userMessage });

      const result = await model.generateContent(parts);
      const responseText = result.response.text();

      return {
        output: responseText,
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(`LLM Node Failed: ${error.message}`);
    }
  },
});
