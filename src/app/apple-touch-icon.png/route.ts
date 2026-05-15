/**
 * GET /apple-touch-icon.png
 *
 * iOS busca este URL por auto-descubrimiento ANTES de leer el HTML.
 * Orden de búsqueda de iOS:
 *   1. /apple-touch-icon-180x180-precomposed.png
 *   2. /apple-touch-icon-180x180.png
 *   3. /apple-touch-icon-precomposed.png
 *   4. /apple-touch-icon.png   ← esta ruta
 *   5. <link rel="apple-touch-icon"> en el HTML (fallback)
 *
 * Al servir el PNG aquí (URL sin query params, sin caché de Next.js),
 * iOS lo encuentra inmediatamente al hacer "Agregar a pantalla de inicio".
 */
import { ImageResponse } from "next/og";
import { renderIcon } from "../apple-icon";

export const dynamic = "force-static"; // precaché en Vercel Edge Network

export async function GET() {
  return new ImageResponse(renderIcon(), {
    width: 180,
    height: 180,
    headers: {
      // Permite caché pública 24h para que iOS retenga el ícono
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": "image/png",
    },
  });
}
