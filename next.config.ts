import type { NextConfig } from "next";

// ─── HTTP Security Headers ────────────────────────────────────────────────────
// Applied to every response to protect against common web vulnerabilities.
const securityHeaders = [
  // Prevent the page from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control how much referrer info is sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Legacy XSS filter — still respected by some older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Restrict access to browser features not used by this app
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 1 year (only effective once served over HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Basic Content-Security-Policy: block object/embed plugins, restrict framing
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com https://api.anthropic.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],

  // ── Security headers on every route ────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

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
