import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL. Configúralo en .env.local (local) o en tu plataforma de deployment (producción)."
    );
  }
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY. Configúralo en .env.local (local) o en tu plataforma de deployment (producción)."
    );
  }
  return key;
}

// Implementación simple y robusta de storage persistente
const browserStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// Variable global para almacenar la instancia única en el cliente (Navegador)
let supabaseClientInstance: SupabaseClient | null = null;

export function supabase() {
  // Si estamos en el lado del servidor (SSR, API Routes), SIEMPRE creamos una
  // nueva instancia para evitar mezclar las sesiones de diferentes usuarios.
  if (typeof window === "undefined") {
    return createClient(getSupabaseUrl(), getAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // Si estamos en el navegador (Cliente), reutilizamos la misma instancia siempre
  // para prevenir fugas de memoria y bucles de eventos.
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: {
        // PERSISTENCIA PERMANENTE: localStorage indefinido hasta logout manual
        persistSession: true,
        // Auto-refresh de tokens antes de que expiren
        autoRefreshToken: true,
        // PKCE maneja el code en la query string — el callback lo intercambia
        // explícitamente con exchangeCodeForSession(), no con hash detection
        detectSessionInUrl: false,
        // Storage directo en localStorage para máxima persistencia
        storage: browserStorage,
        // Clave de almacenamiento estándar
        storageKey: "certifik-pld-session",
        // PKCE: flujo recomendado por Supabase para Next.js. Más robusto que
        // implicit: los tokens nunca van en el hash (#), van como ?code= en la
        // query, se intercambian explícitamente en /auth/callback, y el
        // refresh_token se almacena correctamente en localStorage.
        flowType: "pkce",
      },
    });
  }

  return supabaseClientInstance;
}

export function supabaseAdmin() {
  const url = getSupabaseUrl();
  const anon = getAnonKey();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || anon;
  return createClient(url, service);
}
