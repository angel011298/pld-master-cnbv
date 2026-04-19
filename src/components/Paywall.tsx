"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function Paywall({ exam_cycle = "jun_2026" }: { exam_cycle?: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (purchase_type: string, seats = 1) => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase_type, seats, exam_cycle }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Por favor inicia sesión para acceder a este contenido.</p>
        <a href="/login" style={{ color: "#0052B4", fontWeight: 600 }}>
          Iniciar sesión con Google
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        Elige tu plan
      </h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Examen CNBV · Convocatoria {exam_cycle === "jun_2026" ? "junio 2026" : "octubre 2026"}
      </p>

      {/* Plan Individual */}
      <div
        style={{
          border: "2px solid #0052B4",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Plan Individual</h3>
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#0052B4" }}>
          $1,999 MXN
        </p>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Acceso completo · Simulacro ilimitado · Chat IA · Foro
        </p>
        <button
          onClick={() => handleCheckout("individual")}
          disabled={loading}
          style={{
            padding: "12px 32px",
            background: "#0052B4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Procesando..." : "Pagar ahora"}
        </button>
      </div>

      {/* Plan Corporativo B2B */}
      <div
        style={{
          border: "2px solid #00C2A8",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Plan Corporativo (B2B)</h3>
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#00C2A8" }}>
          $999 MXN <span style={{ fontSize: "1rem", fontWeight: 400 }}>/ asiento</span>
        </p>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Mínimo 5 asientos · Dashboard de equipo · Reportes
        </p>
        <button
          onClick={() => handleCheckout("b2b", 5)}
          disabled={loading}
          style={{
            padding: "12px 32px",
            background: "#00C2A8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Procesando..." : "Solicitar cotización"}
        </button>
      </div>
    </div>
  );
}
