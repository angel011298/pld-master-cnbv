"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
      <main className="w-full flex-1 overflow-hidden relative">
        <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  )
}