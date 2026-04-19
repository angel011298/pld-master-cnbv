"use client";

import * as React from "react";
import { Lock, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { buildAuthHeaders } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

const PRO_FEATURES = [
  "Simulador ilimitado con IA adaptativa",
  "Chat con documentos (RAG)",
  "Casos prácticos PLD/FT",
  "Predicción de score con ML",
  "Flashcards infinitas",
  "Soporte prioritario",
];

function PaywallCard() {
  const [loading, setLoading] = React.useState(false);
  const [authRequired, setAuthRequired] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const sb = supabase();
      const {
        data: { session },
      } = await sb.auth.getSession();

      if (!session) {
        setAuthRequired(true);
        return;
      }

      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
      });

      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Error al crear sesión de pago");
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const sb = supabase();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/30 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">Contenido Pro</CardTitle>
          <p className="text-muted-foreground text-sm">
            Desbloquea todo el contenido para prepararte para el examen CNBV 2026
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-3xl font-black text-primary">$799 MXN</p>
            <p className="text-xs text-muted-foreground">por mes · cancela cuando quieras</p>
          </div>

          {authRequired ? (
            <div className="space-y-2">
              <p className="text-center text-sm text-destructive">
                Debes iniciar sesión primero
              </p>
              <Button className="w-full" onClick={handleGoogleLogin}>
                Entrar con Google
              </Button>
            </div>
          ) : (
            <Button
              className="w-full font-bold"
              size="lg"
              onClick={handleUpgrade}
              disabled={loading}
            >
              <Zap className="mr-2 h-4 w-4" />
              {loading ? "Redirigiendo…" : "Obtener acceso Pro"}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Pago seguro con Stripe · Sin contratos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PaywallGateProps {
  children: React.ReactNode;
  /** If true, show children regardless of subscription (e.g. for admin) */
  bypass?: boolean;
}

export function PaywallGate({ children, bypass = false }: PaywallGateProps) {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (bypass || profile?.isPro) {
    return <>{children}</>;
  }

  return <PaywallCard />;
}
