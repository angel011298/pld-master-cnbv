"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthControls } from "@/components/AuthControls"

const FULL_PAGE_ROUTES = ["/onboarding", "/welcome", "/checkout"]

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullPage = FULL_PAGE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))

  if (isFullPage) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <AuthControls />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
