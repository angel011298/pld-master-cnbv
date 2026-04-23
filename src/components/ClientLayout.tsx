"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar" // Ajusta la ruta si es necesario

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Lista de rutas donde el sidebar NO debe aparecer
  const noSidebarRoutes = ["/", "/trial", "/register/individual", "/register/corporativo", "/invite"]
  const hideSidebar = noSidebarRoutes.includes(pathname)

  // Si estamos en onboarding, prueba o registro, no renderizamos el Sidebar
  if (hideSidebar) {
    return <main className="w-full min-h-screen bg-slate-50">{children}</main>
  }

  // De lo contrario, renderizamos la app completa
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 w-full min-h-screen bg-slate-50/50">
        {/* Cabecera persistente y minimalista:
          - Mantiene el botón visible en móvil y desktop.
          - Evita sobreponerse al contenido empujando el main hacia abajo (simetría perfecta).
        */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 shadow-sm">
          <SidebarTrigger className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors" />
        </header>
        
        {/* Contenedor principal de los módulos */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}