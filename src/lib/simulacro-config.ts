// Shared configuration for the 60-question CNBV simulacro.
// Maps schema-v2 topic keys → actual quiz_bank.tema strings + display info.

export const TOPIC_DISTRIBUTION = [
  { key: "tipologias",    tema: "Casos Prácticos Aplicados",                   count:  5, label: "BLOQUE 1: El Lavado de Dinero y el Financiamiento al Terrorismo",                          slug: "tipologias"    },
  { key: "gafi",          tema: "Definiciones PLD/FT",                          count: 10, label: "BLOQUE 2: Organismos y Foros Internacionales que Participan en PLD y FT",                  slug: "gafi"          },
  { key: "sanciones",     tema: "Identificación de Operaciones Sospechosas",    count:  5, label: "BLOQUE 3: Detección y Gestión de Riesgos en Materia de PLD/FT",                            slug: "sanciones"     },
  { key: "kyc_cdd",       tema: "Procedimientos de Cumplimiento",               count: 12, label: "BLOQUE 4: Prevención y Combate del LD/FT en el Sistema Financiero Mexicano",               slug: "kyc_cdd"       },
  { key: "reportes_cnbv", tema: "Reportes y Documentación",                     count: 10, label: "BLOQUE 5: Régimen de Prevención del LD/FT en el Sistema Financiero Mexicano",              slug: "reportes_cnbv" },
  { key: "marco_legal",   tema: "Marco Regulatorio y Autoridades",              count: 12, label: "BLOQUE 6: Nociones de la Ley FPIORPI",                                                     slug: "marco_legal"   },
  { key: "une",           tema: "Actitud y Ética Profesional",                  count:  6, label: "BLOQUE 7: Auditoría en Materia de PLD/FT",                                                 slug: "une"           },
] as const;

export type TopicKey = (typeof TOPIC_DISTRIBUTION)[number]["key"];

export const TOTAL_QUESTIONS = TOPIC_DISTRIBUTION.reduce((s, t) => s + t.count, 0); // 60
export const EXAM_DURATION_SEC = 90 * 60; // 5 400 s

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function topicByTema(tema: string) {
  return TOPIC_DISTRIBUTION.find((t) => t.tema === tema);
}
