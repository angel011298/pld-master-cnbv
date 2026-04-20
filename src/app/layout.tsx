import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthControls } from "@/components/AuthControls";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Certifik PLD | Certificación CNBV 2026",
  description: "Plataforma de microaprendizaje gamificada para aprobar el examen PLD/FT.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="h-full font-sans bg-background overflow-x-hidden">
        <SidebarProvider>
          {/* FORZAMOS EL LAYOUT: 
            Usamos un div con 'relative' y 'flex' para que el Sidebar 
            sea un bloque sólido a la izquierda.
          */}
          <div className="relative flex min-h-screen w-full">
            <AppSidebar />
            
            <div className="flex flex-1 flex-col min-w-0 w-full bg-background">
              <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                </div>
                <AuthControls />
              </header>
              
              <main className="flex-1 p-4 md:p-6 lg:p-8">
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