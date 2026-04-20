"use client"

import * as React from "react"
import {
  Map,
  GraduationCap,
  MessageSquare,
  Library,
  Trophy,
  Building2,
  Zap,
  Flame,
  ClipboardList,
  Users,
  BookOpen,
  Briefcase,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // Importamos el gancho lógico
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { useUserProfile } from "@/hooks/useUserProfile"

const navItems = [
  { title: "Ruta de Aprendizaje", url: "/", icon: Map },
  { title: "Simulador CNBV", url: "/simulator", icon: GraduationCap },
  { title: "Modo Estudio", url: "/estudio", icon: BookOpen },
  { title: "Chatbot IA", url: "/chatbot", icon: MessageSquare },
  { title: "Foro", url: "/foro", icon: Users },
  { title: "Entidades Financieras", url: "/entities", icon: Building2 },
  { title: "Base de Conocimiento", url: "/knowledge", icon: Library },
  { title: "Guía de Trámites", url: "/tramites", icon: ClipboardList },
  { title: "B2B / Licencias", url: "/b2b", icon: Briefcase },
  { title: "Blog", url: "/blog", icon: FileText },
]

const LEVEL_XP = 1000

export function AppSidebar() {
  const { profile, loading } = useUserProfile()
  const { state } = useSidebar() // Obtenemos el estado real (expanded o collapsed)

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const levelProgress = totalXp % LEVEL_XP
  const level = Math.floor(totalXp / LEVEL_XP) + 1

  // Variable de control absoluto
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b p-0 overflow-hidden">
        <div className="flex w-full items-center gap-3 px-4">
          <Trophy className="h-6 w-6 shrink-0 text-primary" />
          {/* Si está colapsado, el texto deja de existir, evitando la sobreposición */}
          {!isCollapsed && <span className="font-bold text-xl text-primary truncate">Certifik PLD</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed ? "Menú Principal" : "..."}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={(props) => (
                      <a href={item.url} {...props}>
                        <item.icon className="shrink-0" />
                        {/* El título desaparece lógicamente */}
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-0 overflow-hidden">
        {/* El pie de página completo desaparece cuando se colapsa el menú */}
        {!loading && !isCollapsed && (
          <div className="p-4 space-y-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground font-medium">
                <Zap className="h-3.5 w-3.5 text-secondary" />
                <span>Nivel {level}</span>
              </div>
              <span className="font-black text-primary">{totalXp.toLocaleString()} XP</span>
            </div>
            <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-2" />
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                <Flame className="h-3.5 w-3.5" />
                <span>{streak} día{streak !== 1 ? "s" : ""} de racha</span>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}