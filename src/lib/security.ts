import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export function sanitizeText(input: string, maxLen: number) {
  return input
    // Strip null bytes and ASCII control characters (except tab/newline/CR)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    // Strip HTML angle brackets
    .replace(/[<>]/g, "")
    // Strip javascript: URI scheme (case-insensitive, with optional whitespace)
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, "")
    // Strip HTML event handler attributes (onclick=, onerror=, etc.)
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeFileName(input: string) {
  return input.replace(/[^\w.\-\s]/g, "").trim().slice(0, 120) || "documento.pdf";
}

/** Basic IPv4/IPv6 format validator */
function isValidIp(ip: string): boolean {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return true;
  // IPv6 (simplified — accepts full and compressed forms)
  if (/^[0-9a-fA-F:]{2,39}$/.test(ip)) return true;
  return false;
}

export function getClientIp(req: NextRequest): string {
  // On Vercel, x-real-ip is injected by the edge network and is trustworthy.
  // x-forwarded-for can be spoofed by the client, so we only use it as fallback.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the LAST entry (added by the outermost trusted proxy, not client-supplied)
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    const last = ips[ips.length - 1] ?? "";
    if (isValidIp(last)) return last;
  }

  return "unknown";
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

// Maps difficulty to quiz_bank text format
const DIFF_NUM_TO_STR: Record<number, string> = { 1: "Básico", 2: "Intermedio", 3: "Avanzado" };
const DIFF_TO_BANK: Record<string, string> = {
  Básico: "fácil",
  Intermedio: "medio",
  Avanzado: "difícil",
};
const ALLOWED_DIFFICULTIES = new Set(["Básico", "Intermedio", "Avanzado"]);

export function validateQuizPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return { ok: false as const, error: "Payload inválido." };
  const raw = payload as {
    topic?: unknown; tema?: unknown;
    difficulty?: unknown; dificultad?: unknown;
    count?: unknown; cantidad?: unknown;
  };

  // Accept tema (new) or topic (legacy) — both optional
  const topicRaw = raw.tema ?? raw.topic;
  const topic = typeof topicRaw === "string" ? sanitizeText(topicRaw, 120) : "";

  // Accept dificultad: 1|2|3 (new) or difficulty: string (legacy)
  // bankDificultad is null when no difficulty filter is requested
  let difficulty = "Intermedio";
  let bankDificultad: string | null = null;

  if (typeof raw.dificultad === "number" && DIFF_NUM_TO_STR[raw.dificultad as 1 | 2 | 3]) {
    difficulty = DIFF_NUM_TO_STR[raw.dificultad as 1 | 2 | 3];
    bankDificultad = DIFF_TO_BANK[difficulty];
  } else if (typeof raw.difficulty === "string") {
    const d = sanitizeText(raw.difficulty, 20);
    difficulty = ALLOWED_DIFFICULTIES.has(d) ? d : "Intermedio";
    bankDificultad = DIFF_TO_BANK[difficulty] ?? null;
  }

  // Accept cantidad (new) or count (legacy)
  const countRaw = raw.cantidad ?? raw.count;
  const count =
    typeof countRaw === "number" && Number.isFinite(countRaw)
      ? Math.min(Math.max(Math.floor(countRaw), 1), 10)
      : 5;

  return { ok: true as const, data: { topic, difficulty, count, bankDificultad } };
}

