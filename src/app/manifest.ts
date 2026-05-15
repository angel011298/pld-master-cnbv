import type { MetadataRoute } from "next";

/**
 * Web App Manifest — mejora la experiencia al agregar la app a pantalla de inicio.
 * Next.js lo sirve en /manifest.json y lo referencia automáticamente en el <head>.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Certifik PLD",
    short_name: "Certifik",
    description:
      "Plataforma de estudio para la certificación en Prevención de Lavado de Dinero de la CNBV.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0D10",
    theme_color: "#0B0D10",
    categories: ["education", "finance"],
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
