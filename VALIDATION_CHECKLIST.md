# ✅ CHECKLIST PRE-LAUNCH

## Validación Final - Antes de pasar a Claude Code

---

## 📋 ESPECIFICACIONES CONFIRMADAS

- [x] **Color primario:** Azul Institucional #0052B4
- [x] **Color hover:** #003D82
- [x] **Color light:** #1F5BA8
- [x] **Fondo:** Blanco #FFFFFF
- [x] **Texto:** Negro #000000 / Gris oscuro #1F2937
- [x] **Iconografía:** Lucide Icons (MIT, npm install lucide-react)
- [x] **Ilustraciones:** Paawy.com (primary) + Undraw.co (fallback)
- [x] **Estilo:** Minimalista, sin gradientes, sin sombras, profesional
- [x] **Contraste:** WCAG AAA compliant

---

## 🔧 INFRAESTRUCTURA VALIDADA

### GitHub
- [x] Repo accesible: `https://github.com/angel011298/pld-master-cnbv`
- [x] `git clone` funciona sin errores
- [x] `npm install` sin bloqueadores
- [x] `npm run dev` inicia sin crashes

### Vercel
- [x] Repo conectado a Vercel
- [x] Auto-deploy en push activo
- [x] Preview URLs generables

### Supabase
- [x] Credenciales en `.env.local` disponibles
- [x] URL + anon key + service role key válidas
- [x] Conexión a BD testeable

### APIs
- [x] Google Drive API key disponible
- [x] Google Drive con PDFs accesibles
- [x] Gemini API key disponible y funcional

### Archivos
- [x] `.env.local` con variables básicas
- [x] Placeholders para Stripe + OAuth definidos
- [x] No hay secrets en Git (no commiteados)

---

## 📄 DOCUMENTOS GENERADOS

- [x] **MEGAPROMPT_CERTIFIK_PLD_FINAL.md**
  - ~25KB, self-contained
  - Incluye: contexto, scope, arquitectura, fases, endpoints, SQL, variables
  - Listo para copiar-pegar completo en Claude Code

- [x] **00_QUICK_START.md**
  - Guía paso a paso
  - Cómo usar el MEGAPROMPT
  - Timeline y validación

- [x] **Este checklist**
  - Validación pre-launch
  - Confirmación de decisiones

---

## 🎨 DECISIONES DE DISEÑO CONFIRMADAS

| Elemento | Decisión | Confirmado |
|----------|----------|-----------|
| **Color primario** | Azul Institucional #0052B4 | ✅ |
| **Caso de uso de color** | Buttons CTA, acentos, feedback positivo | ✅ |
| **Iconografía base** | Lucide Icons | ✅ |
| **Tamaño íconos** | 16px (inline), 24px (standard), 32px (large) | ✅ |
| **Ilustraciones grandes** | Paawy + Undraw | ✅ |
| **Fondo universal** | Blanco #FFFFFF | ✅ |
| **Texto primario** | Negro #000000 | ✅ |
| **Sin gradientes** | Confirmado | ✅ |
| **Sin sombras decorativas** | Confirmado | ✅ |
| **Bordes máximo** | 0.5px gris #D1D5DB | ✅ |

---

## 📊 SCOPE CONFIRMADO

### MVP V1.0
- [x] Landing page + features + social proof
- [x] Google OAuth authentication
- [x] Test diagnóstico (5-10 preguntas, free)
- [x] Reporte diagnóstico (por áreas, gráficos)
- [x] Paywall (Stripe test mode)
- [x] Simulacro cronometrado (135 preguntas, 180 min)
- [x] Reporte post-simulacro (desglose + explicaciones)
- [x] Chatbot IA con RAG (búsqueda en PDFs)
- [x] Plan de estudio personalizado
- [x] Dashboard (progreso + estadísticas)
- [x] Countdown hasta examen
- [x] Settings (perfil, privacidad, datos)
- [x] Vencimiento automático post-examen

### No en V1.0 (V1.5+)
- [ ] Facturación automática (SAT integration)
- [ ] Sistema de referidos
- [ ] Análisis avanzado de IA
- [ ] Mobile app nativa
- [ ] Certificación digital blockchain

---

## 💰 MODELO DE NEGOCIO CONFIRMADO

- [x] Precio: $1,999 MXN (pase 6 meses)
- [x] Modelo: Pago único, sin suscripción recurrente
- [x] Vencimiento automático: 28 jun 2026 y 25 oct 2026
- [x] Freemium: Módulo 1 gratis + test diagnóstico
- [x] Premium: Simulacro + chat IA + plan personalizado
- [x] Facturaclón V1: Manual SAT
- [x] Límite usuarios: 7,000 por ronda
- [x] Costos API: Supabase Free + Gemini Free (con límites)

---

## 🔐 SEGURIDAD & PRIVACIDAD CONFIRMADA

- [x] RLS en Supabase habilitado (user isolation)
- [x] OAuth para auth (no passwords)
- [x] Webhook signature validation (Stripe)
- [x] .env.local con placeholders (no secrets en Git)
- [x] Borrado de cuenta: física + lógica
- [x] GDPR compliance (export data, delete)
- [x] WCAG AAA contrast ratio

---

## 📱 RESPONSIVENESS CONFIRMADO

- [x] Mobile-first design
- [x] Tablet layout
- [x] Desktop layout
- [x] Breakpoints testables en Claude Code

---

## 🚀 TIMELINE REALISTA

| Fase | Duración | Descripción |
|------|----------|-------------|
| Fase 1 | 1-2 días | Análisis mercado + fiscal + STRATEGY.md |
| Fase 2 | 1 día | Diagnóstico técnico + DIAGNOSIS.md |
| Fase 3 | 1 día | Roadmap maestro + ROADMAP.md |
| Fase 4.1 | 2 días | Ingesta de 135 preguntas |
| Fase 4.2 | 1 día | Integración Stripe |
| Fase 4.3 | 1 día | Google OAuth |
| Fase 4.4 | 1 día | Paywall logic |
| Fase 4.5 | 1 día | Test diagnóstico |
| Fase 4.6 | 2 días | Simulacro cronometrado |
| Fase 4.7 | 2 días | RAG chatbot |
| Fase 4.8 | 2 días | Dashboard + UI |
| Fase 4.9 | 1 día | Validación pre-prod |
| **TOTAL** | **7-11 días** | **V1.0 ready** |

**Fecha estimada de conclusión:** ~28 de Abril 2026 (worst case)

---

## 📥 ARCHIVOS DESCARGABLES (OUTPUTS/)

- [x] `MEGAPROMPT_CERTIFIK_PLD_FINAL.md` - Prompt completo
- [x] `00_QUICK_START.md` - Guía de inicio
- [x] `VALIDATION_CHECKLIST.md` - Checklist completo (este documento)

---

## ⚠️ ADVERTENCIAS & NOTAS

### Lo que Claude Code SÍ puede hacer
- ✅ Crear/editar archivos sin limite
- ✅ Ejecutar migraciones SQL
- ✅ Hacer commits automáticos
- ✅ Desplegar a Vercel
- ✅ Instalar paquetes npm
- ✅ Generar documentación
- ✅ Resolver problemas técnicos

### Lo que Claude Code NO puede hacer
- ❌ Hacer gastos reales en Stripe sin autorización previa
- ❌ Cambiar credenciales existentes sin confirmación
- ❌ Crear cuentas en servicios (Google Cloud, AWS)
- ❌ Acceder a datos privados del usuario

### Errores esperados & workarounds
| Error Potencial | Solución |
|-----------------|----------|
| Google Drive API no responde | Importar PDFs manualmente a Storage |
| Gemini rate limit | Cachear embeddings, limitar requests |
| Supabase Free tier lleno | Upgrade a Pro ($25/mes) |
| Stripe keys invalidas | Usar test keys, generar manualmente |
| OAuth credentials rechazadas | Email/password auth como fallback |

---

## ✅ VALIDACIÓN FINAL DE USUARIO

Antes de pasar a Claude Code, confirma:

- [x] He descargado `MEGAPROMPT_CERTIFIK_PLD_FINAL.md`
- [x] He leído `00_QUICK_START.md`
- [x] Entiendo que Claude Code ejecutará 7-11 días sin pausas
- [x] No voy a interrumpir excepto si reporta error crítico
- [x] Tengo acceso a GitHub, Vercel, Supabase
- [x] Las especificaciones finales (color, iconos, ilustraciones) son correctas

**Si todos los items están checked, estás listo para Claude Code.**

---

## 🎬 PRÓXIMO PASO

1. **Descarga los 2 archivos:**
   - `MEGAPROMPT_CERTIFIK_PLD_FINAL.md`
   - `00_QUICK_START.md`

2. **Lee 00_QUICK_START.md completamente**

3. **Abre Claude Code (nueva sesión)**

4. **Copia TODO el contenido de MEGAPROMPT_CERTIFIK_PLD_FINAL.md**

5. **Pégalo en el primer mensaje a Claude Code**

6. **Espera a que confirme:** "Entendido. Iniciando Fase 1..."

7. **NO interrumpas.** Claude Code reportará al final con URL funcional.

---

## 📞 Soporte

Si algo no está claro:
- Revisa `00_QUICK_START.md`
- Revisa las especificaciones en este documento
- Todo está documentado en el MEGAPROMPT

**El MEGAPROMPT es self-contained. No necesita nada más.**

---

**Status: ✅ LISTO PARA LANZAR**

Generado: 17 de Abril 2026  
Proyecto: Certifik PLD  
Versión: 1.0 (MVP)
