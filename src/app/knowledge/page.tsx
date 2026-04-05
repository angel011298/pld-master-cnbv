import { IngestDialog } from "@/components/IngestDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Database } from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">Base de Conocimiento</h1>
        <p className="text-muted-foreground">Gestiona y consulta los documentos de estudio para la certificación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IngestDialog />

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Documentos Indexados
            </CardTitle>
            <CardDescription>Visualiza los archivos que ya forman parte del entrenamiento de tu IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Leyes Generales PLD/FT 2024.pdf</span>
                  <span className="text-xs text-muted-foreground">Indexado el 15/03/2026</span>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Guía de Enfoque Basado en Riesgos.pdf</span>
                  <span className="text-xs text-muted-foreground">Indexado el 20/03/2026</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
