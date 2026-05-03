"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowRight, CheckCircle2, Loader2, Bot,
  BarChart2, Target, Building2, ChevronRight, Zap,
  BookOpen, GraduationCap, Users, Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DemoQuestion } from "@/app/api/demo-questions/route";

// ─── Demo Quiz ────────────────────────────────────────────────────────────────

function DemoQuiz() {
  const [questions, setQuestions] = React.useState<DemoQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/demo-questions")
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    if (revealed) return;
    setSelected(key);
    setRevealed(true);
    if (key === questions[currentIdx]?.respuesta_correcta) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border-2 border-emerald-200 p-8 text-center"
      >
        <div className="text-5xl mb-4">{score === 3 ? "🏆" : score >= 2 ? "⭐" : "📚"}</div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          {score}/{questions.length} correctas
        </h3>
        <p className="text-slate-600 mb-6">
          {score === 3
            ? "¡Perfecto! Tienes buena base. Ahora profundiza con 200+ preguntas."
            : score >= 2
            ? "¡Bien! Todavía hay temas que reforzar antes del examen."
            : "El examen CNBV es difícil. Empieza a prepararte hoy."}
        </p>
        <Link href="/trial">
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Practica con 200+ preguntas <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
      </motion.div>
    );
  }

  const q = questions[currentIdx];
  const isCorrect = selected === q.respuesta_correcta;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
      {/* Progress */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Pregunta {currentIdx + 1} de {questions.length} · Tema: GAFI
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i < currentIdx ? "bg-emerald-500" : i === currentIdx ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-base font-semibold text-slate-900 mb-5 leading-snug">
              {q.pregunta}
            </h3>

            <div className="space-y-2 mb-4">
              {q.opciones.map((opcion) => {
                const isSelected = selected === opcion.key;
                const isCorrectOpt = opcion.key === q.respuesta_correcta;
                let cls =
                  "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";

                if (!revealed) {
                  cls += "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-800 cursor-pointer";
                } else if (isCorrectOpt) {
                  cls += "border-emerald-500 bg-emerald-50 text-emerald-900";
                } else if (isSelected) {
                  cls += "border-red-400 bg-red-50 text-red-900";
                } else {
                  cls += "border-slate-200 text-slate-400 opacity-60";
                }

                return (
                  <button key={opcion.key} className={cls} onClick={() => handleSelect(opcion.key)} disabled={revealed}>
                    <span className="font-bold mr-2">{opcion.key}.</span>
                    {opcion.texto}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 text-sm mb-4 ${
                  isCorrect ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-amber-50 border border-amber-200 text-amber-800"
                }`}
              >
                <span className="font-bold">{isCorrect ? "✓ Correcto. " : "✗ Incorrecto. "}</span>
                {q.explicacion}
              </motion.div>
            )}

            {revealed && (
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {currentIdx + 1 >= questions.length ? "Ver mi resultado" : "Siguiente pregunta"}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Feature Cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Target,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Simulacros cronometrados",
    desc: "60 preguntas en formato real CNBV. Estadísticas por tema al terminar.",
  },
  {
    icon: Bot,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Tutor IA con citas",
    desc: "Gemini Flash responde tus dudas con referencias exactas a los documentos oficiales CNBV.",
  },
  {
    icon: BarChart2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Mapa de dominio",
    desc: "Ve tu porcentaje de acierto por cada uno de los 7 temas del examen y enfoca tu estudio.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Repaso espaciado (SM-2)",
    desc: "El algoritmo de memoria espaciada decide qué preguntas repasar hoy para que no olvides nada.",
  },
];

const INCLUDED_LIST = [
  "200+ reactivos del banco oficial CNBV",
  "7 temas completos del temario oficial",
  "Simulacro cronometrado tipo examen real",
  "Tutor IA Gemini con citas a documentos",
  "Racha diaria y XP para mantener motivación",
  "Mapa de dominio por tema con semáforo",
  "Algoritmo SM-2 de repaso espaciado",
  "Panel corporativo para equipos",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (!error) {
      window.location.href = "/dashboard";
    } else {
      alert("Error al iniciar sesión. Verifica tu correo y contraseña.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      alert("Error iniciando sesión con Google: " + error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Shield className="h-6 w-6 text-blue-700" />
            <span className="font-black text-xl text-slate-900">Certifik PLD</span>
          </div>

          <form onSubmit={handleLogin} className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-500 hidden xl:block">Ya tengo cuenta:</span>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 px-3 rounded-lg border border-slate-300 text-sm w-44 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-9 px-3 rounded-lg border border-slate-300 text-sm w-36 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Entrar"}
            </button>
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
              className="h-9 px-4 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              {googleLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
              )}
              Google
            </button>
          </form>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
              <GraduationCap className="h-4 w-4" />
              Certificación CNBV PLD/FT · 2026
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
              ¿Vas a presentar el<br />
              <span className="text-yellow-400">examen CNBV de PLD/FT</span>?
            </h1>

            <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Prepárate como si ya lo hubieras pasado.
              <br />
              Banco de 200+ reactivos, simulacros cronometrados y tutor IA con citas a documentos oficiales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trial">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-8 py-4 rounded-xl text-lg shadow-lg transition-colors"
                >
                  Comenzar prueba gratis <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <a href="#demo">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
                >
                  Ver preguntas de muestra
                </motion.button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-blue-300">
              {["Sin tarjeta de crédito", "Acceso inmediato", "15 preguntas gratis"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DEMO PÚBLICA ── */}
      <section id="demo" className="py-20 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Demo gratuita
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              Responde 3 preguntas reales del examen
            </h2>
            <p className="text-slate-500">
              Sin registro. Preguntas del tema <strong>GAFI</strong> — uno de los más evaluados.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <DemoQuiz />
          </motion.div>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Te gustó?{" "}
            <Link href="/trial" className="text-blue-600 hover:underline font-semibold">
              Practica con 200+ preguntas → Comenzar gratis
            </Link>
          </p>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              Todo lo que necesitas para aprobar
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Certifik PLD está diseñado específicamente para el examen CNBV. No estudias de más, no estudias de menos.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Included list + CTA */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-5">
                Incluido en la prueba gratuita y el plan premium:
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {INCLUDED_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-3 text-center">
              <div className="text-slate-400 text-sm">Plan individual</div>
              <div className="text-white font-black text-4xl">$2,999</div>
              <div className="text-slate-400 text-xs">MXN · pago único · 12 meses</div>
              <Link href="/trial">
                <button className="mt-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-8 py-3 rounded-xl transition-colors flex items-center gap-2">
                  Empieza gratis <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL SOCIAL PROOF ── */}
      <section className="py-12 px-4 bg-blue-50 border-y border-blue-100">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "200+", label: "Reactivos del banco CNBV" },
            { value: "7", label: "Temas del temario oficial" },
            { value: "98%", label: "Cobertura del examen real" },
            { value: "1", label: "Plataforma especializada en PLD/FT" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-3xl font-black text-blue-700">{s.value}</span>
              <span className="text-sm text-slate-600 mt-1 max-w-[120px]">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARA EMPRESAS ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold text-blue-200 mb-6">
                <Building2 className="h-3.5 w-3.5" />
                Para bancos, SOFOMES y Fintechs
              </div>
              <h2 className="text-3xl font-black mb-4">
                Certifica a todo tu equipo de cumplimiento
              </h2>
              <p className="text-blue-200 mb-6 leading-relaxed">
                La licencia corporativa incluye 5 accesos premium completos con un dashboard de administrador
                para monitorear el progreso de cada integrante de tu Unidad de Cumplimiento.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "5 usuarios premium simultáneos",
                  "Dashboard admin con semáforo de preparación",
                  "Exportación de reportes CSV por usuario",
                  "Invitaciones por email con token seguro",
                  "Soporte prioritario directo",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 bg-white/10 rounded-2xl p-8 text-center min-w-[220px]">
              <Users className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
              <div className="text-4xl font-black text-yellow-400 mb-1">$9,999</div>
              <div className="text-blue-300 text-xs mb-6">MXN · anual · 5 usuarios</div>
              <Link href="/register/corporativo">
                <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Contratar licencia <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <p className="text-blue-300 text-xs mt-3">Facturación CFDI 4.0</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">
              El examen CNBV no espera. <br />Tú tampoco deberías.
            </h2>
            <p className="text-slate-600 mb-8">
              Empieza hoy con 15 preguntas gratuitas. Sin tarjeta de crédito, sin registro complicado.
            </p>
            <Link href="/trial">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-xl text-lg shadow-lg transition-colors"
              >
                Comenzar prueba gratis <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Shield className="h-4 w-4" />
            Certifik PLD
          </div>
          <div className="flex gap-6">
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/trial" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Comenzar gratis</Link>
          </div>
          <p>© 2026 Certifik PLD. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
