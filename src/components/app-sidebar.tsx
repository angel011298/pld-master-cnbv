"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { useUserProfile } from "@/hooks/useUserProfile"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"

// Estructura agrupada con soporte para Badges (Notificaciones)
const NAV_GROUPS = [
  {
    label: "Estudio y Práctica",
    items: [
      { title: "Ruta de Aprendizaje", url: "/dashboard", icon: Map },
      { title: "Modo Estudio", url: "/estudio", icon: BookOpen, badge: "XP x2" },
      { title: "Simulador CENEVAL", url: "/simulator", icon: GraduationCap },
    ]
  },
  {
    label: "Recursos y Consulta",
    items: [
      { title: "Entidades Financieras", url: "/entities", icon: Building2 },
      { title: "Chatbot IA", url: "/chatbot", icon: MessageSquare },
      { title: "Base de Conocimiento", url: "/knowledge", icon: Library },
      { title: "Guía de Trámites", url: "/tramites", icon: ClipboardList },
    ]
  },
  {
    label: "Comunidad",
    items: [
      { title: "Foro PLD", url: "/foro", icon: Users, badge: "3 Nuevos" },
    ]
  }
]

const LEVEL_XP = 1000

export function AppSidebar() {
  const pathname = usePathname()
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
    <Sidebar 
      variant="sidebar" 
      collapsible="icon" 
      // MODO DIOS: Borde y sombra dorada sutil si es Super Admin
      className={cn(isSuperAdmin && "border-r border-r-amber-400 shadow-[2px_0_15px_rgba(251,191,36,0.1)] transition-all")}
    >
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 font-black text-xl text-primary">
            <Trophy className={cn("h-6 w-6 shrink-0", isSuperAdmin ? "text-amber-500" : "text-blue-600")} />
            <span className="truncate group-data-[collapsible=icon]:hidden text-slate-800">
              Certifik PLD
            </span>
          </div>
          {/* BADGE DE DIOS OCULTO AL COLAPSAR */}
          {isSuperAdmin && (
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-[9px] font-black uppercase px-1.5 hidden lg:flex group-data-[collapsible=icon]:hidden">
              God Mode
            </Badge>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="gap-0 custom-scrollbar">
        {NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={index} className="pt-4">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Lógica de "Active Link Tracking"
                  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200 group/menu-button h-10",
                          // Micro-interacción: Resalte azul con borde izquierdo
                          isActive ? "bg-blue-50/80 text-blue-700 font-bold border-l-4 border-l-blue-600 rounded-l-none" : "text-slate-600 hover:bg-slate-100/50"
                        )}
                        render={(props) => (
                          <a href={item.url} {...props} className={cn(props.className, "flex justify-between items-center w-full")}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover/menu-button:text-slate-600")} />
                              <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                            </div>
                            {/* Badges de Notificación */}
                            {item.badge && (
                              <Badge className="ml-auto text-[10px] h-5 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </Badge>
                            )}
                          </a>
                        )}
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        
        {/* GRUPO EXCLUSIVO DE ADMINISTRACIÓN (Mantiene los clics peligrosos separados) */}
        {isSuperAdmin && (
          <SidebarGroup className="mt-auto pt-4 border-t border-slate-100">
            <SidebarGroupLabel className="text-xs font-bold text-amber-600/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-1">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Dashboard Maestro"
                    isActive={pathname.startsWith("/admin")}
                    className={cn(
                      "transition-all h-10",
                      pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700 font-bold border-l-4 border-l-amber-500 rounded-l-none" : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                    )}
                    render={(props) => (
                      <a href="/admin" {...props} className={cn(props.className, "w-full")}>
                        <Shield className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/admin") ? "text-amber-600" : "text-amber-600/50")} />
                        <span className="truncate group-data-[collapsible=icon]:hidden font-bold">Dashboard Maestro</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* FOOTER: XP, Racha y Mi Perfil */}
      <SidebarFooter className="border-t border-slate-200 p-3 space-y-3 bg-slate-50/50">
        {!loading && (
          <div className="overflow-hidden px-1 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
                <span className="truncate">Nivel {level}</span>
              </div>
              <span className="font-black text-blue-900 truncate">{totalXp.toLocaleString()} XP</span>
            </div>
            <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-2 bg-slate-200" />
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold mt-3 bg-orange-50 w-fit px-2 py-1 rounded-md border border-orange-100">
                <Flame className="h-3.5 w-3.5 shrink-0 fill-orange-500" />
                <span className="truncate">{streak} día{streak !== 1 ? "s" : ""} de racha</span>
              </div>
            )}
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Mi Perfil" 
              size="lg" 
              className="bg-white hover:bg-blue-50 border border-slate-200 transition-all shadow-sm rounded-xl h-14"
              render={(props) => (
                <a href="/perfil" {...props}>
                  <UserCircle className="h-7 w-7 text-blue-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden ml-1">
                    <span className="font-black text-slate-800 text-sm leading-tight">Mi Perfil</span>
                    <span className="text-[11px] text-slate-500 font-medium truncate">Ajustes y progreso</span>
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