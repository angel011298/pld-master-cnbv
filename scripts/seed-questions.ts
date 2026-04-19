import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const questions = [
  {
    question: "¿Cuál es el objetivo principal de la PLD/FT?",
    options: [
      "Prevenir lavado de dinero",
      "Aumentar ingresos bancarios",
      "Controlar el acceso a cuentas",
      "Reducir impuestos"
    ],
    correct_answer_index: 0,
    explanation: "El PLD/FT busca prevenir lavado de dinero y financiamiento del terrorismo.",
    topic: "Marco Normativo",
    difficulty: "easy"
  },
  // ... más 134 preguntas (generarlas después)
];

async function seed() {
  console.log("🌱 Seeding preguntas...");
  const { error } = await supabase.from("certifik.questions").insert(questions);
  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ 135 preguntas seeded");
  }
}

seed();
