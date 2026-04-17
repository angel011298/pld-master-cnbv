"use client"

import { motion } from "framer-motion"
import { Check, Lock, Play, Star, Zap, Flame, Trophy, GraduationCap, MessageSquare, ClipboardList } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { IngestDialog } from "@/components/IngestDialog"
import { useUserProfile } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"

const MODULES = [
  { id: "1", title: "Fundamentos e Instituciones Internacionales", status: "completed" as const },
  { id: "2", title: "Marco Jurídico Mexicano", status: "current" as const },
  { id: "3", title: "Prevención y Gestión de Riesgos (EBR)", status: "locked" as const },
  { id: "4", title: "Auditoría y Supervisión", status: "locked" as const },
  { id: "5", title: "Tipologías e Inteligencia Financiera", status: "locked" as const },
]

const LEVEL_XP = 1000

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } }),
}

export default function Home() {
  const { profile, loading, refetch } = useUserProfile()

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const levelProgress = totalXp % LEVEL_XP
  const level = Math.floor(totalXp / LEVEL_XP) + 1
  const completedModules = MODULES.filter((m) => m.status === "completed").length

  return (
    <div className="p-4 space-y-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-auto">

        {/* Welcome + Level — 2 cols */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
          <Card className="h-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black tracking-tight">
                Ruta CNBV 2026 🎯
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Certifícate en PLD/FT · {completedModules}/{MODULES.length} módulos completados
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Nivel {level}</span>
                <span className="text-primary">{levelProgress}/{LEVEL_XP} XP</span>
              </div>
              <Progress value={(levelProgress / LEVEL_XP) * 100} className="h-3" />
              <div className="flex gap-2 pt-2">
                <Link href="/simulator" className="flex-1">
                  <Button className="w-full font-bold" size="sm">
                    <GraduationCap className="h-4 w-4 mr-1" /> Simulador
                  </Button>
                </Link>
                <Link href="/chatbot" className="flex-1">
                  <Button variant="outline" className="w-full font-bold" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" /> Chatbot IA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Total — 1 col */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent">
            <CardContent className="flex flex-col items-center justify-center h-full py-8 gap-2">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="flex flex-col items-center gap-1"
              >
                <Zap className="h-10 w-10 text-secondary" />
                <span className="text-4xl font-black text-foreground">
                  {loading ? "—" : totalXp.toLocaleString()}
                </span>
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">XP Total</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Racha — 1 col */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
            <CardContent className="flex flex-col items-center justify-center h-full py-8 gap-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center gap-1"
              >
                <Flame className="h-10 w-10 text-orange-500" />
                <span className="text-4xl font-black text-foreground">
                  {loading ? "—" : streak}
                </span>
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Día{streak !== 1 ? "s" : ""} de Racha
                </span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Path — 2 cols */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
          <Card className="h-full border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Módulos de Estudio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MODULES.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    whileHover={mod.status !== "locked" ? { x: 4 } : {}}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      mod.status === "completed" ? "border-primary/30 bg-primary/5" :
                      mod.status === "current" ? "border-secondary/40 bg-secondary/5 shadow-sm" :
                      "border-gray-100 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm",
                      mod.status === "completed" ? "bg-primary" :
                      mod.status === "current" ? "bg-secondary" :
                      "bg-gray-300"
                    )}>
                      {mod.status === "completed" ? <Check className="h-4 w-4" /> :
                       mod.status === "current" ? <Play className="h-3 w-3" /> :
                       <Lock className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{i + 1}. {mod.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{mod.status === "completed" ? "Completado" : mod.status === "current" ? "En progreso" : "Bloqueado"}</p>
                    </div>
                    {mod.status === "current" && (
                      <Star className="h-4 w-4 text-secondary shrink-0 ml-auto animate-pulse" />
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions — 1 col */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black">Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/simulator", icon: GraduationCap, label: "Simulador CENEVAL", color: "bg-primary" },
                { href: "/chatbot", icon: MessageSquare, label: "Chatbot IA", color: "bg-secondary" },
                { href: "/tramites", icon: ClipboardList, label: "Guía de Trámites", color: "bg-orange-500" },
              ].map((item, i) => (
                <motion.div key={item.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href={item.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", item.color)}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Ingest Dialog — 2 cols */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
          <IngestDialog onImportDone={refetch} />
        </motion.div>

      </div>
    </div>
  )
}
