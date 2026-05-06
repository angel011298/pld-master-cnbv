import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://certifik-pld.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: {
    default: "Certifik PLD | Preparación examen CNBV PLD/FT",
    template: "%s | Certifik PLD",
  },
  description:
    "Plataforma de estudio para la certificación en Prevención de Lavado de Dinero de la CNBV. Banco de 200+ reactivos, simulacros y tutor IA.",
  keywords: [
    "examen CNBV",
    "PLD",
    "FT",
    "prevención lavado de dinero",
    "certificación CNBV",
    "preparación examen PLD",
    "GAFI",
    "LFPIORPI",
    "cumplimiento ALD",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Certifik PLD",
    title: "Certifik PLD | Preparación examen CNBV PLD/FT",
    description:
      "Plataforma de estudio para la certificación en Prevención de Lavado de Dinero de la CNBV. Banco de 200+ reactivos, simulacros y tutor IA.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Certifik PLD - Preparación examen CNBV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Certifik PLD | Preparación examen CNBV PLD/FT",
    description:
      "Banco de 200+ reactivos, simulacros cronometrados y tutor IA para la certificación CNBV PLD/FT.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
