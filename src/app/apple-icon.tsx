/**
 * Apple Touch Icon — generado automáticamente por Next.js App Router.
 * Se sirve en /apple-icon.png y Next.js inyecta:
 *   <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180">
 *
 * Reproduce el isótipo de Certifik PLD:
 *  · Fondo oscuro #0B0D10
 *  · 7 puntos azules (#004FAE) en patrón L+U
 *  · Rectángulo blanco (píldora) en el cuadrante inferior-derecho
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Coordenadas en escala 180×180 (viewBox original 64×64 → factor ×2.8125)
// Puntos originales: (20,20) (32,20) (44,20) (20,32) (20,44) (32,44) (44,44) r=3.5
// → diámetro escalado ≈ 20px, posiciones ×2.8125
const DOT_D = 20; // diámetro del punto
const DOTS: [number, number][] = [
  [46, 46], [80, 46], [114, 46],  // fila superior
  [46, 80],                        // fila central-izquierda
  [46, 114], [80, 114], [114, 114], // fila inferior
];

// Rect blanco: original x=28 y=28 w=20 h=8 rx=4
// → x=79 y=79 w=56 h=23 rx=11
const PILL = { x: 79, y: 79, w: 56, h: 23, r: 11 };

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0B0D10",
          display: "flex",
          position: "relative",
        }}
      >
        {/* 7 puntos azules */}
        {DOTS.map(([cx, cy], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - DOT_D / 2,
              top: cy - DOT_D / 2,
              width: DOT_D,
              height: DOT_D,
              borderRadius: "50%",
              background: "#004FAE",
            }}
          />
        ))}

        {/* Rectángulo blanco (píldora) */}
        <div
          style={{
            position: "absolute",
            left: PILL.x,
            top: PILL.y,
            width: PILL.w,
            height: PILL.h,
            borderRadius: PILL.r,
            background: "#FFFFFF",
          }}
        />
      </div>
    ),
    { width: 180, height: 180 }
  );
}
