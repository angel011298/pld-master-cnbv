"use client"

import * as React from "react"
import {
  Map, GraduationCap, MessageSquare, Library, Trophy, Building2, Zap, Flame, ClipboardList, Shield, BookOpen, Users, UserCircle
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
  { title: "Ruta de Aprendizaje", url: "/dashboard", icon: Map },
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
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary overflow-hidden">
          <Trophy className="h-6 w-6 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Certifik PLD</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="truncate group-data-[collapsible=icon]:hidden">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    render={(props) => (
                      <a href={item.url} {...props}>
                        <item.icon className="shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
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
                        <Shield className="shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">Dashboard Maestro</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER CON MEDIDORES Y MI PERFIL */}
      <SidebarFooter className="border-t p-2 md:p-4 space-y-4">
        
        {/* BLOQUE DE XP Y RACHA (Se oculta por completo al colapsar el menú) */}
        {!loading && (
          <div className="overflow-hidden px-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1 text-muted-foreground font-medium">
                <Zap className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span className="truncate">Nivel {level}</span>
              </div>
              <span className="font-black text-primary truncate">{totalXp.toLocaleString()} XP</span>
            </div>
            <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-2" />
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-500 font-bold mt-2">
                <Flame className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{streak} día{streak !== 1 ? "s" : ""} de racha</span>
              </div>
            )}
          </div>
        )}

        {/* BOTÓN DE MI PERFIL */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Mi Perfil" 
              size="lg" 
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              render={(props) => (
                <a href="/perfil" {...props}>
                  <UserCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  {/* Textos del perfil: Solo se muestran si el menú está expandido */}
                  <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-slate-800 text-sm leading-tight">Mi Perfil</span>
                    <span className="text-[11px] text-slate-500 font-medium truncate">Ver progreso y logros</span>
                  </div>
                </a>
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarFooter>
    </Sidebar>
  )
}