import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// CORRECCIÓN APLICADA: Actualizado el metadata para Certifik PLD
export const metadata: Metadata = {
  title: "Certifik PLD | Certificación CNBV 2026",
  description: "Plataforma de microaprendizaje gamificada para aprobar el examen PLD/FT de la CNBV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}