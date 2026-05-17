import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** Validates a Bearer token and returns the authenticated user, or null. */
export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) return null;
  const sb = supabase();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export const CENEVAL_QUESTION_COUNT = 118;
export const CENEVAL_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
