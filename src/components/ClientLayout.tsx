"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthControls } from "@/components/AuthControls"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isFullScreenRoute = pathname?.startsWith("/onboarding") || pathname?.startsWith("/welcome")

  if (isFullScreenRoute) {
    return <main className="min-h-screen w-full bg-background">{children}</main>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* CORRECCIÓN: flex-1 y min-w-0 forzan al contenedor a respetar el ancho del menú */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-background relative">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between px-4 border-b bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            {/* CORRECCIÓN: Botón estilizado y con prioridad de click */}
            <SidebarTrigger 
              className="h-10 w-10 border border-gray-200 bg-white shadow-sm hover:bg-gray-100 rounded-lg text-primary transition-all" 
              title="Ocultar/Mostrar Menú" 
            />
          </div>
          <AuthControls />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}