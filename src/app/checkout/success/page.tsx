"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function CheckoutSuccessPage() {
  const { refetch } = useUserProfile();

  useEffect(() => {
    const timer = setTimeout(refetch, 2000);
    return () => clearTimeout(timer);
  }, [refetch]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black">¡Bienvenido a Pro!</h1>
        <p className="text-muted-foreground max-w-sm">
          Tu suscripción está activa. Ahora tienes acceso completo a todos los módulos de PLD-Master.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <Zap className="h-4 w-4" />
        Ir al dashboard
      </Link>
    </div>
  );
}
