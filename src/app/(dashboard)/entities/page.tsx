"use client"

import * as React from "react"
import {
  Building2,
  Scale,
  FileSearch,
  ArrowRight,
  Search,
  BookOpen,
  UserCog,
  BarChart3,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────────────────────────────────────
// DATOS NORMATIVOS REALES — Fuente: LFPIORPI Art. 14-16, Circular CNBV 2-B (Disposiciones de Carácter General)
// Clasificación de Instituciones Financieras según sector regulado.
// ─────────────────────────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  // ── 1. BANCA MÚLTIPLE ──────────────────────────────────────────────────────
  {
    id: "banca-multiple",
    name: "Banca Múltiple (Instituciones de Crédito)",
    description: "Instituciones de crédito con mayores exigencias de reporteo.",
    law: {
      title: "Marco Jurídico — Banca Múltiple",
      summary:
        "La Banca Múltiple se rige por el Art. 115 de la Ley de Instituciones de Crédito (LIC) y las Disposiciones de Carácter General en materia de PLD/FT emitidas por la CNBV. Aplican de manera complementaria la LFPIORPI, las Recomendaciones GAFI y los Criterios de la SHCP.",
      norms: [
        "LFPIORPI (marco general)",
        "LIC — Art. 115",
        "Disposiciones CNBV Banca Múltiple",
        "Circular CNBV 2-B: Expediente de cliente",
        "Recomendaciones GAFI",
        "Criterios SHCP",
      ],
      articles: [
        "Art. 115 LIC: Obligaciones PLD — identificación, reportes y conservación",
        "Art. 115 LIC fracc. I: Programa de PLD/FT por escrito aprobado por Consejo",
        "Art. 115 LIC fracc. II: Oficial de Cumplimiento ante la CNBV",
        "Art. 115 LIC fracc. IV: Conservación de expedientes por mínimo 7 años",
        "Disp. CNBV Cap. III: Enfoque Basado en Riesgo (EBR) y Matriz de Riesgo",
        "Disp. CNBV Cap. VI: KYC — identificación y conocimiento del cliente",
        "Disp. CNBV Cap. VIII: Monitoreo continuo de operaciones",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Responsable de implementar el programa PLD ante la CNBV. Debe ser aprobado por el Consejo de Administración. Tiene autonomía funcional y acceso directo al Consejo.",
      },
      {
        role: "Comité de Comunicación y Control (CCC)",
        desc: "Revisa y aprueba reportes de operaciones inusuales (R01). Sesiona al menos una vez al mes. Integrado por el Oficial de Cumplimiento, Director General y áreas clave.",
      },
      {
        role: "Auditor Interno PLD",
        desc: "Verifica el cumplimiento del programa PLD al menos una vez al año. Reporta directamente al Consejo o al Comité de Auditoría, con independencia del área de negocio.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras aprobación del CCC",
        threshold: "Cualquier monto — por señal de alerta o conducta atípica",
      },
      {
        name: "Reporte de Operaciones Internas Preocupantes (R14)",
        deadline: "24 horas tras detectarse",
        threshold: "Por conducta sospechosa de empleado, directivo o apoderado",
      },
      {
        name: "Reporte de 24 Horas (R12)",
        deadline: "24 horas",
        threshold: "Cuando la urgencia no permita esperar al CCC",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente en efectivo en una sola operación",
      },
    ],
    obligations: [
      { text: "Establecer un Programa de PLD/FT por escrito aprobado por el Consejo", law: "Art. 115 LIC fracc. I" },
      { text: "Designar y registrar al Oficial de Cumplimiento ante la CNBV", law: "Disp. CNBV Cap. II" },
      { text: "Aplicar Enfoque Basado en Riesgo (EBR) y mantener Matriz de Riesgo actualizada", law: "Disp. CNBV Cap. III" },
      { text: "Aplicar KYC: identificar, verificar y conocer al cliente antes de operar", law: "Disp. CNBV Cap. VI — Circular CNBV 2-B" },
      { text: "Monitorear continuamente las operaciones del cliente vs. su perfil transaccional", law: "Disp. CNBV Cap. VIII" },
      { text: "Capacitar al personal en materia de PLD/FT al menos una vez al año", law: "Disp. CNBV Cap. IX" },
      { text: "Conservar expedientes e información de clientes por mínimo 7 años", law: "LFPIORPI Art. 18 — Art. 115 LIC fracc. IV" },
      { text: "Enviar reportes de operaciones inusuales y relevantes a la UIF en tiempo y forma", law: "LFPIORPI Art. 17" },
    ],
  },

  // ── 2. BANCA DE DESARROLLO ────────────────────────────────────────────────
  {
    id: "banca-desarrollo",
    name: "Banca de Desarrollo (Instituciones de Crédito)",
    description: "Instituciones de crédito enfocadas al desarrollo económico y social.",
    law: {
      title: "Marco Jurídico — Banca de Desarrollo",
      summary:
        "La Banca de Desarrollo (NAFIN, Banobras, Bancomext, Banjercito, SHF, Bansefi) se rige por su Ley Orgánica individual y por el Art. 115 LIC que le aplica de manera análoga. Las Disposiciones CNBV para Banca Múltiple se aplican con las adecuaciones propias de su mandato de desarrollo.",
      norms: [
        "LFPIORPI (marco general)",
        "LIC — Art. 115 (aplicación análoga)",
        "Ley Orgánica de cada institución (NAFIN, Banobras, etc.)",
        "Disposiciones CNBV Banca Múltiple (aplicación supletoria)",
        "Criterios SHCP para instituciones del sector público",
      ],
      articles: [
        "Art. 115 LIC: Obligaciones PLD — aplicación análoga a banca de desarrollo",
        "Ley Orgánica NAFIN Art. 7: Programa de PLD/FT institucional",
        "Ley Orgánica Banobras Art. 5: Control interno y cumplimiento normativo",
        "Disp. CNBV Cap. III: EBR adaptado al mandato de desarrollo",
        "LFPIORPI Art. 17: Obligación de reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Designado por el Consejo Directivo. Responsable del programa PLD. Debe reportar directamente a la alta dirección y al organismo de supervisión sectorial (CNBV o SHCP).",
      },
      {
        role: "Dirección de Auditoría Interna",
        desc: "Verifica anualmente la efectividad del programa PLD/FT. Emite informe al Consejo Directivo con observaciones y recomendaciones.",
      },
      {
        role: "Comité de Control y Auditoría",
        desc: "Órgano colegiado que supervisa el cumplimiento normativo. Revisa casos de operaciones inusuales y aprueba los reportes a la UIF.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — por señal de alerta o contexto sospechoso",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente en efectivo",
      },
      {
        name: "Reporte de Operaciones Internas Preocupantes",
        deadline: "24 horas tras detectarse",
        threshold: "Conducta sospechosa de funcionario o empleado",
      },
    ],
    obligations: [
      { text: "Establecer un Programa de PLD/FT aprobado por el Consejo Directivo", law: "LIC Art. 115 — Ley Orgánica sectorial" },
      { text: "Designar Oficial de Cumplimiento registrado ante la CNBV o SHCP", law: "Disp. CNBV Cap. II (supletorio)" },
      { text: "Aplicar EBR adaptado al perfil de clientes del sector público/productivo", law: "Disp. CNBV Cap. III" },
      { text: "Identificar beneficiarios finales en financiamientos a personas jurídicas", law: "LFPIORPI Art. 17 — GAFI R.24" },
      { text: "Conservar expedientes y registros por mínimo 7 años", law: "LFPIORPI Art. 18" },
      { text: "Reportar operaciones inusuales y relevantes a la UIF", law: "LFPIORPI Art. 17" },
    ],
  },

  // ── 3. SOFOM ENR ──────────────────────────────────────────────────────────
  {
    id: "sofom-enr",
    name: "Sofom ENR (Sociedad Financiera de Objeto Múltiple No Regulada)",
    description: "Sociedades Financieras de Objeto Múltiple No Reguladas.",
    law: {
      title: "Marco Jurídico — SOFOM ENR",
      summary:
        "Las SOFOM ENR se rigen por la Ley General de Organizaciones y Actividades Auxiliares del Crédito (LGOAC) y las Disposiciones Técnicas emitidas por la CNBV. Al ser 'no reguladas' tienen requisitos proporcionales a su tamaño, pero igualmente deben cumplir con la LFPIORPI.",
      norms: [
        "LFPIORPI (marco general)",
        "LGOAC — Art. 87-D: PLD obligaciones",
        "Disposiciones Técnicas CNBV para SOFOM ENR",
        "NOM-151-SCFI-2016: Conservación de mensajes de datos",
      ],
      articles: [
        "Art. 87-D LGOAC: Obligaciones PLD/FT para SOFOM ENR",
        "LFPIORPI Art. 17: Sujetos obligados a reportar operaciones inusuales",
        "Disp. Técnicas CNBV Cap. III: Matriz de Riesgo simplificada",
        "Disp. Técnicas CNBV Cap. IV: Expediente de cliente y DDC",
        "Disp. Técnicas CNBV Cap. VII: Reportes de operaciones relevantes > $7,500 USD",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Puede ser el propio director general en entidades pequeñas. Responsable del manual PLD y de los reportes a la UIF. En entidades medianas debe ser una persona distinta al director comercial.",
      },
      {
        role: "Comité de Cumplimiento (opcional)",
        desc: "Recomendado para SOFOM con cartera > 500 clientes. Revisa operaciones marcadas por el sistema de alertas. Sesiona al menos trimestralmente.",
      },
      {
        role: "Auditor Externo PLD",
        desc: "Verifica anualmente el cumplimiento del programa PLD. Emite informe a la CNBV si la SOFOM tiene vínculos con entidades reguladas.",
      },
    ],
    reports: [
      {
        name: "Reporte Trimestral de Operaciones en Efectivo",
        deadline: "Trimestral (dentro de los 10 días hábiles)",
        threshold: "Acumulado > $500 USD equivalente en el trimestre",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD en una sola operación en efectivo",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24 horas (casos urgentes) / 3 días hábiles",
        threshold: "Cualquier monto — por señal de alerta detectada",
      },
    ],
    obligations: [
      { text: "Elaborar Manual de PLD/FT por escrito y mantenerlo actualizado", law: "Disp. Técnicas SOFOM ENR" },
      { text: "Designar Oficial de Cumplimiento ante la CNBV (o autodesignarse si se cumplen condiciones)", law: "LFPIORPI Art. 17" },
      { text: "Aplicar Matriz de Riesgo proporcional al tamaño de la cartera", law: "Disp. Técnicas CNBV Cap. III" },
      { text: "Identificar y verificar al cliente antes de operar (DDC simplificada o reforzada según riesgo)", law: "Disp. Técnicas CNBV Cap. IV" },
      { text: "Reportar a la UIF operaciones relevantes en efectivo > $7,500 USD", law: "Disp. Técnicas CNBV Cap. VII" },
      { text: "Conservar expedientes y registros por mínimo 5 años", law: "LGOAC Art. 87-D — LFPIORPI Art. 18" },
    ],
  },

  // ── 4. SOFOM ER ───────────────────────────────────────────────────────────
  {
    id: "sofom-er",
    name: "Sofom ER (Sociedad Financiera de Objeto Múltiple Regulada)",
    description: "Sociedades Financieras de Objeto Múltiple con supervisión directa de la CNBV.",
    law: {
      title: "Marco Jurídico — SOFOM ER",
      summary:
        "Las SOFOM ER son aquellas que tienen nexo patrimonial con una institución de crédito o que emiten valores. Están bajo supervisión directa de la CNBV y sus obligaciones PLD/FT son similares a las de la Banca Múltiple, aunque con umbrales diferenciados.",
      norms: [
        "LFPIORPI (marco general)",
        "LGOAC — Arts. 87-Bis a 87-D",
        "Disposiciones de Carácter General CNBV para SOFOM ER",
        "LIC (aplicación supletoria por nexo bancario)",
        "Recomendaciones GAFI",
      ],
      articles: [
        "Art. 87-Bis LGOAC: Definición y regulación de SOFOM ER",
        "Art. 87-D LGOAC: Obligaciones PLD/FT aplicables",
        "Disp. CNBV SOFOM ER Cap. II: Oficial de Cumplimiento certificado",
        "Disp. CNBV SOFOM ER Cap. III: EBR y Matriz de Riesgo",
        "Disp. CNBV SOFOM ER Cap. VII: Reportes mensuales de operaciones relevantes",
        "LFPIORPI Art. 17: Obligación de reporte de operaciones inusuales",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Debe ser aprobado por la CNBV. Con autonomía funcional y acceso directo al Consejo. Similar en responsabilidades al de la banca múltiple. Reporta mensualmente al regulador.",
      },
      {
        role: "Comité de Comunicación y Control",
        desc: "Revisa y aprueba reportes de operaciones inusuales. Sesiona al menos mensualmente. Integrado por el Oficial de Cumplimiento, Director General y responsable de Riesgos.",
      },
      {
        role: "Auditor Interno o Externo PLD",
        desc: "Evalúa anualmente la efectividad del programa PLD. El resultado de la auditoría se reporta a la CNBV junto con el informe anual de cumplimiento.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en efectivo",
      },
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — por señal de alerta",
      },
      {
        name: "Reporte de Operaciones Internas Preocupantes",
        deadline: "24 horas tras detectarse",
        threshold: "Conducta sospechosa de empleado o directivo",
      },
      {
        name: "Informe Anual de Cumplimiento PLD",
        deadline: "Enero del año siguiente",
        threshold: "Obligatorio para todas las SOFOM ER",
      },
    ],
    obligations: [
      { text: "Designar Oficial de Cumplimiento aprobado por la CNBV con autonomía funcional", law: "Disp. CNBV SOFOM ER Cap. II" },
      { text: "Implementar EBR con Matriz de Riesgo y actualizarla al menos anualmente", law: "Disp. CNBV SOFOM ER Cap. III" },
      { text: "Aplicar DDC estándar o reforzada según el nivel de riesgo del cliente", law: "Disp. CNBV SOFOM ER Cap. V" },
      { text: "Monitorear continuamente el perfil transaccional de cada cliente", law: "Disp. CNBV SOFOM ER Cap. VIII" },
      { text: "Reportar mensualmente operaciones relevantes en efectivo > $7,500 USD a la UIF", law: "Disp. CNBV SOFOM ER Cap. VII" },
      { text: "Presentar Informe Anual de Cumplimiento PLD a la CNBV en enero", law: "Disp. CNBV SOFOM ER Cap. X" },
      { text: "Conservar expedientes y registros por mínimo 7 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 5. IFPE (Institución de Fondos de Pago Electrónico) ───────────────────
  {
    id: "ifpe",
    name: "IFPE — Institución de Fondos de Pago Electrónico (ITF)",
    description: "Entidades Fintech autorizadas para fondos de pago electrónico e-money.",
    law: {
      title: "Marco Jurídico — IFPE (Ley Fintech)",
      summary:
        "Las IFPE se rigen por la Ley para Regular las Instituciones de Tecnología Financiera (Ley Fintech, 2018) y sus disposiciones secundarias emitidas por la CNBV y Banxico. Son supervisadas simultáneamente por la CNBV (PLD/FT) y el Banxico (sistemas de pago). Operan activos virtuales bajo el régimen especial del Art. 58.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley Fintech — Art. 58: Obligaciones PLD para IFPE",
        "Disposiciones CNBV para ITF en materia de PLD/FT",
        "Disposiciones Banxico sobre activos virtuales (CUB)",
        "GAFI — R.15: Activos virtuales y VASP",
      ],
      articles: [
        "Ley Fintech Art. 58: Obligaciones PLD/FT específicas para IFPE",
        "Ley Fintech Art. 30-32: Autorización y operación de IFPE",
        "Ley Fintech Art. 26: Uso de activos virtuales con autorización previa de Banxico",
        "Disp. CNBV ITF Cap. IV: KYC digital — biometría y validación INE/IFE en línea",
        "Disp. Banxico CUB: Reporte de operaciones con activos virtuales > 645 UMAs",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Debe contar con certificación CNBV en PLD/FT y conocimientos en tecnología financiera. Responsable del programa PLD y de los reportes a la UIF. Supervisa el sistema de monitoreo automatizado.",
      },
      {
        role: "Responsable de Activos Virtuales",
        desc: "Figura adicional requerida si la IFPE opera con criptomonedas o tokens. Coordina con el Oficial de Cumplimiento para reportar operaciones con activos virtuales que superen 645 UMAs.",
      },
      {
        role: "Comité de Riesgos Tecnológicos y PLD",
        desc: "Supervisa el sistema automatizado de monitoreo y alertas. Revisa señales generadas por IA/ML. Sesiona al menos mensualmente.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — por señal de alerta del sistema",
      },
      {
        name: "Reporte de Operaciones con Activos Virtuales",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> 645 UMAs (~$62,000 MXN aprox.) en operaciones con criptomonedas",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en una sola operación",
      },
    ],
    obligations: [
      { text: "Implementar KYC digital: biometría facial, validación INE/IFE en línea, prueba de vida", law: "Ley Fintech Art. 58 — Disp. CNBV ITF Cap. IV" },
      { text: "Aplicar EBR con Matriz de Riesgo adaptada a canales digitales y onboarding remoto", law: "Disp. CNBV ITF Cap. III" },
      { text: "Monitorear en tiempo real las transacciones electrónicas del cliente", law: "Ley Fintech Art. 58 fracc. IV" },
      { text: "Reportar operaciones con activos virtuales que superen 645 UMAs a la UIF", law: "Disp. Banxico CUB — Ley Fintech Art. 26" },
      { text: "Solicitar autorización previa de Banxico para operar con activos virtuales", law: "Ley Fintech Art. 26" },
      { text: "Conservar registros de todas las operaciones electrónicas por mínimo 7 años", law: "LFPIORPI Art. 18 — NOM-151-SCFI-2016" },
      { text: "Reportar operaciones inusuales a la UIF dentro de las 24 horas de detección", law: "LFPIORPI Art. 17" },
    ],
  },

  // ── 6. IFC (Institución de Financiamiento Colectivo) ──────────────────────
  {
    id: "ifc",
    name: "IFC — Institución de Financiamiento Colectivo (ITF / Crowdfunding)",
    description: "Entidades Fintech de fondeo colectivo: capital, deuda e inversiones.",
    law: {
      title: "Marco Jurídico — IFC (Ley Fintech)",
      summary:
        "Las IFC se rigen por la Ley Fintech (2018) y son autorizadas y supervisadas por la CNBV. Conectan a inversionistas (fondantes) con solicitantes de recursos (deudores o proyectos). Las obligaciones PLD/FT aplican a ambos lados de la plataforma: quien fondea y quien recibe los recursos.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley Fintech — Arts. 15-29: Operación de IFC",
        "Ley Fintech — Art. 58: Obligaciones PLD para IFC",
        "Disposiciones CNBV para ITF en materia de PLD/FT",
        "GAFI — R.15: Nuevas tecnologías y plataformas digitales",
      ],
      articles: [
        "Ley Fintech Art. 15-18: Tipos de operaciones de financiamiento colectivo",
        "Ley Fintech Art. 58: Obligaciones PLD/FT específicas para IFC",
        "Ley Fintech Art. 24: Límites de financiamiento por proyecto y por inversionista",
        "Disp. CNBV IFC Cap. IV: Identificación de fondantes y solicitantes de recursos",
        "Disp. CNBV IFC Cap. V: Debida diligencia en operaciones de capital y deuda",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Certificado por la CNBV. Supervisa la DDC de fondantes y solicitantes. Aprueba la incorporación de clientes de alto riesgo y los reportes de operaciones inusuales a la UIF.",
      },
      {
        role: "Gestor de Riesgos de Plataforma",
        desc: "Evalúa el riesgo de fraude y LD en cada proyecto publicado. Monitorea los flujos de financiamiento y detecta patrones atípicos de inversión o retiro.",
      },
      {
        role: "Comité de Admisión y Cumplimiento",
        desc: "Revisa los proyectos de alto monto y los fondantes con perfil inusual. Aprueba o rechaza solicitudes que activen señales de alerta PLD.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — fondante o proyecto con señal de alerta",
      },
      {
        name: "Reporte de Operaciones Relevantes",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD en inversiones en efectivo o equivalentes",
      },
      {
        name: "Reporte de Financiamiento Colectivo con Activos Virtuales",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> 645 UMAs en operaciones con criptomonedas o tokens",
      },
    ],
    obligations: [
      { text: "Aplicar DDC al 100% de fondantes y solicitantes: identificación, verificación y perfil de riesgo", law: "Ley Fintech Art. 58 — Disp. CNBV IFC Cap. IV" },
      { text: "Verificar el origen lícito de los recursos de cada fondante (inversionista)", law: "Ley Fintech Art. 58 fracc. II" },
      { text: "Publicar en plataforma solo proyectos que hayan superado la DDC del solicitante", law: "Disp. CNBV IFC Cap. V" },
      { text: "Monitorear flujos de fondeo: montos acumulados por fondante vs. perfil declarado", law: "Disp. CNBV IFC Cap. VIII" },
      { text: "Reportar proyectos o fondantes con señales de alerta de LD a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar toda la información de transacciones y contratos por mínimo 7 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 7. SOCAP ──────────────────────────────────────────────────────────────
  {
    id: "socap",
    name: "SOCAP — Sociedad Cooperativa de Ahorro y Préstamo",
    description: "Sociedades Cooperativas de Ahorro y Préstamo. Sistema cooperativo.",
    law: {
      title: "Marco Jurídico — SOCAP",
      summary:
        "Las SOCAP se rigen por la Ley para Regular las Actividades de las Sociedades Cooperativas de Ahorro y Préstamo (LRASCAP). Sus obligaciones PLD son proporcionales a su nivel de operación (Niveles I al IV), siendo el Nivel IV el de mayores exigencias.",
      norms: [
        "LFPIORPI (marco general)",
        "LRASCAP — Art. 46: Obligaciones PLD",
        "Circular CNBV 2-B — Disposiciones para SOCAP",
        "Anexo 1-A CNBV: Instituciones de Crédito Cooperativas",
      ],
      articles: [
        "LRASCAP Art. 46: Obligaciones PLD/FT para SOCAP",
        "LRASCAP Art. 10: Clasificación por niveles de operación (I-IV)",
        "Disp. CNBV SOCAP Cap. II: Oficial de Cumplimiento por nivel",
        "Disp. CNBV SOCAP Cap. V: Identificación proporcional del socio-cliente",
        "Disp. CNBV SOCAP Cap. VII: Reportes de operaciones en efectivo",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Designado según nivel de operación. En Nivel I puede ser el gerente general. En Nivel III-IV debe ser una persona dedicada con certificación CNBV.",
      },
      {
        role: "Consejo de Administración",
        desc: "Aprueba el programa PLD y supervisa al Oficial de Cumplimiento. En Niveles III y IV debe recibir reportes trimestrales de cumplimiento.",
      },
      {
        role: "Comisión de Vigilancia",
        desc: "Audita internamente el cumplimiento regulatorio. En Nivel IV funciona como órgano fiscalizador con acceso a expedientes de socios.",
      },
    ],
    reports: [
      {
        name: "Reporte Mensual de Operaciones en Efectivo",
        deadline: "10 días hábiles del mes siguiente",
        threshold: "Operaciones acumuladas en efectivo según nivel de operación",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en una sola operación",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24-48 horas según urgencia",
        threshold: "Cualquier monto — por señal de alerta o conducta atípica del socio",
      },
    ],
    obligations: [
      { text: "Clasificar operaciones y requisitos de identificación según el nivel de operación (I-IV)", law: "Disp. CNBV SOCAP" },
      { text: "Aplicar identificación proporcional al riesgo del socio: simplificada (Nivel I) o reforzada (Nivel IV)", law: "Disp. CNBV SOCAP Cap. V" },
      { text: "Designar Oficial de Cumplimiento según el nivel de la sociedad", law: "Disp. CNBV SOCAP Cap. II" },
      { text: "Reportar operaciones en efectivo mensualmente a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes de socios y registros de operaciones por mínimo 5 años", law: "LFPIORPI Art. 18 — LRASCAP" },
    ],
  },

  // ── 8. SOFIPO ─────────────────────────────────────────────────────────────
  {
    id: "sofipo",
    name: "SOFIPO — Sociedad Financiera Popular",
    description: "Entidades de ahorro y crédito popular supervisadas por la CNBV.",
    law: {
      title: "Marco Jurídico — SOFIPO",
      summary:
        "Las SOFIPO se rigen por la Ley de Ahorro y Crédito Popular (LACP) y las Disposiciones de Carácter General emitidas por la CNBV. Son supervisadas auxiliarmente por Federaciones autorizadas (FEDERACIONES). Sus obligaciones PLD son proporcionales a su nivel de operación (I-IV), al igual que las SOCAP.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley de Ahorro y Crédito Popular (LACP) — Arts. relevantes en PLD",
        "Disposiciones CNBV para SOFIPO",
        "Reglamento de Supervisión Auxiliar (Federaciones)",
      ],
      articles: [
        "LACP Art. 65: Obligaciones PLD/FT para SOFIPO",
        "LACP Art. 10: Niveles de operación I-IV (equivalentes a SOCAP)",
        "Disp. CNBV SOFIPO Cap. II: Oficial de Cumplimiento por nivel",
        "Disp. CNBV SOFIPO Cap. V: Expediente del cliente proporcional al riesgo",
        "Disp. CNBV SOFIPO Cap. VII: Reportes mensuales de operaciones en efectivo",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Designado proporcionalmente al nivel de operación. En Nivel I-II puede ser el director general. En Nivel III-IV debe ser persona dedicada y certificada por la CNBV.",
      },
      {
        role: "Consejo de Administración",
        desc: "Aprueba el programa PLD y recibe informes periódicos del Oficial de Cumplimiento. En Niveles III y IV aprueba operaciones de alto riesgo.",
      },
      {
        role: "Federación Supervisora (auxiliar)",
        desc: "Federación autorizada por la CNBV que realiza supervisión auxiliar de primer piso. Puede detectar incumplimientos PLD y reportarlos a la CNBV.",
      },
    ],
    reports: [
      {
        name: "Reporte Mensual de Operaciones en Efectivo",
        deadline: "10 días hábiles del mes siguiente",
        threshold: "Acumulado > $500 USD equivalente mensual por cliente",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en una sola operación",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24-48 horas según urgencia",
        threshold: "Cualquier monto — por señal de alerta interna",
      },
    ],
    obligations: [
      { text: "Aplicar identificación proporcional según nivel de operación y riesgo del cliente", law: "LACP Art. 65 — Disp. CNBV SOFIPO Cap. V" },
      { text: "Designar Oficial de Cumplimiento según el nivel de la sociedad", law: "Disp. CNBV SOFIPO Cap. II" },
      { text: "Implementar sistema de monitoreo de transacciones en efectivo mensualmente", law: "Disp. CNBV SOFIPO Cap. VII" },
      { text: "Cooperar con la Federación supervisora en revisiones de cumplimiento PLD", law: "LACP (supervisión auxiliar)" },
      { text: "Reportar operaciones inusuales y relevantes a la UIF en los plazos establecidos", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes de clientes y registros de transacciones por mínimo 5 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 9. CASA DE BOLSA ──────────────────────────────────────────────────────
  {
    id: "casa-bolsa",
    name: "Casas de Bolsa",
    description: "Intermediarios del mercado de valores sujetos a PLD/FT.",
    law: {
      title: "Marco Jurídico — Casa de Bolsa",
      summary:
        "Las Casas de Bolsa se rigen por la Ley del Mercado de Valores (LMV), específicamente el Art. 212, y las Disposiciones de Carácter General en materia de PLD emitidas por la CNBV. Tienen requisitos especiales para clientes 'versados' e inversores institucionales, así como para operaciones en bloque.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley del Mercado de Valores (LMV) — Art. 212",
        "Disposiciones CNBV para Casas de Bolsa (PLD/FT)",
        "Reglamento Interior de BMV y BIVA",
        "Recomendaciones GAFI — R.10: DDC",
      ],
      articles: [
        "LMV Art. 212: Obligaciones PLD para intermediarios bursátiles",
        "LMV Art. 212 fracc. I: Programa de PLD/FT aprobado por el Consejo",
        "LMV Art. 212 fracc. II: Oficial de Cumplimiento Bursátil con certificación CNBV",
        "Disp. CNBV Casa de Bolsa Cap. V: KYC bursátil — perfil transaccional del inversionista",
        "Disp. CNBV Casa de Bolsa Cap. VI: Clasificación del cliente: versado / no versado",
        "Disp. CNBV Casa de Bolsa Cap. VII: Monitoreo de operaciones en mercados secundarios",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento Bursátil",
        desc: "Especializado en mercado de valores y PLD. Debe tener certificación CNBV y conocimiento de operaciones bursátiles (renta fija, variable, derivados). Reporta al Consejo.",
      },
      {
        role: "Comité de Control y Auditoría Bursátil",
        desc: "Revisa operaciones en bloque, transacciones de clientes institucionales y señales de alerta. Aprueba reportes de operaciones inusuales a la UIF.",
      },
      {
        role: "Auditor Externo PLD",
        desc: "Emite dictamen anual de cumplimiento PLD/FT. El dictamen se presenta ante la CNBV y es público para los inversionistas de la institución.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales Bursátiles",
        deadline: "24 horas tras detección o resolución del Comité",
        threshold: "Operaciones atípicas vs. perfil del inversionista",
      },
      {
        name: "Reporte de Operaciones en Bloque",
        deadline: "Mensual (dentro de los 10 días hábiles)",
        threshold: "> $10,000 USD equivalente por operación en bloque",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente en efectivo",
      },
    ],
    obligations: [
      { text: "Aplicar KYC bursátil: perfil financiero del inversionista, origen y destino de recursos", law: "LMV Art. 212 — Disp. CNBV Casa de Bolsa Cap. V" },
      { text: "Clasificar al cliente como 'versado' o 'no versado' y determinar perfil de riesgo", law: "Disp. CNBV Casa de Bolsa Cap. VI" },
      { text: "Monitorear operaciones en mercados secundarios: alertas por volumen, precio y contraparte", law: "Disp. CNBV Casa de Bolsa Cap. VII" },
      { text: "Designar Oficial de Cumplimiento Bursátil con certificación CNBV", law: "LMV Art. 212 fracc. II" },
      { text: "Reportar operaciones en bloque mensualmente a la UIF", law: "Disp. CNBV Casa de Bolsa Cap. VIII" },
      { text: "Contratar auditoría externa PLD anual y presentar dictamen a la CNBV", law: "Disp. CNBV Casa de Bolsa Cap. XI" },
    ],
  },

  // ── 10. CASAS DE CAMBIO ───────────────────────────────────────────────────
  {
    id: "casa-cambio",
    name: "Casas de Cambio",
    description: "Entidades autorizadas para la compra-venta profesional de divisas.",
    law: {
      title: "Marco Jurídico — Casas de Cambio",
      summary:
        "Las Casas de Cambio se rigen por la Ley General de Títulos y Operaciones de Crédito (LGTOC) y la Circular CNBV en materia de PLD/FT. Tienen umbrales diferenciados para identificación y reporte según el monto de la operación cambiaria.",
      norms: [
        "LFPIORPI (marco general)",
        "LGTOC — Arts. 81-A al 81-G: Casas de Cambio",
        "Circular CNBV: Disposiciones PLD para Casas de Cambio",
        "Ley Monetaria de los Estados Unidos Mexicanos",
        "Criterios SHCP para operaciones con divisas",
      ],
      articles: [
        "LGTOC Art. 81-A: Autorización y operación de Casas de Cambio",
        "LGTOC Art. 81-F: Obligaciones PLD para operaciones cambiarias",
        "Circular CNBV Cap. III: Umbrales de identificación por monto de operación",
        "Circular CNBV Cap. IV: Reporte de operaciones con divisas > $3,000 USD",
        "Circular CNBV Cap. V: Registro de clientes frecuentes y perfil cambiario",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Responsable del programa PLD/FT y de los reportes a la UIF. Supervisa el cumplimiento de los umbrales de identificación en cada ventanilla. Puede ser el director general si la entidad es pequeña.",
      },
      {
        role: "Responsable de Operaciones de Ventanilla",
        desc: "Verifica en tiempo real que cada operación cumpla con los requisitos de identificación según el monto. Aplica los umbrales de la Circular CNBV directamente en la operación.",
      },
      {
        role: "Auditor Interno / Externo",
        desc: "Revisa el registro de operaciones y el cumplimiento de umbrales. Verifica que los reportes a la UIF se hayan emitido correctamente y en tiempo.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operación Cambiaria Relevante",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $3,000 USD equivalente en una sola operación",
      },
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras detección",
        threshold: "Cualquier monto — señal de alerta, operación fragmentada (estructuración)",
      },
      {
        name: "Reporte de Operaciones Acumuladas Sospechosas",
        deadline: "Detección inmediata",
        threshold: "Cliente que acumula múltiples operaciones < $3,000 USD el mismo día (smurfing)",
      },
    ],
    obligations: [
      { text: "Hasta $300 USD: operación sin identificación del cliente (solo registro interno)", law: "Circular CNBV Casas de Cambio Cap. III" },
      { text: "De $300 a $3,000 USD: identificación obligatoria con INE/IFE o pasaporte vigente", law: "Circular CNBV Casas de Cambio Cap. III" },
      { text: "Más de $3,000 USD: reporte de operación relevante a la UIF en plazo de 17 días hábiles", law: "Circular CNBV Casas de Cambio Cap. IV — LFPIORPI Art. 17" },
      { text: "Detectar y reportar estructuración (fraccionamiento de operaciones para evadir umbrales)", law: "LFPIORPI Art. 17 — GAFI R.3" },
      { text: "Mantener registro interno de todas las operaciones cambiarias por mínimo 5 años", law: "LGTOC Art. 81-F — LFPIORPI Art. 18" },
      { text: "Verificar que el cliente no aparezca en listas de personas bloqueadas (OFAC, ONU, SHCP)", law: "Circular CNBV Cap. VI — GAFI R.6" },
    ],
  },

  // ── 11. TRANSMISORES DE DINERO ────────────────────────────────────────────
  {
    id: "transmisores-dinero",
    name: "Transmisores de Dinero",
    description: "Entidades dedicadas a la transferencia de fondos nacionales e internacionales.",
    law: {
      title: "Marco Jurídico — Transmisores de Dinero",
      summary:
        "Los Transmisores de Dinero se rigen por la Ley General de Títulos y Operaciones de Crédito (LGTOC), específicamente el Art. 82-H, y deben estar registrados ante la UIF. Operan remesas internacionales y transferencias nacionales bajo estricta vigilancia anti-lavado.",
      norms: [
        "LFPIORPI (marco general)",
        "LGTOC — Art. 82-H: Transmisores de Dinero",
        "Disposiciones CNBV para Transmisores de Dinero",
        "Reglas SHCP para envío de remesas",
        "GAFI — R.16: Transferencias electrónicas (Travel Rule)",
      ],
      articles: [
        "LGTOC Art. 82-H: Marco regulatorio de los Transmisores de Dinero",
        "LGTOC Art. 82-I: Registro obligatorio ante la UIF y la CNBV",
        "Disp. CNBV Transmisores Cap. III: Umbrales de identificación por monto",
        "Disp. CNBV Transmisores Cap. IV: Monitoreo de remesas internacionales",
        "GAFI R.16: Travel Rule — incluir datos del ordenante en transferencias > $1,000 USD",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Registrado ante la UIF. Responsable de supervisar el sistema de monitoreo de remesas y alertas. Coordina con corresponsales internacionales para el cumplimiento del Travel Rule (GAFI R.16).",
      },
      {
        role: "Responsable de Operaciones Internacionales",
        desc: "Supervisa el cumplimiento del Travel Rule: asegura que todas las transferencias > $1,000 USD incluyan datos completos del ordenante y del beneficiario.",
      },
      {
        role: "Comité de Cumplimiento",
        desc: "Revisa alertas del sistema de monitoreo. Aprueba reportes de operaciones inusuales. Evalúa a los corresponsales internacionales bajo política de DDC reforzada.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Relevantes en Transferencias",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD en una sola transferencia o acumulado diario",
      },
      {
        name: "Reporte de Operaciones Inusuales (R01)",
        deadline: "24 horas tras detección",
        threshold: "Cualquier monto — fragmentación, destinos inusuales, corresponsales de riesgo",
      },
      {
        name: "Reporte Mensual de Remesas Internacionales",
        deadline: "10 días hábiles del mes siguiente",
        threshold: "Resumen de operaciones internacionales del mes",
      },
    ],
    obligations: [
      { text: "Registrarse ante la UIF y la CNBV antes de iniciar operaciones", law: "LGTOC Art. 82-I" },
      { text: "Aplicar Travel Rule (GAFI R.16): incluir datos completos del ordenante en transferencias > $1,000 USD", law: "GAFI R.16 — Disp. CNBV Transmisores Cap. IV" },
      { text: "Identificar al cliente en todas las transferencias > $500 USD con documento oficial vigente", law: "Disp. CNBV Transmisores Cap. III" },
      { text: "Monitorear patrones de remesas: mismos destinatarios, frecuencia inusual, países de riesgo", law: "Disp. CNBV Transmisores Cap. IV" },
      { text: "Aplicar DDC reforzada a corresponsales en países considerados de alto riesgo por el GAFI", law: "GAFI R.13 — Disp. CNBV Transmisores Cap. V" },
      { text: "Reportar operaciones inusuales a la UIF dentro de las 24 horas de detección", law: "LFPIORPI Art. 17" },
      { text: "Conservar registros de todas las transferencias por mínimo 5 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 12. SOFINCO ───────────────────────────────────────────────────────────
  {
    id: "sofinco",
    name: "SOFINCO — Sociedad Financiera Comunitaria",
    description: "Entidades de microfinanzas en comunidades rurales y marginadas.",
    law: {
      title: "Marco Jurídico — SOFINCO",
      summary:
        "Las SOFINCO se rigen por la Ley de Ahorro y Crédito Popular (LACP) y son supervisadas por la CNBV de manera proporcional a su tamaño. Operan principalmente en zonas rurales y de bajo acceso financiero, con obligaciones PLD simplificadas que reflejan su perfil de riesgo bajo.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley de Ahorro y Crédito Popular (LACP) — régimen SOFINCO",
        "Disposiciones CNBV para SOFINCO",
        "NOM-151-SCFI-2016 (conservación de registros)",
      ],
      articles: [
        "LACP Arts. 3-A y 4-A: Definición y autorización de SOFINCO",
        "LACP Art. 65: Obligaciones PLD/FT para entidades de ahorro popular",
        "Disp. CNBV SOFINCO Cap. II: Requisitos simplificados de identificación",
        "Disp. CNBV SOFINCO Cap. IV: Umbral de operaciones para reporteo",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Responsable de Cumplimiento (Oficial PLD)",
        desc: "En SOFINCO pequeñas puede ser el gerente general o un directivo. Responsable del programa PLD simplificado y de los reportes a la UIF.",
      },
      {
        role: "Consejo de Administración",
        desc: "Aprueba el programa PLD y los informes de cumplimiento. Supervisa que los socios-clientes cumplan con los requisitos de identificación mínimos.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en una sola operación",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "48 horas tras detección",
        threshold: "Cualquier monto — señal de alerta o conducta atípica del socio",
      },
    ],
    obligations: [
      { text: "Elaborar un Programa de PLD/FT proporcional al tamaño y riesgo de la entidad", law: "LACP Art. 65" },
      { text: "Identificar a todos los socios-clientes con documento oficial vigente (INE/IFE, CURP)", law: "Disp. CNBV SOFINCO Cap. II" },
      { text: "Aplicar DDC simplificada al incorporar nuevos socios (proporcional al riesgo bajo)", law: "LACP — LFPIORPI" },
      { text: "Reportar operaciones inusuales a la UIF dentro de 48 horas de detección", law: "LFPIORPI Art. 17" },
      { text: "Conservar registros de operaciones de socios por mínimo 5 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 13. FIDEICOMISOS ──────────────────────────────────────────────────────
  {
    id: "fideicomisos",
    name: "Fideicomisos",
    description: "Vehículos fiduciarios donde la institución de crédito actúa como fiduciaria.",
    law: {
      title: "Marco Jurídico — Fideicomisos",
      summary:
        "En los fideicomisos, la obligación PLD/FT recae en la institución fiduciaria (banco o institución de crédito) que administra el patrimonio. La Ley General de Títulos y Operaciones de Crédito (LGTOC) establece el marco fiduciario, mientras que las obligaciones PLD derivan del Art. 115 LIC y las Recomendaciones GAFI sobre beneficiario final (R.24-25).",
      norms: [
        "LFPIORPI (marco general)",
        "LGTOC — Arts. 381-407: Fideicomiso",
        "LIC Art. 115: Aplica a la institución fiduciaria",
        "GAFI R.24-25: Transparencia y beneficiario final de estructuras jurídicas",
        "Disposiciones CNBV para Banca Múltiple (aplica a fiduciarias)",
      ],
      articles: [
        "LGTOC Art. 381-382: Concepto y elementos del fideicomiso",
        "LGTOC Art. 395: Obligaciones de la institución fiduciaria",
        "LIC Art. 115: Obligaciones PLD de la fiduciaria como institución de crédito",
        "GAFI R.24: Identificar al beneficiario final (fideicomisario) de toda estructura",
        "GAFI R.25: Conservar información actualizada del beneficiario final del fideicomiso",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales derivadas del fideicomiso",
      ],
    },
    organs: [
      {
        role: "Institución Fiduciaria (Banco/SOFOM ER)",
        desc: "Es el sujeto obligado PLD. Responsable de identificar al fideicomitente, verificar el origen del patrimonio aportado e identificar al beneficiario final. Reporta operaciones inusuales a la UIF.",
      },
      {
        role: "Oficial de Cumplimiento de la Fiduciaria",
        desc: "Supervisa el cumplimiento PLD de todos los fideicomisos en administración. Revisa periódicamente el expediente del fideicomitente y del beneficiario final.",
      },
      {
        role: "Comité Fiduciario (si aplica)",
        desc: "Órgano de gestión del fideicomiso. La fiduciaria puede solicitar información adicional de los miembros del comité para fines de DDC.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales del Fideicomiso",
        deadline: "24 horas tras resolución del Comité de Cumplimiento",
        threshold: "Cualquier monto — aportaciones o retiros atípicos vs. objeto del fideicomiso",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente aportado al fideicomiso en efectivo",
      },
    ],
    obligations: [
      { text: "Identificar y verificar al fideicomitente (quien aporta el patrimonio) con DDC estándar o reforzada", law: "LIC Art. 115 — Disp. CNBV Cap. VI" },
      { text: "Identificar al beneficiario final del fideicomiso (fideicomisario) y mantener registro actualizado", law: "GAFI R.24-25 — LFPIORPI Art. 17" },
      { text: "Verificar el origen lícito del patrimonio aportado al fideicomiso", law: "LIC Art. 115 — GAFI R.24" },
      { text: "Monitorear las operaciones del fideicomiso vs. su objeto declarado (uso permitido)", law: "Disp. CNBV Cap. VIII" },
      { text: "Reportar operaciones inusuales derivadas de las instrucciones del fideicomitente a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar expediente del fideicomiso (contrato, partes, beneficiario final) por mínimo 7 años", law: "LFPIORPI Art. 18 — LGTOC Art. 395" },
    ],
  },

  // ── 14. CENTROS CAMBIARIOS ────────────────────────────────────────────────
  {
    id: "centros-cambiarios",
    name: "Centros Cambiarios",
    description: "Personas físicas o morales que compran y venden divisas de forma habitual.",
    law: {
      title: "Marco Jurídico — Centros Cambiarios",
      summary:
        "Los Centros Cambiarios son entidades de menor escala que las Casas de Cambio. Se rigen por las Reglas de Carácter General emitidas por la CNBV y deben registrarse ante dicho organismo para operar. Sus umbrales de identificación son similares a los de las Casas de Cambio pero con obligaciones de reporte diferenciadas.",
      norms: [
        "LFPIORPI (marco general)",
        "LGTOC — Arts. 81-A ss.: Referencia para centros cambiarios",
        "Reglas CNBV para Centros Cambiarios y Transmisores",
        "Criterios SHCP para el sector cambiario de menor escala",
      ],
      articles: [
        "Reglas CNBV Cap. II: Registro obligatorio de Centros Cambiarios ante la CNBV",
        "Reglas CNBV Cap. III: Umbrales de identificación — < $300 USD sin ID, $300-$3,000 USD con ID",
        "Reglas CNBV Cap. IV: Reporte de operaciones cambiarias > $3,000 USD a la UIF",
        "Reglas CNBV Cap. V: Prohibición de operar con personas en listas de bloqueados",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Responsable de Cumplimiento (propietario o encargado)",
        desc: "En centros cambiarios pequeños suele ser el propietario. Registrado ante la CNBV. Responsable de verificar los umbrales de identificación en cada operación y de emitir reportes a la UIF.",
      },
      {
        role: "Cajero de Ventanilla",
        desc: "Aplica en tiempo real los umbrales de identificación por monto. Registra cada operación y solicita documentación de identidad cuando corresponde.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operación Cambiaria Relevante",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $3,000 USD equivalente en una sola operación",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24-48 horas tras detección",
        threshold: "Cualquier monto — fragmentación, operaciones repetidas del mismo cliente",
      },
    ],
    obligations: [
      { text: "Registrarse ante la CNBV antes de iniciar operaciones cambiarias", law: "Reglas CNBV Centros Cambiarios Cap. II" },
      { text: "Aplicar umbrales: hasta $300 USD sin identificación; $300-$3,000 USD con INE/IFE o pasaporte", law: "Reglas CNBV Cap. III" },
      { text: "Reportar operaciones > $3,000 USD a la UIF en plazo de 17 días hábiles del mes siguiente", law: "Reglas CNBV Cap. IV — LFPIORPI Art. 17" },
      { text: "Verificar que el cliente no aparezca en listas de personas bloqueadas antes de operar", law: "Reglas CNBV Cap. V — GAFI R.6" },
      { text: "Mantener registro escrito o electrónico de todas las operaciones cambiarias", law: "Reglas CNBV Cap. VI" },
      { text: "Conservar registros de operaciones y clientes por mínimo 5 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 15. ALMACENES GENERALES DE DEPÓSITO ───────────────────────────────────
  {
    id: "almacenes-generales",
    name: "Almacenes Generales de Depósito",
    description: "Organizaciones auxiliares de crédito que guardan y conservan bienes o mercancías.",
    law: {
      title: "Marco Jurídico — Almacenes Generales de Depósito",
      summary:
        "Los Almacenes Generales de Depósito son organizaciones auxiliares del crédito reguladas por la Ley General de Organizaciones y Actividades Auxiliares del Crédito (LGOAC). Sus obligaciones PLD derivan de la LFPIORPI y las Disposiciones Técnicas emitidas por la CNBV para el sector.",
      norms: [
        "LFPIORPI (marco general)",
        "LGOAC — Arts. 11-23: Almacenes Generales de Depósito",
        "Disposiciones Técnicas CNBV para Organizaciones Auxiliares",
        "NOM-151-SCFI-2016: Conservación de registros",
      ],
      articles: [
        "LGOAC Art. 11: Definición y autorización de Almacenes Generales de Depósito",
        "LGOAC Art. 19: Emisión de Certificados de Depósito y Bonos de Prenda",
        "LGOAC Art. 21: Prohibiciones y obligaciones de los almacenes",
        "Disp. Técnicas CNBV: Obligaciones PLD para organizaciones auxiliares",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
        "GAFI R.24: Identificar beneficiario final en operaciones con mercancías de alto valor",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Responsable del programa PLD adaptado al modelo de negocio de almacenamiento. Supervisa la identificación de depositantes y la emisión de certificados de depósito de alto valor.",
      },
      {
        role: "Responsable de Operaciones de Almacén",
        desc: "Verifica la identidad del depositante y el origen declarado de las mercancías. Alerta sobre depósitos de bienes de valor inusualmente alto o sin justificación comercial.",
      },
    ],
    reports: [
      {
        name: "Reporte de Depósitos de Bienes de Alto Valor",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "Depósitos cuyo valor estimado supere $7,500 USD en bienes o mercancías",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24-48 horas tras detección",
        threshold: "Depósitos sin justificación comercial, bienes de origen desconocido",
      },
    ],
    obligations: [
      { text: "Identificar y verificar al depositante con DDC estándar antes de recibir bienes", law: "LGOAC Art. 21 — Disp. Técnicas CNBV" },
      { text: "Documentar el origen y naturaleza de los bienes depositados en cada operación", law: "LGOAC Art. 19 — LFPIORPI" },
      { text: "Emitir Certificados de Depósito solo a depositantes identificados y verificados", law: "LGOAC Art. 19" },
      { text: "Reportar depósitos de bienes con valor inusual o sin justificación comercial a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes de depositantes y registros de operaciones por mínimo 5 años", law: "LFPIORPI Art. 18" },
    ],
  },

  // ── 16. FONDOS DE INVERSIÓN ───────────────────────────────────────────────
  {
    id: "fondos-inversion",
    name: "Fondos de Inversión",
    description: "Captación y administración profesional de carteras de inversión colectiva.",
    law: {
      title: "Marco Jurídico — Fondos de Inversión",
      summary:
        "Los Fondos de Inversión se rigen por la Ley de Fondos de Inversión (LFI) y son supervisados por la CNBV. Las obligaciones PLD/FT aplican a la Operadora del Fondo (que administra los activos) y a la Distribuidora (que vende las acciones del fondo a los inversionistas).",
      norms: [
        "LFPIORPI (marco general)",
        "Ley de Fondos de Inversión (LFI) — Arts. relevantes PLD",
        "Disposiciones CNBV para Fondos de Inversión (PLD/FT)",
        "Disposiciones CNBV para Casas de Bolsa (supletorio como distribuidoras)",
        "GAFI R.10: DDC para inversionistas en fondos",
      ],
      articles: [
        "LFI Art. 4: Definición y tipos de fondos de inversión",
        "LFI Art. 7: Obligaciones de la Operadora: KYC del inversionista",
        "LFI Art. 8: Obligaciones de la Distribuidora: identificación y verificación",
        "Disp. CNBV Fondos Cap. IV: Expediente del inversionista y perfil de riesgo",
        "Disp. CNBV Fondos Cap. VI: Monitoreo de suscripciones y redenciones inusuales",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento de la Operadora",
        desc: "Supervisa el cumplimiento PLD de la operadora del fondo. Certifica que los inversionistas han pasado por el proceso de KYC antes de suscribir acciones del fondo.",
      },
      {
        role: "Responsable de Distribución / KYC",
        desc: "En la distribuidora (que puede ser una casa de bolsa o la propia operadora). Aplica la DDC al inversionista: identidad, perfil financiero y origen de los recursos a invertir.",
      },
      {
        role: "Comité de Cumplimiento",
        desc: "Revisa alertas de suscripciones o redenciones inusuales. Aprueba los reportes de operaciones inusuales a la UIF. Evalúa el riesgo de los inversionistas de alto valor.",
      },
    ],
    reports: [
      {
        name: "Reporte de Suscripción o Redención Inusual",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — operación inconsistente con perfil del inversionista",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente en efectivo para suscripción",
      },
    ],
    obligations: [
      { text: "Aplicar KYC al 100% de los inversionistas: identidad, perfil financiero y origen de recursos", law: "LFI Art. 7-8 — Disp. CNBV Fondos Cap. IV" },
      { text: "Verificar que el inversionista no aparezca en listas de personas bloqueadas (OFAC, ONU, SHCP)", law: "GAFI R.6 — Disp. CNBV Fondos Cap. V" },
      { text: "Monitorear suscripciones y redenciones vs. el perfil transaccional declarado del inversionista", law: "Disp. CNBV Fondos Cap. VI" },
      { text: "Reportar suscripciones o redenciones inusuales a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar el expediente del inversionista y registros de transacciones por mínimo 7 años", law: "LFPIORPI Art. 18 — LFI" },
    ],
  },

  // ── 17. UNIONES DE CRÉDITO ────────────────────────────────────────────────
  {
    id: "uniones-credito",
    name: "Uniones de Crédito",
    description: "Organizaciones auxiliares del crédito que operan solo con sus asociados.",
    law: {
      title: "Marco Jurídico — Uniones de Crédito",
      summary:
        "Las Uniones de Crédito se rigen por la Ley de Uniones de Crédito (LUC) y son supervisadas por la CNBV. Operan exclusivamente con sus socios (personas físicas o morales del mismo giro empresarial). Sus obligaciones PLD son proporcionales a su tamaño y al volumen de operaciones con los asociados.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley de Uniones de Crédito (LUC) — Arts. relevantes PLD",
        "Disposiciones CNBV para Uniones de Crédito",
        "NOM-151-SCFI-2016: Conservación de registros",
      ],
      articles: [
        "LUC Art. 40: Obligaciones de identificación de los socios",
        "LUC Art. 62: Obligaciones PLD/FT para Uniones de Crédito",
        "Disp. CNBV Uniones Cap. III: EBR y perfil de riesgo del socio",
        "Disp. CNBV Uniones Cap. V: Expediente del socio y DDC",
        "Disp. CNBV Uniones Cap. VII: Reportes de operaciones relevantes",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Responsable del programa PLD adaptado al modelo de negocio de las uniones (solo con socios). Supervisa la identificación de nuevos socios y el monitoreo de sus transacciones.",
      },
      {
        role: "Consejo de Administración",
        desc: "Aprueba el programa PLD y el expediente de nuevos socios de alto valor. Recibe informes semestrales del Oficial de Cumplimiento sobre el estado del programa.",
      },
      {
        role: "Comisión de Vigilancia",
        desc: "Audita internamente el cumplimiento normativo. Verifica que los reportes a la UIF se hayan emitido correctamente.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $7,500 USD equivalente en una sola operación de socio",
      },
      {
        name: "Reporte de Operaciones Inusuales",
        deadline: "24-48 horas tras detección",
        threshold: "Cualquier monto — operación atípica del socio vs. su perfil",
      },
    ],
    obligations: [
      { text: "Identificar y verificar la identidad de cada socio al momento de su admisión (DDC)", law: "LUC Art. 40 — Disp. CNBV Uniones Cap. V" },
      { text: "Aplicar EBR: clasificar socios por nivel de riesgo según su actividad y volumen de operaciones", law: "Disp. CNBV Uniones Cap. III" },
      { text: "Monitorear las operaciones de los socios vs. su perfil transaccional registrado", law: "Disp. CNBV Uniones Cap. VI" },
      { text: "Reportar operaciones relevantes en efectivo > $7,500 USD a la UIF", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes de socios y registros de operaciones por mínimo 5 años", law: "LFPIORPI Art. 18 — LUC" },
    ],
  },

  // ── 18. ASESORES EN INVERSIONES ───────────────────────────────────────────
  {
    id: "asesores-inversiones",
    name: "Asesores en Inversiones",
    description: "Personas que prestan servicios de administración de cartera de valores.",
    law: {
      title: "Marco Jurídico — Asesores en Inversiones",
      summary:
        "Los Asesores en Inversiones (AI) se rigen por la Ley del Mercado de Valores (LMV). Están supervisados por la CNBV y la CONDUSEF. Sus obligaciones PLD son más simples que las de las Casas de Bolsa porque no custodian activos directamente, pero sí deben identificar al cliente y reportar señales de alerta.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley del Mercado de Valores (LMV) — Arts. 226-232: Asesores en Inversiones",
        "Disposiciones CNBV para Asesores en Inversiones (PLD/FT)",
        "GAFI R.10: DDC para clientes de servicios de gestión patrimonial",
      ],
      articles: [
        "LMV Art. 226: Definición y registro obligatorio de Asesores en Inversiones",
        "LMV Art. 228: Obligaciones de conducta y conflictos de interés",
        "LMV Art. 232: Obligaciones PLD/FT para Asesores en Inversiones",
        "Disp. CNBV AI Cap. III: Identificación y perfil del cliente asesorado",
        "Disp. CNBV AI Cap. V: Monitoreo de señales de alerta en portafolios asesorados",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales detectadas en la asesoría",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento (o el propio asesor)",
        desc: "En firmas de asesoría individual, el propio asesor asume la función de cumplimiento. En firmas con múltiples asesores, se designa un Oficial de Cumplimiento registrado ante la CNBV.",
      },
      {
        role: "Responsable de Ética y Conflictos de Interés",
        desc: "Verifica que las recomendaciones de inversión no estén motivadas por conflictos de interés. Reporta anomalías en las instrucciones del cliente que puedan indicar LD.",
      },
    ],
    reports: [
      {
        name: "Reporte de Operación Inusual detectada en Portafolio",
        deadline: "24-48 horas tras detección",
        threshold: "Cualquier monto — instrucciones inconsistentes con perfil del cliente",
      },
      {
        name: "Reporte de Posible Asesoría en Operaciones de LD",
        deadline: "24 horas tras detección",
        threshold: "Cuando el cliente solicite estructuración para evadir reportes",
      },
    ],
    obligations: [
      { text: "Registrarse ante la CNBV antes de prestar servicios de asesoría en inversiones", law: "LMV Art. 226" },
      { text: "Identificar y conocer al cliente: perfil financiero, patrimonio, origen de recursos y objetivos de inversión", law: "LMV Art. 232 — Disp. CNBV AI Cap. III" },
      { text: "Verificar que el cliente no aparezca en listas de personas bloqueadas antes de iniciar la asesoría", law: "GAFI R.6 — Disp. CNBV AI Cap. IV" },
      { text: "Detectar y reportar a la UIF instrucciones de inversión inconsistentes con el perfil del cliente", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes del cliente y registros de recomendaciones por mínimo 5 años", law: "LFPIORPI Art. 18 — LMV Art. 232" },
    ],
  },

  // ── 19. FINANCIERA NACIONAL DE DESARROLLO ────────────────────────────────
  {
    id: "fnd",
    name: "FINANCIERA NACIONAL DE DESARROLLO AGROPECUARIO, RURAL Y PESQUERO",
    description: "Banca de desarrollo especializada en el sector primario y rural.",
    law: {
      title: "Marco Jurídico — Financiera Nacional de Desarrollo (FND)",
      summary:
        "La FND se rige por su Ley Orgánica y es supervisada por la CNBV. Como institución de banca de desarrollo especializada en el sector agropecuario, pesquero y rural, sus obligaciones PLD aplican el Art. 115 LIC de manera análoga, con adaptaciones para financiamientos productivos a productores rurales.",
      norms: [
        "LFPIORPI (marco general)",
        "Ley Orgánica de la Financiera Nacional de Desarrollo Agropecuario, Rural, Forestal y Pesquero",
        "LIC Art. 115 (aplicación análoga como institución de crédito)",
        "Disposiciones CNBV Banca de Desarrollo (supletorio)",
        "Criterios SHCP para instituciones del sector público financiero",
      ],
      articles: [
        "Ley Orgánica FND Art. 7: Programa de PLD/FT institucional",
        "Ley Orgánica FND Art. 5: Objeto y sujetos elegibles de financiamiento",
        "LIC Art. 115 (análogo): Obligaciones PLD — identificación, reportes y conservación",
        "Disp. CNBV Banca de Desarrollo: EBR para financiamientos al sector primario",
        "GAFI R.24: Identificación del beneficiario final en financiamientos a ejidos y cooperativas",
        "LFPIORPI Art. 17: Reporte de operaciones inusuales a la UIF",
      ],
    },
    organs: [
      {
        role: "Oficial de Cumplimiento",
        desc: "Designado por el Consejo Directivo. Conocedor del sector agropecuario y rural. Supervisa la DDC en financiamientos a ejidos, cooperativas y productores rurales.",
      },
      {
        role: "Dirección de Auditoría Interna",
        desc: "Verifica anualmente la efectividad del programa PLD. Reporta al Consejo Directivo con observaciones específicas al perfil de riesgo del sector rural.",
      },
      {
        role: "Comité de Control y Cumplimiento",
        desc: "Aprueba el expediente de acreditados de alto valor. Revisa casos con señales de alerta en el sector agropecuario (coyotaje, triangulación de subsidios).",
      },
    ],
    reports: [
      {
        name: "Reporte de Operaciones Inusuales en Financiamiento Rural",
        deadline: "24 horas tras resolución del Comité",
        threshold: "Cualquier monto — financiamiento inconsistente con la actividad agropecuaria declarada",
      },
      {
        name: "Reporte de Operaciones Relevantes en Efectivo",
        deadline: "17 días hábiles del mes siguiente",
        threshold: "> $10,000 USD equivalente en efectivo",
      },
    ],
    obligations: [
      { text: "Identificar y verificar al acreditado: productor rural, ejido, cooperativa o empresa agropecuaria", law: "Ley Orgánica FND — LIC Art. 115 análogo" },
      { text: "Identificar al beneficiario final de financiamientos a ejidos, cooperativas y personas jurídicas rurales", law: "GAFI R.24 — LFPIORPI Art. 17" },
      { text: "Aplicar EBR adaptado al sector primario: evaluar si el monto del crédito corresponde a la capacidad productiva", law: "Disp. CNBV Banca de Desarrollo Cap. III" },
      { text: "Detectar y reportar señales de alerta del sector rural: triangulación de subsidios, coyotaje o créditos sin destino productivo", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes de acreditados y registros de créditos por mínimo 7 años", law: "LFPIORPI Art. 18" },
      { text: "Reportar operaciones inusuales a la UIF en los plazos establecidos", law: "LFPIORPI Art. 17" },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
type TabId = "juridico" | "organos" | "reporteria" | "obligaciones"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "juridico",     label: "Marco Jurídico", icon: Scale },
  { id: "organos",      label: "Órganos Internos", icon: UserCog },
  { id: "reporteria",   label: "Reportería",     icon: BarChart3 },
  { id: "obligaciones", label: "Obligaciones",   icon: CheckSquare },
]

export default function EntitiesPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<TabId>("juridico")

  const filtered = ENTITY_TYPES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeEntity = ENTITY_TYPES.find((e) => e.id === selected)

  function handleStudy() {
    if (selected) router.push(`/estudio?sector=${selected}`)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border-2 border-b-[6px] border-gray-200 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-blue-700">Explorador de Entidades</h1>
          <p className="text-gray-600 font-medium">
            Marco normativo y obligaciones PLD/FT de cada sector regulado por la CNBV.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Buscar entidad..."
            className="pl-10 rounded-2xl border-2 border-gray-200 focus:border-blue-500 h-12 text-gray-800 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity List */}
        <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest px-2 sticky top-0 bg-gray-50/90 backdrop-blur-sm py-2">
            Sectores Disponibles ({filtered.length})
          </h2>
          <div className="space-y-3">
            {filtered.map((entity) => (
              <button
                key={entity.id}
                onClick={() => { setSelected(entity.id); setTab("juridico") }}
                className={cn(
                  "w-full text-left p-5 rounded-2xl transition-all duration-200 border-2",
                  selected === entity.id
                    ? "bg-blue-700 text-white border-blue-700 border-b-[6px] shadow-lg shadow-blue-200"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-800 hover:bg-blue-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black uppercase tracking-tight text-sm line-clamp-1">{entity.name}</span>
                  <Building2 className={cn("h-4 w-4 shrink-0", selected === entity.id ? "text-white" : "text-blue-600")} />
                </div>
                <p className={cn("text-xs leading-relaxed line-clamp-2 font-medium", selected === entity.id ? "text-blue-100" : "text-gray-500")}>
                  {entity.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {activeEntity ? (
            <div className="bg-white rounded-3xl border-2 border-b-[6px] border-gray-200 overflow-hidden">
              {/* Entity header */}
              <div className="p-8 pb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-blue-700 uppercase tracking-tight">{activeEntity.name}</h2>
                    <p className="text-gray-600 font-medium text-sm">{activeEntity.description}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                  {TABS.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-all",
                          tab === t.id
                            ? "border-blue-700 text-blue-700"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-8 min-h-[300px]">

                {/* Marco Jurídico */}
                {tab === "juridico" && (
                  <div className="space-y-5">
                    <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-700" />
                        <span className="font-black text-blue-800 text-sm uppercase tracking-wide">{activeEntity.law.title}</span>
                      </div>
                      <p className="text-blue-900 text-sm leading-relaxed">{activeEntity.law.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Normas Aplicables</p>
                        <ul className="space-y-1.5">
                          {activeEntity.law.norms.map((n) => (
                            <li key={n} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <Scale className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Artículos Clave</p>
                        <ul className="space-y-1.5">
                          {activeEntity.law.articles.map((a) => (
                            <li key={a} className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                              <FileSearch className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Órganos Internos */}
                {tab === "organos" && (
                  <div className="space-y-4">
                    {activeEntity.organs.map((organ) => (
                      <div key={organ.role} className="p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          <span className="font-black text-gray-900">{organ.role}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{organ.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reportería */}
                {tab === "reporteria" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left pb-3 font-black text-gray-700 pr-4">Reporte</th>
                          <th className="text-left pb-3 font-black text-gray-700 pr-4">Plazo</th>
                          <th className="text-left pb-3 font-black text-gray-700">Umbral / Disparador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeEntity.reports.map((r) => (
                          <tr key={r.name} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 font-semibold text-gray-800">{r.name}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs whitespace-nowrap">
                                {r.deadline}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600 text-xs">{r.threshold}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Obligaciones */}
                {tab === "obligaciones" && (
                  <div className="space-y-3">
                    {activeEntity.obligations.map((ob, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="h-6 w-6 rounded-lg bg-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-xs font-black">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{ob.text}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">Fundamento: {ob.law}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study button */}
              <div className="px-8 pb-8 mt-auto">
                <Button
                  className="w-full py-6 text-lg font-black rounded-2xl bg-blue-700 hover:bg-blue-800 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all"
                  onClick={handleStudy}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  ESTUDIAR ESTE SECTOR
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-4">
              <Building2 className="h-16 w-16 text-gray-300" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-400 uppercase">Selecciona un Sector</h3>
                <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
                  Explora el marco normativo real y las obligaciones específicas que cada entidad debe cumplir ante la CNBV.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
