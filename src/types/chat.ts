export interface ChatSource {
  documento: string;
  pagina: number | null;
  fragmento: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  text: string;
  sources: ChatSource[];
}
