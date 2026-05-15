import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],

  // Rewrites para cubrir todas las variantes de URL que iOS busca
  // por auto-descubrimiento (en orden de prioridad que usa iOS Safari):
  async rewrites() {
    return [
      // Variantes "precomposed" → misma imagen
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-touch-icon.png",
      },
      {
        source: "/apple-touch-icon-:size-precomposed.png",
        destination: "/apple-touch-icon.png",
      },
      {
        source: "/apple-touch-icon-:size.png",
        destination: "/apple-touch-icon.png",
      },
    ];
  },
};

export default nextConfig;
