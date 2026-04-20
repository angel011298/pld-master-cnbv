import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthControls } from "@/components/AuthControls";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Certifik PLD | Certificación CNBV 2026",
  description: "Plataforma de microaprendizaje gamificada para aprobar el examen PLD/FT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="font-sans h-full overflow-hidden bg-background">
        <SidebarProvider>
          {/* Contenedor principal que parte la pantalla en columnas estrictas */}
          <div className="flex h-screen w-full">
            
            {/* Columna 1: El Menú Lateral (Toma solo el espacio que necesita) */}
            <div className="flex-none border-r bg-sidebar">
              <AppSidebar />
            </div>

            {/* Columna 2: El Dashboard (Toma el resto de la pantalla) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background">
                <div className="flex items-center gap-2">
                  <SidebarTrigger title="Ocultar/Mostrar Menú" />
                </div>
                <AuthControls />
              </header>
              
              <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>

          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}