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
        // Detectar sesiones en URL — permite recuperar sesiones de OAuth redirects
        // y fragmentos de hash automáticamente al cargar la página
        detectSessionInUrl: true,
        // Storage directo en window.localStorage para máxima persistencia y
        // lectura síncrona al inicializar el cliente
        storage: window.localStorage,
        // Clave de almacenamiento — compatible con sesiones existentes
        storageKey: "certifik-pld-session",
        // PKCE: flujo seguro recomendado por Supabase para Next.js.
        // Los tokens van como ?code= en la query, se intercambian en /auth/callback.
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
