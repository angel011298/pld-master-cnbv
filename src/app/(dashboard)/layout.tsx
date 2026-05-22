"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderProgress } from "@/components/header-progress";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SidebarProvider already applies min-h-svh (100svh) internally — do NOT add
    // min-h-screen (100vh) or overflow-hidden here as they break iOS Safari layout
    // and prevent the mobile Sheet drawer from rendering correctly.
    <SidebarProvider defaultOpen={true} className="bg-slate-50">
      <AppSidebar />
      <SidebarInset className="bg-slate-50 min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          {/* Hamburger visible only on mobile — opens the Sheet sidebar drawer */}
          <SidebarTrigger
            aria-label="Abrir menú"
            className="md:hidden h-9 w-9 -ml-1 shrink-0 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
          />
          <HeaderProgress />
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
