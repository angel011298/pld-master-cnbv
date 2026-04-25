"use client"

import { motion } from "framer-motion"
import { Check, Lock, Zap, Flame, Trophy, GraduationCap, MessageSquare, ClipboardList, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"

const BASE_MODULES = [
  { id: "1", title: "Fundamentos e Instituciones Internacionales", isPremium: false },
  { id: "2", title: "Marco Jurídico Mexicano", isPremium: false },
  { id: "3", title: "Prevención y Gestión de Riesgos (EBR)", isPremium: true },
  { id: "4", title: "Auditoría y Supervisión", isPremium: true },
  { id: "5", title: "Tipologías e Inteligencia Financiera", isPremium: true },
]

const LEVEL_XP = 1000

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } }),
}

export default function Home() {
  const { profile, loading } = useUserProfile()

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const levelProgress = totalXp % LEVEL_XP
  const level = Math.floor(totalXp / LEVEL_XP) + 1
  
  const isFreeTier = profile?.effectiveTier !== "premium"
  
  const modules = BASE_MODULES.map(mod => ({
    ...mod,
    status: mod.isPremium && isFreeTier ? "locked" as const : "available" as const,
  }))

  const availableModules = modules.filter((m) => m.status === "available").length

  // CORRECCIÓN: El endpoint de checkout espera un POST. Hacerlo con window.location crearía un error GET.
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "individual" }), // O extrae del plan
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error("Error al iniciar pago", e)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      {/* Bento Grid */}
      <div className="grid w-full grid-cols-1 gap-4 auto-rows-auto md:grid-cols-4">

        {/* Welcome + Level — 2 cols */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
          <Card className="h-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black tracking-tight">
                Ruta CNBV 2026 🎯
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">
                Certifícate en PLD/FT · {availableModules}/{modules.length} módulos disponibles con tu plan actual
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
                  <Button className="w-full font-bold btn-primary-pushable" size="sm">
                    <GraduationCap className="h-4 w-4 mr-1" /> Simulador
                  </Button>
                </Link>
                <Link href="/chatbot" className="flex-1">
                  <Button variant="outline" className="w-full font-bold border-2" size="sm">
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
                {modules.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    whileHover={mod.status !== "locked" ? { x: 4 } : {}}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      mod.status === "available"
                        ? "border-primary/30 bg-primary/5"
                        : "border-gray-100 bg-gray-50/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm",
                      mod.status === "available" ? "bg-primary" : "bg-gray-300"
                    )}>
                      {mod.status === "available" ? <Check className="h-4 w-4" /> : <Lock className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div>
                        <p className={cn("text-sm font-bold truncate", mod.status === "locked" && "text-gray-500")}>
                          {i + 1}. {mod.title}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground capitalize">
                          {mod.status === "available" ? "Disponible" : "Bloqueado por plan"}
                        </p>
                      </div>
                      {mod.status === "locked" && mod.isPremium && isFreeTier && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-md tracking-wider">
                          Premium
                        </span>
                      )}
                    </div>
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
                { href: "/simulator", icon: GraduationCap, label: "Simulador CNBV", color: "bg-primary" },
                { href: "/chatbot", icon: MessageSquare, label: "Chatbot IA", color: "bg-secondary" },
                { href: "/tramites", icon: ClipboardList, label: "Guía de Trámites", color: "bg-orange-500" },
              ].map((item) => (
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

        {/* PREMIUM BANNER (Se oculta si el usuario ya es premium) — 1 col */}
        {isFreeTier && (
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-1">
            <Card className="h-full border-2 border-amber-300 border-b-[6px] bg-gradient-to-br from-amber-50 to-yellow-100 overflow-hidden relative group">
              <div className="absolute -right-4 -top-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Crown className="h-32 w-32 text-amber-500" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xl font-black text-amber-800 flex items-center gap-2 tracking-tight">
                  <Crown className="h-6 w-6 text-amber-600" /> Certifik Pro
                </CardTitle>
                <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mt-1">
                  Desbloquea Todo
                </p>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm font-medium text-amber-900/80 leading-snug">
                  Accede a simuladores infinitos y materiales exclusivos para asegurar tu certificación CNBV 2026.
                </p>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Hazte Premium <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  )
}
