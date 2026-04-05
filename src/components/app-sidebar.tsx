"use client"

import * as React from "react"
import {
  Map,
  GraduationCap,
  MessageSquare,
  Library,
  Trophy,
  Building2,
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

const navItems = [
  {
    title: "Ruta de Aprendizaje",
    url: "/",
    icon: Map,
  },
  {
    title: "Simulador CENEVAL",
    url: "/simulator",
    icon: GraduationCap,
  },
  {
    title: "Chatbot IA",
    url: "/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Entidades Financieras",
    url: "/entities",
    icon: Building2,
  },
  {
    title: "Base de Conocimiento",
    url: "/knowledge",
    icon: Library,
  },
]

export function AppSidebar() {
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
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progreso</span>
            <span className="font-bold">1,250 XP</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary/20">
            <div className="h-full w-[35%] rounded-full bg-primary" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
