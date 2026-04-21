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
  Shield,
  BookOpen // CORRECCIÓN APLICADA: Añadido icono para Modo Estudio
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
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { useUserProfile } from "@/hooks/useUserProfile"
import { supabase } from "@/lib/supabase"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"

// CORRECCIÓN APLICADA: Añadido Modo Estudio al menú y reordenado para flujo lógico
const NAV_ITEMS = [
  { title: "Ruta de Aprendizaje", url: "/", icon: Map },
  { title: "Entidades Financieras", url: "/entities", icon: Building2 },
  { title: "Modo Estudio", url: "/estudio", icon: BookOpen },
  { title: "Simulador CENEVAL", url: "/simulator", icon: GraduationCap },
  { title: "Chatbot IA", url: "/chatbot", icon: MessageSquare },
  { title: "Base de Conocimiento", url: "/knowledge", icon: Library },
  { title: "Guía de Trámites", url: "/tramites", icon: ClipboardList },
]

const LEVEL_XP = 1000

export function AppSidebar() {
  const { profile, loading } = useUserProfile()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)

  React.useEffect(() => {
    const sb = supabase()
    sb.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const levelProgress = totalXp % LEVEL_XP
  const level = Math.floor(totalXp / LEVEL_XP) + 1
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Trophy className="h-6 w-6" />
          {/* CORRECCIÓN APLICADA: Branding correcto */}
          <span>Certifik PLD</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={(props) => (
                      <a href={item.url} {...props}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              ))}
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Dashboard Maestro"
                    render={(props) => (
                      <a href="/admin" {...props} className={`${props.className ?? ""} text-blue-700 font-bold`}>
                        <Shield />
                        <span>Dashboard Maestro</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 space-y-3">
        {!loading && (
          <>
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
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}