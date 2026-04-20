"use client"

import * as React from "react"
import { Map, GraduationCap, MessageSquare, Library, Trophy, Building2, Zap, Flame, ClipboardList, Users, BookOpen, Briefcase, FileText } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
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

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const levelProgress = totalXp % LEVEL_XP
  const level = Math.floor(totalXp / LEVEL_XP) + 1

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b p-4 overflow-hidden">
        <div className="flex items-center gap-3 font-bold text-xl text-primary">
          <Trophy className="h-6 w-6 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden truncate uppercase tracking-tighter">Certifik PLD</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={(props) => (
                      <a href={item.url} {...props}>
                        <item.icon className="shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!loading && (
          <div className="group-data-[collapsible=icon]:hidden space-y-3">
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