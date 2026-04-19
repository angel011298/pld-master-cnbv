// Lightweight Resend email sender. Configure via RESEND_API_KEY.
// No SDK dependency; uses REST API.

const RESEND_API = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurada.");

  const from = input.from ?? process.env.RESEND_FROM ?? "Certifik PLD <hola@certifik.mx>";

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: input.to, from, subject: input.subject, html: input.html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }

  return (await res.json()) as { id: string };
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Tu acceso a Certifik PLD está activo 🚀",
    html: `<h1>Bienvenido${name ? `, ${name}` : ""}</h1>
<p>Tu acceso premium está activo. Ya puedes entrar al simulador, el chat IA y el foro de comunidad.</p>
<p><a href="https://certifik.mx/dashboard">Ir al dashboard</a></p>`,
  }),
  exam30d: () => ({
    subject: "Faltan 30 días para tu examen CNBV — ¿Vas bien?",
    html: `<h1>El examen se acerca</h1>
<p>Faltan 30 días para el examen CNBV PLD/FT. Repasa con el simulacro cronometrado y el modo estudio por área.</p>`,
  }),
  exam7d: () => ({
    subject: "7 días — Recta final para tu certificación CNBV",
    html: `<h1>Última semana</h1>
<p>Haz 2 simulacros esta semana y repasa las preguntas que fallaste.</p>`,
  }),
  motivational: (streak: number) => ({
    subject: `¡${streak} simulacros completados! Sigue así 🔥`,
    html: `<h1>Vas bien</h1>
<p>Ya llevas ${streak} simulacros. Los datos muestran que quienes hacen 5+ simulacros aprueban al primer intento.</p>`,
  }),
  postExam: () => ({
    subject: "¿Ya presentaste el examen? Cuéntanos cómo te fue",
    html: `<h1>Comparte tu experiencia</h1>
<p>Tu testimonio ayuda a otros a prepararse mejor. <a href="https://certifik.mx/settings">Reporta tu resultado</a></p>`,
  }),
  expiration: (days: number) => ({
    subject: `Tu acceso vence en ${days} días`,
    html: `<h1>Renueva antes de perder tu progreso</h1>
<p>Tu acceso premium vence en ${days} días. Si tienes otro ciclo de examen, renueva ahora.</p>`,
  }),
  recertificacion: () => ({
    subject: "Tu certificación cumple 5 años — es hora de recertificarte",
    html: `<h1>Recertificación disponible</h1>
<p>Como ex-usuario, tienes 15% de descuento en el acceso completo.</p>`,
  }),
};
