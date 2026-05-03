// Shared configuration for the 60-question CNBV simulacro.
// Maps schema-v2 topic keys → actual quiz_bank.tema strings + display info.

export const TOPIC_DISTRIBUTION = [
  { key: "marco_legal",    tema: "Marco Regulatorio y Autoridades",          count: 12, label: "Marco Legal",       slug: "marco-regulatorio" },
  { key: "gafi",           tema: "Definiciones PLD/FT",                      count: 10, label: "GAFI y Organismos", slug: "definiciones"      },
  { key: "kyc_cdd",        tema: "Procedimientos de Cumplimiento",            count: 12, label: "KYC / CDD",         slug: "procedimientos"    },
  { key: "reportes_cnbv",  tema: "Reportes y Documentación",                 count: 10, label: "Reportes CNBV",     slug: "reportes"          },
  { key: "une",            tema: "Actitud y Ética Profesional",               count:  6, label: "UNE y Cumplimiento",slug: "actitud"           },
  { key: "sanciones",      tema: "Identificación de Operaciones Sospechosas", count:  5, label: "Sanciones",         slug: "identificacion"    },
  { key: "tipologias",     tema: "Casos Prácticos Aplicados",                 count:  5, label: "Tipologías",        slug: "casos-practicos"   },
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
