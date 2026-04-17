"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  ExternalLink, AlertTriangle, Clock, CreditCard,
  FileText, Calendar, Award, BookOpen, Info,
  ClipboardList, Building2, Phone, Mail
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  status: "completed" | "active" | "pending"
  timeEstimate: string
  details: {
    description: string
    requirements?: string[]
    links?: { label: string; url: string }[]
    warnings?: string[]
    tips?: string[]
    cost?: string
  }
}

const STEPS: Step[] = [
  {
    id: "1",
    title: "Verifica tu Elegibilidad",
    subtitle: "Requisitos previos antes de inscribirte",
    icon: <ClipboardList className="h-5 w-5" />,
    color: "bg-blue-500",
    status: "active",
    timeEstimate: "30 min",
    details: {
      description:
        "Antes de iniciar el proceso, confirma que cumples con los requisitos que establece la CNBV para presentar el examen de certificación PLD/FT.",
      requirements: [
        "Ser funcionario designado o aspirante a LAFT en una entidad financiera supervisada por CNBV",
        "Contar con título profesional o carta de pasante (licenciatura mínima)",
        "Tener al menos 1 año de experiencia en áreas de PLD/FT o Cumplimiento",
        "No tener inhabilitación vigente ante la SHCP o CNBV",
        "Contar con RFC activo y e.firma (FIEL) vigente del SAT",
      ],
      warnings: [
        "El examen está diseñado para el personal de instituciones reguladas: bancos, SOFOM, casas de bolsa, fintechs (ITP/IFPE), SOCAP/SOFIPO, entre otras.",
        "Si tu entidad aún no está inscrita en el padrón CNBV, deberá regularizarse primero.",
      ],
      links: [
        { label: "Más Información Certificación CNBV (PDF oficial)", url: "https://drive.google.com/file/d/12z7as4W82qzXzB-tZjKl_pohuF5rtwHs/view" },
        { label: "Preguntas Frecuentes CertPLD 2026 (PDF)", url: "https://drive.google.com/file/d/1IAfuhZVZvZYgivKBhqiMSzlPaS149Fm3/view" },
        { label: "Lista de entidades supervisadas CNBV", url: "https://www.cnbv.gob.mx/Paginas/entidades.aspx" },
      ],
    },
  },
  {
    id: "2",
    title: "Registro en el Portal CENEVAL",
    subtitle: "Crea tu cuenta y solicita tu ficha de registro",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-violet-500",
    status: "pending",
    timeEstimate: "1-2 días",
    details: {
      description:
        "El examen de certificación PLD/FT es administrado por CENEVAL bajo convenio con la CNBV. Debes crear una cuenta en el portal oficial de CENEVAL para gestionar tu inscripción.",
      requirements: [
        "Accede a portal.ceneval.edu.mx y crea una cuenta con tu CURP y correo institucional",
        "Selecciona el examen: 'Certificación en Prevención de Lavado de Dinero y Financiamiento al Terrorismo (CNBV)'",
        "Carga tu documentación: título/cédula profesional, identificación oficial vigente, comprobante de domicilio reciente",
        "Descarga tu ficha de pago una vez validada tu solicitud",
      ],
      links: [
        { label: "Convocatoria 2026 (PDF oficial)", url: "https://drive.google.com/file/d/1febe6e9PcQTKtVXb6duqLxOh76A3XjAq/view" },
        { label: "Instructivo Obtención Certificado (PDF)", url: "https://drive.google.com/file/d/1dsSWWEFNrAk5B931tLoVoYkrJq_fAXVl/view" },
        { label: "Aviso de Privacidad Certificación (PDF)", url: "https://drive.google.com/file/d/1-_dAuQOOm4VBFEICHJ2KuemNztogbQj_/view" },
        { label: "Portal CENEVAL (registro)", url: "https://portal.ceneval.edu.mx" },
      ],
      tips: [
        "Usa tu correo institucional (@nombreempresa.com), evita correos gratuitos como Gmail para documentos oficiales.",
        "Tus documentos deben estar en PDF, resolución mínima 200 dpi, peso máximo 2MB cada uno.",
        "El nombre en todos los documentos debe coincidir exactamente — diferencias en acentos pueden causar rechazo.",
      ],
      warnings: [
        "El sistema de CENEVAL puede tardar hasta 72 horas hábiles en validar tu expediente.",
      ],
    },
  },
  {
    id: "3",
    title: "Pago de Derechos",
    subtitle: "Costo del examen y métodos de pago",
    icon: <CreditCard className="h-5 w-5" />,
    color: "bg-emerald-500",
    status: "pending",
    timeEstimate: "1 día",
    details: {
      description:
        "Una vez validada tu solicitud, recibirás una ficha de pago. El costo del examen de certificación CNBV PLD/FT es el siguiente:",
      cost: "~$2,500 – $3,500 MXN (varía por convocatoria vigente)",
      requirements: [
        "Pago mediante ficha bancaria en BBVA, Santander o HSBC (ventanilla o app)",
        "Transferencia SPEI al número de convenio indicado en la ficha",
        "Tarjeta de crédito/débito en el portal CENEVAL (aplica comisión bancaria del ~3.5%)",
        "Algunos empleadores cubren este costo — consulta tu área de Recursos Humanos",
      ],
      tips: [
        "Guarda el comprobante de pago en formato PDF — lo necesitarás el día del examen.",
        "El pago tiene vigencia limitada (generalmente 5 días hábiles). No dejes vencer la ficha.",
        "Si tu entidad tiene convenio corporativo con CENEVAL, el proceso y costo puede diferir.",
      ],
      warnings: [
        "No existen reembolsos una vez confirmado el pago. En caso de cancelación, puedes solicitar reprogramación con al menos 5 días hábiles de anticipación.",
      ],
      links: [
        { label: "Manual de Pago de Derechos PLD (PDF oficial)", url: "https://drive.google.com/file/d/1wnKQD6JvPqMS-K3lacbiJZnI4K3fxcD2/view" },
        { label: "Convocatoria 2026 (costos vigentes)", url: "https://drive.google.com/file/d/1febe6e9PcQTKtVXb6duqLxOh76A3XjAq/view" },
      ],
    },
  },
  {
    id: "4",
    title: "Programación del Examen",
    subtitle: "Selecciona fecha, sede y modalidad",
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-orange-500",
    status: "pending",
    timeEstimate: "15 min",
    details: {
      description:
        "Después de confirmar tu pago, el portal de CENEVAL habilitará la agenda para elegir tu fecha y sede. El examen puede presentarse en modalidad presencial o en línea (con supervisión remota).",
      requirements: [
        "Modalidad Presencial: centros autorizados CENEVAL en CDMX, Guadalajara, Monterrey, y otras plazas según convocatoria",
        "Modalidad En Línea (ProProctor): requiere computadora con cámara, micrófono, conexión estable ≥10 Mbps y ambiente sin distractores",
        "Elige tu sede/modalidad con al menos 10 días hábiles de anticipación",
        "Confirma tu cita y descarga tu Pase de Admisión desde el portal",
      ],
      tips: [
        "Los sábados suelen tener más disponibilidad en sedes presenciales.",
        "Para la modalidad en línea, realiza la prueba técnica de ProProctor al menos 3 días antes del examen.",
        "El examen dura aproximadamente 3 horas con 120 reactivos de opción múltiple.",
      ],
      links: [
        { label: "Instructivo Certificación CNBV (PDF completo)", url: "https://drive.google.com/file/d/1dsSWWEFNrAk5B931tLoVoYkrJq_fAXVl/view" },
        { label: "Preguntas Frecuentes 2026", url: "https://drive.google.com/file/d/1IAfuhZVZvZYgivKBhqiMSzlPaS149Fm3/view" },
      ],
    },
  },
  {
    id: "5",
    title: "Preparación Final y Día del Examen",
    subtitle: "Qué llevar y cómo presentarte",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-primary",
    status: "pending",
    timeEstimate: "Día D",
    details: {
      description:
        "El día del examen deberás presentarte con los documentos correctos y en el tiempo indicado. El examen consta de 120 preguntas de opción múltiple sobre temas de PLD/FT conforme al temario oficial CNBV.",
      requirements: [
        "Identificación oficial vigente (INE/IFE, pasaporte o cédula profesional) — sin excepciones",
        "Pase de Admisión impreso o digital (código QR funcional)",
        "Comprobante de pago (por si acaso)",
        "Presentarte 30 minutos antes del horario programado (presencial)",
        "Para en línea: ambiente cerrado, silencioso, sin personas adicionales, escritorio despejado",
      ],
      tips: [
        "El examen cubre: Marco jurídico, Operaciones inusuales y relevantes, Gestión de riesgos EBR, GAFI/FATF, Auditoría interna PLD.",
        "La calificación mínima aprobatoria es 600/1000 puntos (escala CENEVAL).",
        "No se permite material de consulta, calculadora, ni dispositivos electrónicos adicionales.",
        "Usa la plataforma Simulador de esta app para practicar hasta el día anterior.",
      ],
      warnings: [
        "Llegadas tarde de más de 15 minutos no son aceptadas — perderás el derecho sin reembolso.",
        "El examen solo puede presentarse 3 veces. La tercera reprobación implica inhabilitación temporal.",
      ],
    },
  },
  {
    id: "6",
    title: "Resultados y Certificado",
    subtitle: "Consulta tu calificación y obtén tu certificado",
    icon: <Award className="h-5 w-5" />,
    color: "bg-secondary",
    status: "pending",
    timeEstimate: "15-30 días hábiles",
    details: {
      description:
        "Los resultados son emitidos por CENEVAL y reportados a la CNBV. Si apruebas, recibirás tu Certificado de Suficiencia PLD/FT con vigencia de 3 años.",
      requirements: [
        "Consulta tus resultados en portal.ceneval.edu.mx con tu número de folio",
        "El resultado preliminar aparece en 5-10 días hábiles tras el examen",
        "El certificado oficial (con firma y sello CNBV) se emite en 15-30 días hábiles adicionales",
        "Descarga e imprime tu certificado desde el portal — envíalo a tu área de Cumplimiento",
        "Notifica a tu entidad la obtención del certificado para actualizar el expediente CNBV",
      ],
      tips: [
        "El certificado tiene vigencia de 3 años. Programa tu recertificación con 6 meses de anticipación.",
        "Guarda una copia digital en la nube (Drive, OneDrive) además de la física.",
        "Si repruebas, puedes reinscribirte a la siguiente convocatoria — no hay tiempo de espera mínimo entre intentos.",
      ],
      warnings: [
        "Los resultados no pueden ser impugnados directamente. Si crees que hubo un error técnico, tienes 5 días hábiles para solicitarlo vía escrito a CENEVAL.",
        "El certificado vencido implica inhabilitación para operar como LAFT — programa tu renovación a tiempo.",
      ],
      links: [
        { label: "Instructivo Obtención Certificado (paso a paso)", url: "https://drive.google.com/file/d/1dsSWWEFNrAk5B931tLoVoYkrJq_fAXVl/view" },
        { label: "Preguntas Frecuentes sobre Resultados", url: "https://drive.google.com/file/d/1IAfuhZVZvZYgivKBhqiMSzlPaS149Fm3/view" },
        { label: "Portal de Resultados CENEVAL", url: "https://portal.ceneval.edu.mx/resultados" },
      ],
    },
  },
]

const RECURSOS = [
  // Trámites
  { name: "Convocatoria 2026", size: "175 KB", url: "https://drive.google.com/file/d/1febe6e9PcQTKtVXb6duqLxOh76A3XjAq/view", category: "tramites" },
  { name: "Preguntas Frecuentes CertPLD 2026", size: "236 KB", url: "https://drive.google.com/file/d/1IAfuhZVZvZYgivKBhqiMSzlPaS149Fm3/view", category: "tramites" },
  { name: "Manual de Pago de Derechos", size: "953 KB", url: "https://drive.google.com/file/d/1wnKQD6JvPqMS-K3lacbiJZnI4K3fxcD2/view", category: "tramites" },
  { name: "Instructivo Obtención Certificado", size: "1.5 MB", url: "https://drive.google.com/file/d/1dsSWWEFNrAk5B931tLoVoYkrJq_fAXVl/view", category: "tramites" },
  { name: "Más Información Certificación", size: "195 KB", url: "https://drive.google.com/file/d/12z7as4W82qzXzB-tZjKl_pohuF5rtwHs/view", category: "tramites" },
  { name: "Aviso de Privacidad 2026", size: "161 KB", url: "https://drive.google.com/file/d/1-_dAuQOOm4VBFEICHJ2KuemNztogbQj_/view", category: "tramites" },
  // Estudio
  { name: "Guía CNBV PLD/FT 11ª ed. 2025", size: "1.97 MB", url: "https://drive.google.com/file/d/1dxwxrLF_0solq0y7lFHOb_jltDEG1nAb/view", category: "estudio" },
  { name: "Temario Oficial CNBV 2026", size: "365 KB", url: "https://drive.google.com/file/d/1CzO-2bna1hLI25OO00NYYwpJafY583Ti/view", category: "estudio" },
  { name: "LFPIORPI (Ley Federal PLD)", size: "570 KB", url: "https://drive.google.com/file/d/16HS0HVfFOndTJWtOnmiZ-KfnGLlivTub/view", category: "estudio" },
  { name: "Recomendaciones y Metodología Dic 2025", size: "4.3 MB", url: "https://drive.google.com/file/d/1xcBBonqQf6OUsqiQhbCP8yg6ZHDi-n-4/view", category: "estudio" },
  { name: "Guía de Estudio Módulo 1", size: "2.7 MB", url: "https://drive.google.com/file/d/1tiA9V2druGEuM2zo2s7MM_sqWktVfQhj/view", category: "estudio" },
  { name: "Repaso General PLD (compress)", size: "1.1 MB", url: "https://drive.google.com/file/d/1Zcn_3J-v4Jy50dgzh81W5KXBt9ozqUNM/view", category: "estudio" },
  { name: "Definiciones PLD FT", size: "1.4 MB", url: "https://drive.google.com/file/d/1ultvTFfO3c8-70ePPAeF_1XEEKYwYf-8/view", category: "estudio" },
  { name: "Glosario PLD", size: "209 KB", url: "https://drive.google.com/file/d/1XTNB7qr1pTVO_WGY1YBHq7Ywa2kb87P6/view", category: "estudio" },
  // Ejercicios
  { name: "Cliente de Alto Riesgo", size: "76 KB", url: "https://drive.google.com/file/d/19f35GOm1YTl7jahnUWl9gbQWPCS5ZCle/view", category: "ejercicios" },
  { name: "Bonus Reportes 24 — Ejercicio", size: "429 KB", url: "https://drive.google.com/file/d/14V6OP6TKtqoj9DInBEPPCx8EzptEzml3/view", category: "ejercicios" },
  { name: "Bonus Reportes 24 — Respuestas", size: "431 KB", url: "https://drive.google.com/file/d/1PfeJra3N2gjk0H5DxxRsjnQB8yBPKfiZ/view", category: "ejercicios" },
  { name: "Bonus Reportes 24 — Colores", size: "487 KB", url: "https://drive.google.com/file/d/1DVm4duvBmb6Czlxs4PWHZL1vPIhnDw_I/view", category: "ejercicios" },
] as const

const CONTACTS = [
  { icon: <Building2 className="h-4 w-4" />, label: "CENEVAL Atención", value: "55 5601-6182" },
  { icon: <Phone className="h-4 w-4" />, label: "CNBV PLD/FT", value: "55 1454-6000 ext. 6300" },
  { icon: <Mail className="h-4 w-4" />, label: "Soporte CENEVAL", value: "atencion@ceneval.edu.mx" },
]

export function TramitesGuide() {
  const [expandedStep, setExpandedStep] = React.useState<string | null>("1")
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set())

  const toggleStep = (id: string) => {
    setExpandedStep((prev) => (prev === id ? null : id))
  }

  const toggleComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progress = Math.round((completedSteps.size / STEPS.length) * 100)

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          Guía de Certificación CNBV
        </h1>
        <p className="text-muted-foreground">
          Proceso completo de inscripción, pago y obtención del certificado PLD/FT 2026
        </p>

        {/* Progress bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-muted-foreground">{completedSteps.size} de {STEPS.length} pasos completados</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.has(step.id)
          const isExpanded = expandedStep === step.id

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className={cn(
                "border-2 transition-all cursor-pointer",
                isCompleted ? "border-green-300 bg-green-50/50" :
                isExpanded ? "border-primary/40 shadow-md" : "border-gray-200 hover:border-primary/30"
              )}>
                {/* Step Header */}
                <div
                  className="flex items-center gap-4 p-4"
                  onClick={() => toggleStep(step.id)}
                >
                  {/* Number / Check */}
                  <button
                    onClick={(e) => toggleComplete(e, step.id)}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : `${step.color} border-transparent text-white`
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Paso {i + 1}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{step.timeEstimate}
                      </span>
                    </div>
                    <p className="font-black text-base">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                  </div>

                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-4 border-t border-gray-100 pt-4">
                        <p className="text-sm text-foreground/80 leading-relaxed">{step.details.description}</p>

                        {step.details.cost && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="text-sm font-bold text-emerald-700">Costo: {step.details.cost}</span>
                          </div>
                        )}

                        {step.details.requirements && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                              <ClipboardList className="h-3.5 w-3.5" /> Requisitos / Pasos
                            </p>
                            <ul className="space-y-1.5">
                              {step.details.requirements.map((req, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm">
                                  <Circle className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0 fill-primary/20" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.details.tips && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                              <Info className="h-3.5 w-3.5" /> Consejos Clave
                            </p>
                            <ul className="space-y-1.5">
                              {step.details.tips.map((tip, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                                  <Info className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />
                                  <span className="text-blue-900">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.details.warnings && (
                          <div className="space-y-1.5">
                            {step.details.warnings.map((warn, j) => (
                              <div key={j} className="flex items-start gap-2 text-sm bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600 shrink-0" />
                                <span className="text-amber-900">{warn}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {step.details.links && (
                          <div className="flex flex-wrap gap-2">
                            {step.details.links.map((link, j) => (
                              <a
                                key={j}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Mark complete button */}
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          onClick={(e) => toggleComplete(e, step.id)}
                          className="w-full mt-2"
                        >
                          {isCompleted ? (
                            <><Circle className="h-4 w-4 mr-2" /> Marcar como pendiente</>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como completado</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recursos Descargables */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Documentos Oficiales
            </CardTitle>
            <CardDescription>PDFs de la CNBV disponibles para descarga directa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RECURSOS.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 transition-all group",
                    r.category === "tramites" ? "border-violet-200" :
                    r.category === "estudio" ? "border-blue-200" : "border-gray-200"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    r.category === "tramites" ? "bg-violet-100" :
                    r.category === "estudio" ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <FileText className={cn(
                      "h-4 w-4",
                      r.category === "tramites" ? "text-violet-600" :
                      r.category === "estudio" ? "text-blue-600" : "text-gray-500"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.size}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Contacto y Soporte Oficial
            </CardTitle>
            <CardDescription>Para dudas sobre el proceso de certificación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CONTACTS.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">{c.icon}</span>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                    <p className="text-sm font-bold">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
