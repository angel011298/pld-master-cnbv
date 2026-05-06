# Configuración de Sesión Permanente — Supabase

**Fecha**: 2026-05-06  
**Status**: ✅ Implementado en código  
**Acción Manual Requerida**: ⚠️ EN SUPABASE DASHBOARD

## Configuración en Código ✅

La sesión ahora está configurada para **persistir permanentemente** hasta logout manual:

```typescript
// src/lib/supabase.ts
auth: {
  persistSession: true,           // Guardar sesión indefinidamente
  autoRefreshToken: true,         // Refrescar token antes de expirar
  detectSessionInUrl: false,      // No requerimos OAuth callbacks
  storage: browserStorage,        // localStorage como storage principal
  storageKey: "certifik-pld-session",
  flowType: "implicit",
}
```

### Cambios implementados:

1. **Storage simplificado**: localStorage directo (sin cookies de confusión)
2. **Auto-refresh activo**: Tokens se refrescan automáticamente antes de expirar
3. **Clave única**: `certifik-pld-session` para evitar conflictos
4. **No hay timers de logout**: La sesión persiste hasta cierre de sesión manual

## Acción Manual Requerida ⚠️

### En Supabase Dashboard:

1. Ve a: **Authentication → Settings**
2. Busca: **JWT Expiry** (en la sección "JWT")
3. Cambia el valor a: **604800 segundos** (7 días) o mayor

```
JWT Expiry: 604800 (7 days) ← CAMBIAR ESTO
```

**Por qué**: Los tokens JWT tienen una expiración en Supabase. Con `autoRefreshToken: true`, se refrescarán automáticamente, pero si el usuario no toca la app en más de 7 días, será rechazado. Si quieres una sesión realmente infinita, aumenta este valor aún más (ej: 2592000 = 30 días).

### Verificación:

Después de cambiar JWT Expiry:
- Usuario inicia sesión → Token guardado en `localStorage` bajo clave `certifik-pld-session`
- Usuario cierra navegador → Sesión persiste
- Usuario reabre navegador → Sesión recuperada automáticamente
- Usuario está inactivo 7+ días → Token expirará (necesitará login nuevamente)

## Test Rápido

1. Abre DevTools → Application → Storage → Local Storage
2. Busca clave `certifik-pld-session`
3. Cierra navegador
4. Reabre → Clave sigue ahí, sesión restaurada ✅

## Notas Técnicas

- **No hay auto-logout por inactividad** — Solo logout manual o expiración de JWT
- **autoRefreshToken** maneja tokens expirados transparentemente
- **detectSessionInUrl: false** — No necesitamos URL callbacks (más simple)
- **localStorage** es más confiable que cookies para sesiones largas

---

**Configuración completada**: 2026-05-06
