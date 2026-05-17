"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  Map, GraduationCap, MessageSquare, Library, Building2, Zap, Flame, ClipboardList, Shield, BookOpen, Users, UserCircle, LogOut, Globe
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useUserProfile } from "@/hooks/useUserProfile"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"

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
      { title: "40 Rec. GAFI", url: "/gafi", icon: Globe },
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
  const router = useRouter()
  const { profile, loading } = useUserProfile()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

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
  const isSuperAdmin = profile?.isSuperAdmin ?? userEmail === SUPER_ADMIN_EMAIL

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const sb = supabase()
      await sb.auth.signOut()
      router.replace("/")
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className={cn(isSuperAdmin && "border-r border-r-amber-400 shadow-[2px_0_15px_rgba(251,191,36,0.1)] transition-all")}
    >
      {/* Header: logo + toggle button — sticky, never scrolls */}
      <SidebarHeader className="border-b border-neutral-100 px-4 py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center justify-between gap-2 w-full group-data-[collapsible=icon]:justify-center">
          {/* Full logo — hidden when sidebar is collapsed */}
          <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:hidden">
            <Logo variant="full" size={32} className="shrink-0" />
            {isSuperAdmin && (
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-eyebrow px-1.5 hidden lg:flex shrink-0">
                Admin
              </Badge>
            )}
          </div>
          {/* Collapse / expand toggle — always visible */}
          <SidebarTrigger className="h-8 w-8 shrink-0 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 custom-scrollbar">
        {NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={index} className="pt-4">
            <SidebarGroupLabel className="text-[11px] font-semibold text-neutral-400 uppercase tracking-eyebrow group-data-[collapsible=icon]:hidden mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200 group/menu-button h-10 rounded-xl",
                          isActive
                            ? "bg-brand-50 text-brand-700 font-semibold"
                            : "text-neutral-600 hover:bg-neutral-50 font-medium"
                        )}
                        render={(props) => (
                          <a href={item.url} {...props} className={cn(props.className, "flex justify-between items-center w-full")}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-brand-500" : "text-neutral-400 group-hover/menu-button:text-neutral-600")} strokeWidth={2} />
                              <span className="truncate text-sm group-data-[collapsible=icon]:hidden tracking-tight">{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </span>
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

        {/* Admin group — only visible to super admin */}
        {isSuperAdmin && (
          <SidebarGroup className="mt-auto pt-4 border-t border-neutral-100">
            <SidebarGroupLabel className="text-[11px] font-semibold text-neutral-400 uppercase tracking-eyebrow group-data-[collapsible=icon]:hidden mb-1">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Dashboard Maestro"
                    isActive={pathname.startsWith("/admin")}
                    className={cn(
                      "transition-all h-10 rounded-xl",
                      pathname.startsWith("/admin")
                        ? "bg-neutral-900 text-white font-semibold"
                        : "text-neutral-600 hover:bg-neutral-50 font-medium"
                    )}
                    render={(props) => (
                      <a href="/admin" {...props} className={cn(props.className, "w-full")}>
                        <Shield className={cn("h-[18px] w-[18px] shrink-0 transition-colors", pathname.startsWith("/admin") ? "text-white" : "text-neutral-400")} strokeWidth={2} />
                        <span className="truncate text-sm group-data-[collapsible=icon]:hidden tracking-tight">Dashboard Maestro</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Base de Conocimiento"
                    isActive={pathname === "/knowledge" || pathname.startsWith("/knowledge/")}
                    className={cn(
                      "transition-all h-10 rounded-xl",
                      pathname === "/knowledge" || pathname.startsWith("/knowledge/")
                        ? "bg-neutral-900 text-white font-semibold"
                        : "text-neutral-600 hover:bg-neutral-50 font-medium"
                    )}
                    render={(props) => (
                      <a href="/knowledge" {...props} className={cn(props.className, "w-full")}>
                        <Library className={cn("h-[18px] w-[18px] shrink-0 transition-colors", pathname === "/knowledge" || pathname.startsWith("/knowledge/") ? "text-white" : "text-neutral-400")} strokeWidth={2} />
                        <span className="truncate text-sm group-data-[collapsible=icon]:hidden tracking-tight">Base de Conocimiento</span>
                      </a>
                    )}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: level, streak, profile */}
      <SidebarFooter className="border-t border-neutral-100 p-3 space-y-3 bg-white">
        {!loading && (
          <div className="overflow-hidden px-1 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <Zap className="h-4 w-4 text-brand-500 shrink-0" strokeWidth={2} />
                <span className="truncate text-[13px]">Nivel {level}</span>
              </div>
              <span className="font-semibold text-neutral-900 truncate text-[13px] tracking-tight tabular-nums">{totalXp.toLocaleString()} XP</span>
            </div>
            <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-1.5 bg-neutral-100" />
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-[12px] text-neutral-700 font-semibold mt-3 bg-neutral-50 w-fit px-2.5 py-1 rounded-full border border-neutral-100">
                <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500 fill-orange-500" />
                <span className="truncate tabular-nums">🔥 {streak} día{streak !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Mi Perfil"
              size="lg"
              className="bg-white hover:bg-neutral-50 border border-neutral-200 transition-all rounded-2xl h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl"
              render={(props) => (
                <a href="/perfil" {...props}>
                  <UserCircle className="h-6 w-6 text-neutral-700 shrink-0" strokeWidth={2} />
                  <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden ml-1">
                    <span className="font-semibold text-neutral-900 text-[13px] leading-tight tracking-tight">Mi perfil</span>
                    <span className="text-[11px] text-neutral-500 font-medium truncate">Ajustes y progreso</span>
                  </div>
                </a>
              )}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              className="text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl h-10"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span className="truncate text-sm group-data-[collapsible=icon]:hidden tracking-tight">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
