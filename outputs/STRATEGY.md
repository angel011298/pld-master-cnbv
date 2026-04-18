# STRATEGY.md — Certifik PLD

> Fecha: Abril 2026 | Fase 1: Validación de Mercado, Precio y Proyección Fiscal

---

## Resumen Ejecutivo

| Indicador | Valor |
|---|---|
| Mercado objetivo | Candidatos certificación CNBV PLD/FT México |
| Tamaño de mercado (prep courses) | ~$6M MXN/año (TAM) |
| Precio validado | **$1,999 MXN** (con espacio hasta $2,499) |
| Break-even | ~8–10 clientes |
| Proyección 6 meses | 50–100 usuarios → $70k–$140k MXN netos |
| Proyección 12 meses | 100–200 usuarios → $140k–$280k MXN netos |
| Régimen fiscal recomendado | RESICO (personas físicas) |
| Timing | 2026 es año de demanda represada (sin examen en 2025) |

**Conclusión:** El mercado existe, está mal servido en el segmento digital accesible, el precio de $1,999 MXN está estratégicamente posicionado, y 2026 ofrece una ventana de oportunidad excepcional. El proyecto es viable desde el primer mes si se consiguen 8–10 clientes.

---

## 1. Análisis de Mercado

### Oportunidad validada

La CNBV organiza 2 exámenes anuales (junio y octubre) con **1,500 cupos cada uno = 3,000 plazas/año**. El examen oficial cuesta **$17,965 MXN**. Candidatos son Oficiales de Cumplimiento, auditores y profesionales de entidades supervisadas. La certificación dura 5 años y es **legalmente obligatoria**.

**Factor 2026 crítico:** No hubo examen en 2025 (UIF/CNBV canceló convocatoria). Los candidatos de 2025 se acumulan en 2026 → sobre-demanda potencial de los 3,000 cupos. Los proveedores de cursos estarán saturados. Es el mejor momento para lanzar.

### Posición competitiva

El mercado tiene una brecha estructural:

```
Bajo costo                          Alto costo
    |                                   |
CHECK ($535)    [VACÍO $1,500-$3,000]  Grant Thornton ($16,240)
 Solo libro     ← Certifik PLD aquí →  Consulting firms / Diplomados
```

Certifik PLD entra en la **zona de precio sin competencia digital clara**: más completo que un libro, 8–12x más barato que consultoría.

### Diferenciadores clave

1. Precio transparente y accesible ($1,999 vs $14,000–$25,000 de competencia premium)
2. Plataforma 100% digital, acceso inmediato 24/7
3. Simuladores interactivos actualizados con convocatoria 2026
4. Sin necesidad de esperar fechas de inicio (autogestionado)
5. Contenido gamificado (ningún competidor lo ofrece)

---

## 2. Modelo Financiero

### Supuestos del modelo

| Parámetro | Valor |
|---|---|
| Precio venta (IVA incluido) | $1,999 MXN |
| Precio neto (antes IVA) | $1,723 MXN ($1,999 / 1.16) |
| IVA a remitir al SAT | $276 MXN por venta |
| ISR bajo RESICO | 2.5% sobre ingresos netos = ~$43 MXN |
| Ingreso neto por cliente | ~$1,680 MXN |
| Costos fijos mensuales | ~$1,000 MXN (~$60 USD) |
| Costos fijos anuales | ~$12,000 MXN |

### Ingresos proyectados

| Escenario | Clientes 6 meses | Ingresos brutos | -IVA | -RESICO ISR | -Costos op. | **Neto estimado** |
|---|---|---|---|---|---|---|
| Pesimista | 30 | $59,970 | -$8,277 | -$1,299 | -$6,000 | **~$44,394** |
| Base | 75 | $149,925 | -$20,694 | -$3,248 | -$6,000 | **~$119,983** |
| Optimista | 150 | $299,850 | -$41,387 | -$6,496 | -$6,000 | **~$245,967** |

| Escenario | Clientes 12 meses | **Neto año 1** |
|---|---|---|
| Pesimista | 50 | **~$72,000** |
| Base | 150 | **~$238,000** |
| Optimista | 300 | **~$476,000** |

> Nota: Estos cálculos asumen régimen RESICO (ISR 2.5% sobre ingresos netos). Consultar con contador para optimización fiscal específica.

### Break-even analysis

```
Costos fijos anuales: ~$12,000 MXN
Ingreso neto por cliente: ~$1,680 MXN
Break-even: 12,000 / 1,680 = ~7.1 clientes

→ Break-even en aproximadamente 8 clientes
→ Viable desde el primer mes de operación real
```

### Costos operacionales detallados

| Servicio | Costo mensual (USD) | Costo mensual (MXN ~$17/USD) |
|---|---|---|
| Supabase Pro (si Free se satura) | $25 | ~$425 |
| Vercel (si tráfico crece) | $0–$50 | $0–$850 |
| Google Workspace (email profesional) | $6 | ~$102 |
| Dominio + SSL | ~$1 | ~$17 |
| **Total mensual estimado** | **$32–$82** | **~$544–$1,394** |

**En fase inicial (Free tiers):** costos pueden ser $0–$150 MXN/mes, haciendo el break-even aún más fácil.

---

## 3. Estructura Fiscal Recomendada

### Opción A — RESICO (Recomendada para inicio)

**Para personas físicas con ingresos < $3.5M MXN/año**

```
Régimen: Simplificado de Confianza (RESICO)
ISR: 1% a 2.5% sobre ingresos netos (escala progresiva)
IVA: 16% (se cobra al cliente, se remite mensualmente al SAT)
Declaración anual: No obligatoria en RESICO 2026 (pagos mensuales definitivos)
```

**¿Por qué RESICO?**
- ISR ultra-bajo (2.5% vs 30% en régimen general)
- Administración simplificada: facturas electrónicas + pago mensual, listo
- Ideal para ingresos de $200k–$3.5M MXN/año
- Perfecto para SaaS/plataformas digitales si quien lo opera es persona física

**Proceso de alta:**
1. Tener RFC activo (persona física)
2. Solicitar cambio/alta en RESICO en SAT en línea
3. Emitir CFDIs (facturas) por cada venta
4. Pago mensual de IVA + ISR RESICO en IDSE/portal SAT

### Opción B — Régimen General de Personas Físicas con Actividad Empresarial

**Si ingresos superan $3.5M MXN/año o si RESICO no aplica**

```
ISR: Tabla progresiva (hasta 35%)
IVA: 16% (igual)
Requiere: Contador externo, declaraciones mensuales detalladas, PTU si hay empleados
```

### Opción C — Persona Moral (SA de CV / SAPI / SRL)

**Para etapas avanzadas (>$1M MXN ingresos/año, busca inversión, o tiene socios)**

```
ISR: 30% sobre utilidad fiscal
IVA: 16%
Ventajas: Separación de patrimonio personal, atractivo para inversores, escalable
Requiere: Notaría, contador, actas constitutivas, más costo administrativo
```

**Recomendación para Fase 1:** Iniciar como **persona física en RESICO**. Transicionar a persona moral cuando ingresos superen $1M MXN o cuando se busque inversión externa.

### Obligaciones fiscales clave (RESICO)

| Obligación | Frecuencia | Herramienta |
|---|---|---|
| Emitir CFDI por cada venta | Por venta | SAT / facturadora electrónica |
| Pago ISR RESICO | Mensual | Portal SAT |
| Pago IVA | Mensual | Portal SAT |
| DIOT (operaciones con terceros) | Mensual | Portal SAT |
| Declaración anual | No obligatoria en RESICO 2026 | — |

### Timeline de formalización

```
Semana 1: Validar RFC activo y régimen actual con SAT en línea
Semana 2: Alta en RESICO si no está (o verificar que ya aplica)
Semana 3: Contratar facturadora electrónica (ej. Facturama, Contpaqi, SAT gratuito)
Mes 2: Primera venta → primera factura → primer pago SAT
Mes 6: Revisar con contador si RESICO sigue siendo óptimo
```

---

## 4. Go-to-Market — Primeros 30 días

### Semana 1: Pre-launch / Alpha cerrado (Días 1–7)

**Objetivo:** Validar que todo funciona antes de abrir al público.

```
Acciones:
├─ Reclutar 5–10 beta testers (contactos directos: compliance officers, contadores)
├─ Validar flujo completo: registro → pago → acceso → simulador → resultado
├─ Corregir bugs críticos
├─ Obtener 3–5 testimonios escritos
└─ Preparar página de inicio con testimonios reales
```

**KPIs semana 1:** 0 bugs críticos en pago/acceso, al menos 3 testimonios positivos.

### Semana 2–3: Soft Launch (Días 8–21)

**Objetivo:** Primeras 30–50 ventas, construir reputación.

```
Acciones:
├─ Activar página pública con precio visible ($1,999 MXN)
├─ Publicar en LinkedIn (perfil personal + empresa) con casos de éxito beta
├─ Post en grupos de WhatsApp/Telegram de compliance en México
├─ Contactar a los cursos del sector (iProfi, 360Educa) para alianzas o alternativas
├─ Configurar Google Analytics + Hotjar para seguimiento
└─ Responder a cada comprador personalmente (onboarding manual)
```

**KPIs semana 2–3:** 20–50 registros, tasa de conversión >10% del tráfico a página de pago.

### Semana 4: Full Launch (Días 22–30)

**Objetivo:** Abrir a público general, escalar adquisición.

```
Acciones:
├─ Activar Google Ads con presupuesto bajo ($3,000–$5,000 MXN/mes)
│  └─ Keywords: "preparación examen CNBV", "certificación PLD FT México", "curso oficial cumplimiento"
├─ Lanzar programa de referidos ($200 MXN por referido exitoso)
├─ Crear contenido: video demo de 2 min en YouTube/LinkedIn
├─ Publicar en redes: IG Stories, LinkedIn posts semanales
└─ Meta: cerrar el primer mes con 50–75 usuarios
```

**KPIs mes 1:** 50+ usuarios pagos, CPA < $400 MXN, NPS > 8/10.

### Canales de adquisición (prioridad)

| Canal | Costo | Tiempo para resultado | Prioridad |
|---|---|---|---|
| LinkedIn orgánico (posts + outreach) | $0 | 1–2 semanas | Alta |
| WhatsApp groups compliance | $0 | 1 semana | Alta |
| Referidos (programa) | ~$200/referido | 2–4 semanas | Alta |
| Google Ads (búsqueda) | $3,000–5,000/mes | 1–3 días | Media |
| SEO (blog + contenido) | $0 | 3–6 meses | Baja (largo plazo) |
| Instagram/TikTok | $0 | 2–4 semanas | Baja |

### Métricas de éxito (KPIs de lanzamiento)

| Métrica | Meta mes 1 | Meta mes 3 | Meta mes 6 |
|---|---|---|---|
| Usuarios registrados (pagos) | 50 | 100 | 200 |
| Tasa conversión (landing → pago) | >8% | >12% | >15% |
| NPS | >7 | >8 | >8.5 |
| Tasa de completación del curso | >60% | >70% | >75% |
| Ingreso bruto mensual | $100k MXN | $120k MXN | $150k MXN |
| CPA (costo por adquisición) | <$400 MXN | <$300 MXN | <$250 MXN |

---

## 5. Validación de Precio — ¿$1,999 o subir a $2,499?

### Argumento para mantener $1,999

- Psicológicamente: "menos de $2,000" es una barrera mental importante en México
- Posicionamiento claro como opción accesible vs. firma consultora
- Maximiza volumen para social proof rápido (reviews, testimonios)
- Primer año = construir reputación; no maximizar margen

### Argumento para subir a $2,499

- Solo $500 de diferencia (25%) pero +25% de ingreso por cliente
- El examen oficial cuesta $17,965 → incluso $2,499 es el 13.9% del gasto total
- Señal de calidad: muy barato puede generar desconfianza en B2B

### Recomendación

**Estrategia de precio escalonada:**

```
Fase 1 (primer mes): $1,499 MXN "precio de lanzamiento" → crear urgencia
Fase 2 (meses 2–4): $1,999 MXN precio estándar
Fase 3 (post-50 testimonios): $2,499 MXN precio regular
                            + $1,999 si el candidato llega via referido
```

Esto permite:
1. Impulso inicial (precio bajo crea adopción rápida)
2. Anclaje psicológico: "$1,999 era $2,499" = percepción de ahorro
3. Monetización progresiva conforme crece la reputación

---

## 6. Riesgos y Contingencias

| Riesgo | Probabilidad | Impacto | Plan B |
|---|---|---|---|
| CNBV modifica temario antes de junio | Media | Alto | Monitorear convocatoria; actualizar contenido en <1 semana |
| Cupos CNBV 2026 se agotan rápido (demanda represada) | Media | Bajo | Posicionarse para octubre + 2027 |
| Competidor baja precio agresivamente | Baja | Medio | Enfocarse en UX y resultados probados |
| Fallas técnicas en período de alto tráfico | Baja | Alto | Tests de carga previos, Supabase Pro |
| Poca tracción inicial | Media | Medio | Beta cerrada para construir base de testimonios primero |

---

## 7. Visión a 12 Meses

### Hitos clave

```
Mes 1: 50 usuarios, primeros testimonios, 0 bugs críticos
Mes 3: 100 usuarios, primer ciclo de mejoras del producto, lanzar blog SEO
Mes 5: 150 usuarios, preparación para examen de junio 2026
Mes 6: Resultados del examen de junio → tasa de aprobación de usuarios = principal KPI
Mes 8: Preparación para examen de octubre 2026
Mes 12: 200+ usuarios, explorar modalidad B2B corporativo
```

### Métricas que importan (más allá del dinero)

- **Tasa de aprobación** de candidatos que usaron Certifik vs. candidatos que no: el KPI definitivo
- Si usuarios aprueban en mayor proporción → marketing de boca en boca imparable
- Una tasa de aprobación del 80%+ (vs. media del mercado ~60%) = moat competitivo real

---

## Conclusión

Certifik PLD llega al momento correcto (año de demanda represada), con el precio correcto (zona sin competencia), en el formato correcto (digital, accesible, interactivo). El riesgo financiero es mínimo (break-even en 8 clientes), la estructura fiscal es favorable (RESICO al 2.5%), y el upside es significativo (>$200k MXN netos en año 1 en escenario base).

**Próximo paso inmediato:** Beta cerrado con 5–10 usuarios antes del lanzamiento público.

---

*Estrategia elaborada con base en investigación de mercado abril 2026. Datos fiscales referenciales; consultar contador para situación específica.*
