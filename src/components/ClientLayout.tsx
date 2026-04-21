"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthControls } from "@/components/AuthControls"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 1. Detectar si estamos en rutas que NO deben tener menú lateral
  const isFullScreenRoute = pathname?.startsWith("/onboarding") || pathname?.startsWith("/welcome")

  if (isFullScreenRoute) {
    return <main className="min-h-screen w-full bg-background">{children}</main>
  }

  // 2. Para el resto de la app, aplicamos la estructura anti-sobreposición
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden">
        
        {/* Columna Izquierda: Menú Lateral */}
        <AppSidebar />

        {/* Columna Derecha: Contenido Principal */}
        <div className="flex flex-1 flex-col min-w-0 w-full bg-background h-screen overflow-hidden">
          
          {/* HEADER RESCATADO: Aquí vive el botón de colapsar */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" title="Ocultar/Mostrar Menú" />
            </div>
            <AuthControls />
          </header>

          {/* Área del Dashboard (con su propio scroll independiente) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </SidebarProvider>
  )
}   