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

const navItems = [
  { title: "Ruta de Aprendizaje", url: "/", icon: Map },
  { title: "Simulador CENEVAL", url: "/simulator", icon: GraduationCap },
  { title: "Chatbot IA", url: "/chatbot", icon: MessageSquare },
  { title: "Entidades Financieras", url: "/entities", icon: Building2 },
  { title: "Base de Conocimiento", url: "/knowledge", icon: Library },
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
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Trophy className="h-6 w-6" />
          <span>PLD-Master</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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
