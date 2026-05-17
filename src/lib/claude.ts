import Anthropic from "@anthropic-ai/sdk";

function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "Falta ANTHROPIC_API_KEY. Configúrala en .env.local (server-only) o en tu plataforma de deployment."
    );
  }
  return key;
}

let _client: Anthropic | null = null;
export function claudeClient() {
  if (!_client) _client = new Anthropic({ apiKey: getApiKey() });
  return _client;
}

// Default model: stable, fast, cheap. Override via CLAUDE_MODEL env var.
export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";

/**
 * Call Claude with a single user message and return the text response.
 * Convenience wrapper for one-shot prompts (no conversation state).
 */
export async function claudeGenerateText(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const client = claudeClient();
  const resp = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  // The response is an array of content blocks — extract text from text blocks
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return text;
}

/**
 * Generate JSON from Claude — strips markdown code fences and parses.
 * Throws if the response is not valid JSON.
 */
export async function claudeGenerateJson<T = unknown>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const raw = await claudeGenerateText(opts);
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  // Find the first { or [ and the matching last } or ]
  const firstBrace = cleaned.search(/[{[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const jsonStr =
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;
  return JSON.parse(jsonStr) as T;
}
