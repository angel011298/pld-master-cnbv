"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Lista de rutas donde el sidebar NO debe aparecer
  const noSidebarRoutes = ["/", "/trial", "/register/individual", "/register/corporativo", "/invite", "/estudio/focus"]
  const hideSidebar = noSidebarRoutes.includes(pathname)

  // Si estamos en onboarding, prueba o registro, no renderizamos el Sidebar
  if (hideSidebar) {
    return <main className="w-full min-h-screen bg-slate-50">{children}</main>
  }

  // CORRECCIÓN 3 y 4:
  // defaultOpen={false} hace que el sidebar inicie en modo "solo iconos".
  // Al hacer clic en el SidebarTrigger, el sidebar se expandirá completamente mostrando el texto.
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 w-full min-h-screen bg-slate-50/50">
        
        {/* Cabecera persistente: el botón SIEMPRE estará visible en la parte superior. */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 shadow-sm transition-all">
          <SidebarTrigger className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors rounded-md focus:ring-2 focus:ring-blue-500" />
          <span className="font-bold text-slate-700 text-sm hidden sm:block">
            Menú de Navegación
          </span>
        </header>
        
        {/* Contenedor principal de los módulos */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}