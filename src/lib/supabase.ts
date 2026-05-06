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

// Storage key derived from project ref (parte del hostname de Supabase)
function getStorageKey() {
  try {
    const url = new URL(getSupabaseUrl());
    const ref = url.hostname.split(".")[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return "sb-auth-token";
  }
}

// Storage adapter: localStorage primario + cookie de respaldo (para middleware SSR).
// La cookie se setea con max-age muy alto (1 año) para que sobreviva al cierre del navegador.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

function makeBrowserStorage() {
  if (typeof window === "undefined") return undefined;

  const setCookie = (name: string, value: string) => {
    try {
      // Encode para evitar problemas con caracteres especiales en cookies
      const encoded = encodeURIComponent(value);
      // Cookies tienen un límite de tamaño (~4 KB). Si la cookie es muy grande,
      // no la setamos — localStorage seguirá funcionando para el cliente.
      if (encoded.length > 3500) return;
      document.cookie = `${name}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${
        window.location.protocol === "https:" ? "; Secure" : ""
      }`;
    } catch {
      // ignore
    }
  };

  const removeCookie = (name: string) => {
    try {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  return {
    getItem: (key: string): string | null => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore
      }
      // También en cookie para que el middleware SSR pueda leerla
      setCookie(key, value);
    },
    removeItem: (key: string): void => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      removeCookie(key);
    },
  };
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
        // Persistencia indefinida hasta logout manual
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // localStorage + cookie de respaldo para SSR
        storage: makeBrowserStorage(),
        storageKey: getStorageKey(),
        // Flujo implícito (default) — más simple, no requiere /auth/callback
        flowType: "implicit",
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
