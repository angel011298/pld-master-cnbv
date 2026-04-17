import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Falta configurar GEMINI_API_KEY. Crea un .env.local con GEMINI_API_KEY=... (solo server) o configura la variable en Vercel."
    );
  }
  return key;
}

function getGenAI() {
  return new GoogleGenerativeAI(getApiKey());
}

function getModels() {
  const genAI = getGenAI();

  // Nota: el “grounding”/búsqueda depende del proveedor y puede cambiar.
  // Si causa errores, desactívalo y usa solo RAG (documentos) o un verificador externo.
  const tools = [{ googleSearchRetrieval: {} }] as { googleSearchRetrieval: Record<string, unknown> }[];

  const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro", tools });
  const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", tools });
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  return { proModel, flashModel, embeddingModel };
}

export function proModel() {
  return getModels().proModel;
}

export function flashModel() {
  return getModels().flashModel;
}

export async function generateEmbedding(text: string) {
  const { embeddingModel } = getModels();
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
