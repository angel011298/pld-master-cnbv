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
      <div className="flex flex-col flex-1 w-full min-h-screen overflow-hidden bg-background">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur">
          <SidebarTrigger className="text-primary hover:text-blue-700 transition-colors" title="Ocultar/Mostrar Menú" />
          <AuthControls />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}