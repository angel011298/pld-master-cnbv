"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Q = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  area: string;
  difficulty: string;
};

export default function AreaStudyPage() {
  const { area } = useParams<{ area: string }>();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; score_percent: number } | null>(null);

  const start = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("Inicia sesión con Google.");
      return;
    }
    const res = await fetch("/api/exam/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mode: "estudio", area, count: 10 }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Error");
      return;
    }
    setAttemptId(json.attempt_id);
    setQuestions(json.questions ?? []);
    setIdx(0);
    setSelected({});
    setDone(false);
    setResult(null);
  }, [area]);

  useEffect(() => {
    start();
  }, [start]);

  const current = questions[idx];

  const submit = async () => {
    if (!attemptId) return;
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    const answers = questions.map((q) => ({ question_id: q.id, selected_option: selected[q.id] ?? null }));
    const res = await fetch("/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ attempt_id: attemptId, answers }),
    });
    const json = await res.json();
    if (res.ok) {
      setResult(json);
      setDone(true);
    } else {
      setError(json.error ?? "Error");
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-500">{error}</p>
        <Link href="/estudio" className="text-sm text-primary hover:underline">← Áreas</Link>
      </div>
    );
  }

  if (done && result) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-3xl font-bold">Resultado</h1>
        <Card className="space-y-2 p-6 text-center">
          <p className="text-5xl font-bold">{result.score_percent.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">
            {result.correct} de {result.total} correctas
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={start}>Repetir</Button>
            <Link href="/estudio">
              <Button variant="outline">Otra área</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) return <p>Cargando preguntas...</p>;

  const opts: Array<["a" | "b" | "c" | "d", string]> = [
    ["a", current.option_a],
    ["b", current.option_b],
    ["c", current.option_c],
    ["d", current.option_d],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center justify-between">
        <Link href="/estudio" className="text-sm text-primary hover:underline">← Áreas</Link>
        <span className="text-sm text-muted-foreground">
          Pregunta {idx + 1} / {questions.length}
        </span>
      </header>

      <Card className="space-y-3 p-6">
        <p className="text-lg font-medium">{current.question}</p>
        <div className="space-y-2">
          {opts.map(([k, text]) => (
            <button
              key={k}
              onClick={() => setSelected({ ...selected, [current.id]: k })}
              className={`block w-full rounded-md border p-3 text-left text-sm transition ${
                selected[current.id] === k ? "border-primary bg-primary/10" : "border-input hover:bg-accent"
              }`}
            >
              <span className="font-semibold uppercase">{k}.</span> {text}
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            Anterior
          </Button>
          {idx < questions.length - 1 ? (
            <Button onClick={() => setIdx(idx + 1)} disabled={!selected[current.id]}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={submit}>Terminar</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
