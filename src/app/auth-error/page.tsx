"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const message = params.get("message") ?? params.get("error") ?? "Error de autenticación";

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Error de autenticación</h1>
      <p style={{ color: "#666" }}>{message}</p>
      <Link href="/login">Volver al inicio</Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
