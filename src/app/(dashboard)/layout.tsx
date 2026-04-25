"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Cambiamos a true para que aparezca desplegado por defecto
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      {/* Añadimos w-full para asegurar que el contenido use todo el espacio restante */}
      <SidebarInset className="w-full bg-slate-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          {/* Este es el botón hamburguesa que permite colapsarlo/desplegarlo */}
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}