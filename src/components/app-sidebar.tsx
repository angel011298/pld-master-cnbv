"use client"

import * as React from "react"
import {
  Map, GraduationCap, MessageSquare, Library, Trophy, Building2, Zap, Flame, ClipboardList, Shield, BookOpen, Users
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

const NAV_ITEMS = [
  { title: "Ruta de Aprendizaje", url: "/", icon: Map },
  { title: "Entidades Financieras", url: "/entities", icon: Building2 },
  { title: "Modo Estudio", url: "/estudio", icon: BookOpen },
  { title: "Simulador CENEVAL", url: "/simulator", icon: GraduationCap },
  { title: "Chatbot IA", url: "/chatbot", icon: MessageSquare },
  { title: "Base de Conocimiento", url: "/knowledge", icon: Library },
  { title: "Guía de Trámites", url: "/tramites", icon: ClipboardList },
  { title: "Foro", url: "/foro", icon: Users },
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Trophy className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                <span className="font-bold text-lg text-primary truncate">Certifik PLD</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Dashboard Maestro" asChild className="text-blue-700 font-bold">
                    <a href="/admin">
                      <Shield />
                      <span>Dashboard Maestro</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {!loading && (
          <div className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground truncate">Nivel {level}</span>
                <span className="font-black text-primary truncate">{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
            <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-2 w-full" />
            {streak > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-xs text-orange-500 font-bold truncate">{streak} días de racha</span>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}