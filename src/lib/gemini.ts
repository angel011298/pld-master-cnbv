import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Gemini 1.5 Pro with Search Grounding
export const proModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  tools: [{ googleSearchRetrieval: {} }] as { googleSearchRetrieval: Record<string, unknown> }[],
});

// Gemini 1.5 Flash with Search Grounding
export const flashModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [{ googleSearchRetrieval: {} }] as { googleSearchRetrieval: Record<string, unknown> }[],
});

// Embedding model
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
