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
      <div className="relative flex flex-col flex-1 min-w-0 bg-background min-h-screen transition-all duration-300 ease-in-out">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 border-b bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-9 w-9 border border-gray-200 bg-white shadow-sm hover:bg-gray-100 rounded-md text-primary transition-all flex items-center justify-center" />
          </div>
          <AuthControls />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}