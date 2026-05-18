"use client";

/**
 * useStudySession
 *
 * Thin hook that persists study activity to the backend without
 * blocking the UI. All failures are silently swallowed so a broken
 * network never interrupts the student's experience.
 *
 * Usage:
 *   const { startSession, recordAnswer, completeSession } = useStudySession();
 *
 *   // On mount:
 *   startSession({ formato, bloque, dificultad }, questions.length);
 *
 *   // Per answer (fire-and-forget, never awaited by caller):
 *   recordAnswer(question.id, userAnswer, isCorrect);
 *
 *   // Before showing results (awaited so XP is credited first):
 *   await completeSession(correctCount, totalCount);
 */

import { useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Shared type used by all study components ──────────────────────────────────
export interface StudyMeta {
  /** question_bank format, e.g. "flashcard" */
  formato: string;
  /** null means "all bloques" */
  bloque: number | null;
  /** null means "all dificultades" */
  dificultad: string | null;
}

// ── Retrieve the Supabase JWT for server-side auth ───────────────────────────
async function getToken(): Promise<string> {
  try {
    const { data } = await supabase().auth.getSession();
    return data.session?.access_token ?? "";
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export function useStudySession() {
  const sessionIdRef = useRef<string | null>(null);
  /** Epoch ms when the current question was presented. Resets per answer. */
  const questionStartRef = useRef<number>(Date.now());

  // ── Create a new in_progress session on mount ─────────────────────────────
  const startSession = useCallback(
    async (meta: StudyMeta, totalQuestions: number): Promise<void> => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch("/api/study/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formato: meta.formato,
            bloque: meta.bloque,
            dificultad: meta.dificultad,
            total_questions: totalQuestions,
          }),
        });

        if (res.ok) {
          const body = (await res.json()) as { session_id: string };
          sessionIdRef.current = body.session_id;
          questionStartRef.current = Date.now();
        }
      } catch {
        // Silent — no session persistence, but study continues normally
      }
    },
    []
  );

  // ── Record a single question response (fire-and-forget) ──────────────────
  const recordAnswer = useCallback(
    (questionId: number, userAnswer: string, isCorrect: boolean): void => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const responseTimeMs = Date.now() - questionStartRef.current;
      // Reset timer for the next question immediately
      questionStartRef.current = Date.now();

      getToken()
        .then((token) => {
          if (!token) return;
          return fetch(`/api/study/sessions/${sessionId}/answer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              question_id: questionId,
              user_answer: userAnswer,
              is_correct: isCorrect,
              response_time_ms: responseTimeMs,
            }),
          });
        })
        .catch(() => {});
    },
    []
  );

  // ── Mark session completed and credit XP (awaited before results screen) ──
  const completeSession = useCallback(
    async (correctCount: number, totalCount: number): Promise<void> => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      try {
        const token = await getToken();
        if (!token) return;

        await fetch(`/api/study/sessions/${sessionId}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            correct_count: correctCount,
            total_count: totalCount,
          }),
        });
      } catch {
        // Silent — results screen shows even if completion request fails
      }
    },
    []
  );

  return { startSession, recordAnswer, completeSession };
}
