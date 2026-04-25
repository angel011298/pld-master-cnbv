import { TramitesGuide } from "@/components/TramitesGuide";

export const metadata = {
  title: "Guía de Trámites | Certificación CNBV PLD/FT 2026",
  description: "Proceso paso a paso: inscripción, pago, programación y resultados del examen CNBV.",
};

export default function TramitesPage() {
  return (
    <div className="flex-1">
      <TramitesGuide />
    </div>
  );
}
