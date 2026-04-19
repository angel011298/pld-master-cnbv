"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black">Pago cancelado</h1>
        <p className="text-muted-foreground max-w-sm">
          No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
