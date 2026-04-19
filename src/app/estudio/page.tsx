"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

const AREAS = [
  { slug: "normativa", name: "Normativa CNBV", icon: "📋" },
  { slug: "operaciones_sospechosas", name: "Operaciones Sospechosas", icon: "🔍" },
  { slug: "conoce_tu_cliente", name: "Conoce tu Cliente (KYC)", icon: "👤" },
  { slug: "financiamiento_terrorismo", name: "Financiamiento al Terrorismo", icon: "⚠️" },
  { slug: "debida_diligencia", name: "Debida Diligencia", icon: "📑" },
  { slug: "riesgo", name: "Evaluación de Riesgo", icon: "📊" },
];

export default function EstudioIndex() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Modo Estudio por Área</h1>
        <p className="text-muted-foreground">
          Practica cada tema del temario oficial CNBV sin cronómetro. Sin presión, con explicación inmediata.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((area) => (
          <Link key={area.slug} href={`/estudio/${area.slug}`}>
            <Card className="p-4 transition hover:bg-accent">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{area.icon}</span>
                <div>
                  <h3 className="font-semibold">{area.name}</h3>
                  <p className="text-sm text-muted-foreground">Practica preguntas de esta área</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
