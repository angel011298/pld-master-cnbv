import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL. Configúralo en .env.local (local) o en Vercel (producción)."
    );
  }
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY. Configúralo en .env.local (local) o en Vercel (producción)."
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
    return createClient(getSupabaseUrl(), getAnonKey());
  }

  // Si estamos en el navegador (Cliente), reutilizamos la misma instancia siempre
  // para prevenir fugas de memoria y bucles de eventos.
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(getSupabaseUrl(), getAnonKey());
  }
  
  return supabaseClientInstance;
}

export function supabaseAdmin() {
  const url = getSupabaseUrl();
  const anon = getAnonKey();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || anon;
  return createClient(url, service);
}