# ROADMAP DE LANZAMIENTO: CERTIFIK PLD (V1.0)

## FASE 1: Infraestructura de Monetización (Backend)
**Asignado a:** Humano + Gemini (Ahorro de hits)
- [ ] Ejecutar migración SQL en Supabase para agregar columnas `tier` (free/premium) y `stripe_customer_id` en `users_profile`.
- [ ] Crear endpoint `/api/checkout` para generar links de pago.
- [ ] Crear endpoint `/api/webhook` para escuchar a Stripe y actualizar la base de datos automáticamente.
- [ ] Configurar variables de entorno de Stripe en `.env.local` y Vercel.

## FASE 2: Barreras de Acceso y Onboarding (Frontend)
**Asignado a:** Claude Code (Uso intensivo de React/Tailwind)
- [ ] Crear el flujo de Onboarding (`/onboarding`): Bienvenida -> Selección de Fecha -> Redirección.
- [ ] Implementar el "Paywall" en `QuizSimulator.tsx`: Bloquear acceso a módulos avanzados si `user.tier === 'free'`.
- [ ] Agregar botones de "Hazte Premium" en el Dashboard que llamen a `/api/checkout`.

## FASE 3: Facturación CFDI 4.0 (SW Sapien)
**Asignado a:** Humano + Gemini (Ahorro de hits)
- [ ] Crear formulario UI estático de datos fiscales.
- [ ] Crear servicio `/src/lib/sw-sapien.ts` y endpoint `/api/invoice` para timbrar pagos exitosos.

## FASE 4: Despliegue a Producción
**Asignado a:** Humano
- [ ] Sincronizar llaves finales en Vercel.
- [ ] `npx vercel deploy --prod --yes`.
- [ ] Pruebas en vivo.
