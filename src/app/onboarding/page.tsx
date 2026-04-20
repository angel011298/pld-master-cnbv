"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Calendar, GraduationCap, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" },
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [examDate, setExamDate] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const handleSaveAndGo = async () => {
    setSaving(true)
    try {
      if (examDate) {
        const sb = supabase()
        const { data: { session } } = await sb.auth.getSession()
        if (session?.user?.id) {
          await sb
            .from("user_profiles")
            .update({ exam_target_date: examDate })
            .eq("user_id", session.user.id)
        }
      }
      setSaved(true)
      await new Promise((r) => setTimeout(r, 600))
      router.push("/")
    } catch {
      router.push("/")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center space-y-3"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mx-auto"
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight">¡Bienvenido a PLD-Master!</h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Tu camino hacia la Certificación CNBV 2026 en PLD/FT empieza aquí. Configuremos tu perfil en segundos.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Feature highlights */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-black">¿Qué incluye la plataforma?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "Simulador de examen con IA (RAG)",
                  "Chatbot especializado en PLD/FT",
                  "Gamificación: XP y rachas diarias",
                  "Módulos alineados al programa CNBV",
                  "Análisis de tus documentos propios",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold">{feat}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Exam date picker */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  <CardTitle className="text-base font-black">¿Cuándo es tu examen?</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Opcional · Personaliza tu plan de estudio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border-2 border-gray-200 bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Guarda la fecha estimada de tu examen CNBV para que podamos ayudarte a estudiar a tiempo.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA button — full width */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="md:col-span-2"
          >
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-black rounded-2xl border-b-4 border-primary/70 gap-2"
                onClick={handleSaveAndGo}
                disabled={saving}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> ¡Listo! Abriendo tu Dashboard...
                  </>
                ) : saving ? (
                  "Guardando..."
                ) : (
                  <>
                    Ir al Dashboard <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
