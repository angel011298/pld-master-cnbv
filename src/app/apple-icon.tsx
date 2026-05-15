/**
 * Apple Touch Icon — Next.js lo sirve en /apple-icon.png e inyecta:
 *   <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180">
 *
 * IMPORTANTE: iOS también busca /apple-touch-icon.png por auto-descubrimiento.
 * Esa URL la maneja src/app/apple-touch-icon.png/route.ts con el mismo diseño.
 *
 * Diseño: isótipo Certifik PLD
 *  · Fondo #0B0D10
 *  · 7 puntos #004FAE — patrón L+U (escala 180/64 = ×2.8125 sobre viewBox 64×64)
 *  · Píldora blanca en cuadrante inferior-derecho
 */
import { ImageResponse } from "next/og";

// Sin "edge" — usar runtime nodejs para mayor estabilidad en Vercel
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(renderIcon(), { width: 180, height: 180 });
}

/**
 * Función separada para poder reutilizarla también en el route handler
 * de /apple-touch-icon.png
 *
 * Escala: viewBox 64×64 → 180×180 (factor 2.8125)
 * Centros originales: (20,20)(32,20)(44,20)(20,32)(20,44)(32,44)(44,44) r=3.5
 * Centros escalados:  (56,56)(90,56)(124,56)(56,90)(56,124)(90,124)(124,124) r≈10
 * Div top-left = centro − radio (10px)
 *
 * Píldora blanca original: x=28 y=28 w=20 h=8 rx=4
 * Píldora escalada:        left=79 top=79 w=56 h=23 rx=11
 */
export function renderIcon() {
  // top-left de cada div = centro − 10  (radio = 10px, diámetro = 20px)
  const D = 20; // diámetro
  const dots: [number, number][] = [
    // [left, top]  →  centro = [left+10, top+10]
    [46, 46], [80, 46], [114, 46],   // fila superior  → centros (56,56)(90,56)(124,56)
    [46, 80],                          // fila central   → centro  (56,90)
    [46, 114], [80, 114], [114, 114], // fila inferior  → centros (56,124)(90,124)(124,124)
  ];

  return (
    <div
      style={{
        width: 180,
        height: 180,
        background: "#0B0D10",
        display: "flex",
        position: "relative",
      }}
    >
      {/* Punto 1 — (56, 56) */}
      <div style={{ position: "absolute", left: dots[0][0], top: dots[0][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 2 — (90, 56) */}
      <div style={{ position: "absolute", left: dots[1][0], top: dots[1][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 3 — (124, 56) */}
      <div style={{ position: "absolute", left: dots[2][0], top: dots[2][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 4 — (56, 90) */}
      <div style={{ position: "absolute", left: dots[3][0], top: dots[3][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 5 — (56, 124) */}
      <div style={{ position: "absolute", left: dots[4][0], top: dots[4][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 6 — (90, 124) */}
      <div style={{ position: "absolute", left: dots[5][0], top: dots[5][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />
      {/* Punto 7 — (124, 124) */}
      <div style={{ position: "absolute", left: dots[6][0], top: dots[6][1], width: D, height: D, borderRadius: "50%", background: "#004FAE" }} />

      {/* Píldora blanca */}
      <div
        style={{
          position: "absolute",
          left: 79,
          top: 79,
          width: 56,
          height: 23,
          borderRadius: 11,
          background: "#FFFFFF",
        }}
      />
    </div>
  );
}
