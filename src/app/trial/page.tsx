"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { X, Heart, Zap, ShieldAlert, BookOpen, BrainCircuit, Target, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Preguntas reales PLD/FT CNBV
const TRIAL_QUESTIONS = [
  // Módulo 1: Conceptos Básicos y Fases (Opción Múltiple)
  { type: "Opción Múltiple", icon: BrainCircuit, question: "¿Cuáles son las 3 etapas clásicas del Lavado de Dinero?", options: ["Colocación, Estratificación e Integración", "Captación, Inversión y Retorno", "Ocultamiento, Inversión y Disfrute"], answer: "Colocación, Estratificación e Integración" },
  { type: "Opción Múltiple", icon: Target, question: "Al fraccionar una cantidad de dinero importante en múltiples depósitos pequeños para evadir los umbrales de reporte, se le conoce como:", options: ["Fraude cibernético", "Estructuración (Smurfing)", "Testaferrato"], answer: "Estructuración (Smurfing)" },
  { type: "Opción Múltiple", icon: BookOpen, question: "Una 'Operación Relevante' es aquella que se realiza con billetes y monedas metálicas por un monto igual o superior a:", options: ["$5,000 USD", "$10,000 USD", "$7,500 USD"], answer: "$7,500 USD" },
  
  // Módulo 2: Verdadero o Falso
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "Un Presidente Municipal en funciones en México es considerado una Persona Políticamente Expuesta (PEP).", options: ["Verdadero", "Falso"], answer: "Verdadero" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "El Oficial de Cumplimiento puede ser el Auditor Interno de la entidad financiera.", options: ["Verdadero", "Falso"], answer: "Falso" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "Las SOFOMES ENR no están obligadas a tener un manual de PLD/FT.", options: ["Verdadero", "Falso"], answer: "Falso" },

  // Módulo 3: Relación / Completar Texto (Simulado)
  { type: "Completar Texto", icon: BookOpen, question: "El ____________ es el órgano colegiado encargado de vigilar el cumplimiento del manual de PLD en entidades con más de 25 empleados.", options: ["Consejo de Administración", "Comité de Comunicación y Control", "Grupo de Auditoría"], answer: "Comité de Comunicación y Control" },
  { type: "Completar Texto", icon: Target, question: "Las operaciones ____________ son aquellas actividades, conductas o comportamientos de directivos o empleados que pudiesen contravenir el manual de PLD.", options: ["Inusuales", "Relevantes", "Internas Preocupantes"], answer: "Internas Preocupantes" },
  
  // Módulo 4: Casos Prácticos
  { type: "Caso Práctico", icon: BrainCircuit, question: "Un cliente con perfil transaccional de $10,000 MXN mensuales recibe una transferencia de $2,000,000 MXN sin justificación clara. ¿Qué reporte se debe generar?", options: ["Reporte de Operación Inusual", "Reporte de Operación Relevante", "Reporte de 24 horas"], answer: "Reporte de Operación Inusual" },
  { type: "Caso Práctico", icon: Target, question: "El sistema detecta coincidencias del nombre de un cliente con la lista OFAC. ¿En qué plazo se debe presentar el reporte a la CNBV?", options: ["30 días", "60 días", "24 horas"], answer: "24 horas" },

  // Módulo 5: Enfoque Basado en Riesgo (EBR)
  { type: "Opción Múltiple", icon: BookOpen, question: "¿Cuáles son las 4 etapas del Enfoque Basado en Riesgo (EBR)?", options: ["Diseño, Evaluación, Mitigación, Auditoría", "Identificación, Medición, Mitigación, Monitoreo", "Prevención, Detección, Reporte, Bloqueo"], answer: "Identificación, Medición, Mitigación, Monitoreo" },
  { type: "Completar Texto", icon: Target, question: "Para la Medición del riesgo, se debe considerar la ___________ y el ___________ del riesgo.", options: ["Probabilidad / Impacto", "Frecuencia / Daño", "Gravedad / Monto"], answer: "Probabilidad / Impacto" },
  
  // Módulo 6: Conocimiento del Cliente
  { type: "Opción Múltiple", icon: BrainCircuit, question: "¿Qué elemento es fundamental en la política de Identificación del Cliente?", options: ["Buró de Crédito", "Entrevista presencial obligatoria", "Integración de un expediente previo a la apertura de cuenta"], answer: "Integración de un expediente previo a la apertura de cuenta" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "Tratándose de transferencias internacionales, no es necesario recabar los datos del originador si el monto es menor a 1,000 USD.", options: ["Verdadero", "Falso"], answer: "Falso" },
  { type: "Opción Múltiple", icon: Target, question: "El concepto de 'Dueño Beneficiario' o 'Beneficiario Controlador' se refiere a:", options: ["Quien recibe las utilidades fiscales", "La persona física que ejerce el control o se beneficia de los recursos", "El representante legal de la empresa"], answer: "La persona física que ejerce el control o se beneficia de los recursos" },

  // Más preguntas variadas para llegar a 25...
  { type: "Opción Múltiple", icon: BookOpen, question: "¿Qué autoridad en México recibe los reportes de operaciones PLD/FT a través del SITI?", options: ["SAT", "UIF (por conducto de la CNBV)", "PGR"], answer: "UIF (por conducto de la CNBV)" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "La Lista de Personas Bloqueadas es de carácter estrictamente confidencial y no se puede informar al cliente que está en ella.", options: ["Verdadero", "Falso"], answer: "Verdadero" },
  { type: "Caso Práctico", icon: BrainCircuit, question: "Si un cliente se niega a proporcionar información sobre el origen de sus fondos, la entidad debe:", options: ["Cerrar la cuenta de inmediato", "Suspender la operación y emitir un reporte de operación inusual", "Aceptar el dinero pero cobrar más comisión"], answer: "Suspender la operación y emitir un reporte de operación inusual" },
  { type: "Completar Texto", icon: Target, question: "El ___________ de PLD/FT es el documento que contiene los criterios, medidas y procedimientos internos que debe observar la entidad.", options: ["Código de Ética", "Manual de Cumplimiento", "Estatuto Social"], answer: "Manual de Cumplimiento" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "El intercambio de información entre entidades financieras (Info-sharing) está prohibido por la Ley de Secreto Bancario en casos de PLD.", options: ["Verdadero", "Falso"], answer: "Falso" },
  { type: "Opción Múltiple", icon: BrainCircuit, question: "Las Evaluaciones Mutuas a las que se somete México son realizadas por:", options: ["El Banco Mundial", "La DEA", "El GAFI"], answer: "El GAFI" },
  { type: "Caso Práctico", icon: BookOpen, question: "Una Sofom identifica un riesgo alto en un cliente nuevo. ¿Qué debe hacer?", options: ["Aplicar medidas de Debida Diligencia Reforzada", "Reportarlo como inusual inmediatamente", "No aceptarlo bajo ninguna circunstancia"], answer: "Aplicar medidas de Debida Diligencia Reforzada" },
  { type: "Completar Texto", icon: Target, question: "La conservación de expedientes y registros de operaciones debe ser por un periodo no menor a ________ años.", options: ["5", "10", "15"], answer: "10" },
  { type: "Verdadero o Falso", icon: ShieldAlert, question: "La tipificación del delito de Operaciones con Recursos de Procedencia Ilícita se encuentra en el Artículo 400 Bis del Código Penal Federal.", options: ["Verdadero", "Falso"], answer: "Verdadero" },
  { type: "Opción Múltiple", icon: BookOpen, question: "¿Cuál es el objetivo principal del GAFI?", options: ["Fijar estándares y promover la implementación efectiva de medidas legales contra el lavado de dinero", "Investigar delitos financieros en todo el mundo", "Regular las tasas de interés internacionales"], answer: "Fijar estándares y promover la implementación efectiva de medidas legales contra el lavado de dinero" },
]

export default function TrialPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null)
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const handleSelect = (option: string) => {
    // Evitar múltiples clics
    if (selectedAnswer !== null) return

    setSelectedAnswer(option)
    const correct = option === TRIAL_QUESTIONS[currentStep].answer
    setIsCorrect(correct)

    // Auto avance sin botón "comprobar"
    setTimeout(() => {
      if (currentStep < TRIAL_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
      } else {
        setIsCompleted(true)
      }
    }, 1500)
  }

  // PANTALLA FINAL - RECOMPENSA
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Zap className="h-24 w-24 text-yellow-400 fill-yellow-400" />
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: -10, opacity: 1 }} 
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-4 -right-8 bg-blue-600 text-white font-black text-xl px-3 py-1 rounded-full rotate-12 shadow-lg"
              >
                +50 XP
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2">¡Desempeño Sobresaliente!</h2>
          <p className="text-slate-600 mb-8 font-medium">
            Has demostrado gran potencial. Tu racha inicia hoy. Continúa tu entrenamiento para asegurar tu certificación CNBV.
          </p>

          {/* LOS DOS BOTONES NUEVOS DE REGISTRO */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => router.push("/register/individual")}
              className="w-full h-14 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Registro Individual <ArrowRight className="h-5 w-5" />
            </Button>

            <Button 
              onClick={() => router.push("/register/corporativo")}
              variant="outline"
              className="w-full h-14 text-md font-bold rounded-2xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              Registro Corporativo (Empresas)
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // PANTALLA DUOLINGO-STYLE
  const currentQ = TRIAL_QUESTIONS[currentStep]
  const IconComponent = currentQ.icon

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto">
      {/* Barra de progreso superior */}
      <div className="flex items-center gap-4 p-4 mt-4">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-6 w-6" />
        </button>
        <Progress value={((currentStep + 1) / TRIAL_QUESTIONS.length) * 100} className="h-3 flex-1 bg-slate-100" />
        <div className="flex items-center gap-1.5 text-red-500 font-bold">
          <Heart className="h-6 w-6 fill-red-500" />
          <span>5</span>
        </div>
      </div>

      {/* Área de la Pregunta */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
                {currentQ.type}
              </h2>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-tight">
              {currentQ.question}
            </h3>

            {/* Opciones */}
            <div className="space-y-4 mt-auto">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswer === opt
                const isCorrectOption = opt === currentQ.answer
                
                let buttonClass = "border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                let IconFeedback = null

                if (selectedAnswer !== null) {
                  if (isCorrectOption) {
                    buttonClass = "border-green-500 bg-green-50 text-green-700"
                    IconFeedback = <CheckCircle2 className="h-6 w-6 text-green-500" />
                  } else if (isSelected && !isCorrect) {
                    buttonClass = "border-red-500 bg-red-50 text-red-700"
                    IconFeedback = <XCircle className="h-6 w-6 text-red-500" />
                  } else {
                    buttonClass = "border-slate-100 text-slate-400 opacity-50"
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={selectedAnswer !== null}
                    className={`w-full flex items-center justify-between text-left p-5 rounded-2xl border-2 font-bold text-lg transition-all ${buttonClass}`}
                  >
                    <span>{opt}</span>
                    {IconFeedback}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}