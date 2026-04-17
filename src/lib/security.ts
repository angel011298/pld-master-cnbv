import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export function sanitizeText(input: string, maxLen: number) {
  return input.replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, maxLen);
}

export function sanitizeFileName(input: string) {
  return input.replace(/[^\w.\-\s]/g, "").trim().slice(0, 120) || "documento.pdf";
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function getAuthenticatedUserId(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;

  const sb = supabase();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export function validateMessagesPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return { ok: false as const, error: "Payload inválido." };
  const { messages } = payload as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false as const, error: "Se requiere un arreglo de mensajes." };
  }

  const cleaned = messages
    .filter((m) => m && typeof m === "object")
    .map((m) => {
      const msg = m as { role?: unknown; content?: unknown };
      const role = msg.role === "user" ? "user" : "assistant";
      const content = typeof msg.content === "string" ? sanitizeText(msg.content, 2000) : "";
      return { role, content };
    })
    .filter((m) => m.content.length > 0);

  if (cleaned.length === 0) {
    return { ok: false as const, error: "No hay contenido válido para procesar." };
  }

  return { ok: true as const, data: cleaned };
}

export function validateQuizPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return { ok: false as const, error: "Payload inválido." };
  const raw = payload as { topic?: unknown; difficulty?: unknown; count?: unknown };

  const topic = typeof raw.topic === "string" ? sanitizeText(raw.topic, 120) : "";
  if (!topic) return { ok: false as const, error: "El tema es obligatorio." };

  const allowedDifficulties = new Set(["Básico", "Intermedio", "Avanzado"]);
  const difficultyRaw = typeof raw.difficulty === "string" ? sanitizeText(raw.difficulty, 20) : "Intermedio";
  const difficulty = allowedDifficulties.has(difficultyRaw) ? difficultyRaw : "Intermedio";

  const countRaw = typeof raw.count === "number" ? raw.count : 5;
  const count = Number.isFinite(countRaw) ? Math.min(Math.max(Math.floor(countRaw), 1), 10) : 5;

  return { ok: true as const, data: { topic, difficulty, count } };
}

