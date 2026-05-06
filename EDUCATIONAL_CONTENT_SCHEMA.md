# Schema: Contenido Educativo Pre-generado

**Fecha**: 2026-05-06  
**Status**: ✅ Tablas creadas en Supabase  
**Project**: xuwestiepwhlbdnwyblb (PLD-Master-V0)

## Tablas Creadas

### 1. `public.educational_content`

Almacena contenido educativo estructurado por bloque y tema.

#### Estructura:

```sql
CREATE TABLE public.educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque int NOT NULL,                   -- 1-7
  tema text NOT NULL,                    -- nombre del bloque
  subtema text NOT NULL,                 -- subtema específico
  tipo text NOT NULL,                    -- 'explicacion' | 'diagrama' | 'mapa_conceptual' | 'fundamento_legal' | 'resumen'
  contenido jsonb NOT NULL,              -- contenido estructurado
  fuente_detallada text,                 -- cita exacta (Art., Rec., etc.)
  orden int DEFAULT 0,                   -- orden de presentación
  created_at timestamptz DEFAULT now()
);
```

#### Columnas:

| Columna | Tipo | Requerido | Default | Propósito |
|---------|------|-----------|---------|-----------|
| `id` | uuid | ✅ | `gen_random_uuid()` | ID único |
| `bloque` | integer | ✅ | — | Número de bloque (1-7) |
| `tema` | text | ✅ | — | Nombre del bloque/tema |
| `subtema` | text | ✅ | — | Subtema específico |
| `tipo` | text | ✅ | — | Tipo de contenido |
| `contenido` | jsonb | ✅ | — | Estructura del contenido |
| `fuente_detallada` | text | ❌ | NULL | Referencia normativa exacta |
| `orden` | integer | ❌ | `0` | Orden de presentación |
| `created_at` | timestamptz | ❌ | `now()` | Timestamp de creación |

#### Índices:

- `idx_edcont_bloque` — Para búsquedas por bloque
- `idx_edcont_tipo` — Para búsquedas por tipo de contenido

#### RLS:

- `Lectura pública educational_content` — SELECT permitido para todos

---

### 2. `public.ejercicios_didacticos`

Almacena ejercicios y actividades didácticas con soluciones.

#### Estructura:

```sql
CREATE TABLE public.ejercicios_didacticos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque int NOT NULL,                   -- 1-7
  tema text NOT NULL,                    -- nombre del bloque
  tipo text NOT NULL,                    -- 'crucigrama' | 'sopa_letras' | 'caso_practico' | 'relacionar' | 'completar'
  titulo text NOT NULL,                  -- título del ejercicio
  instrucciones text NOT NULL,           -- instrucciones claras
  contenido jsonb NOT NULL,              -- estructura del ejercicio
  solucion jsonb NOT NULL,               -- respuestas correctas
  dificultad text DEFAULT 'medio',       -- 'basico' | 'medio' | 'avanzado'
  tiempo_estimado int DEFAULT 10,        -- minutos
  created_at timestamptz DEFAULT now()
);
```

#### Columnas:

| Columna | Tipo | Requerido | Default | Propósito |
|---------|------|-----------|---------|-----------|
| `id` | uuid | ✅ | `gen_random_uuid()` | ID único |
| `bloque` | integer | ✅ | — | Número de bloque (1-7) |
| `tema` | text | ✅ | — | Nombre del bloque/tema |
| `tipo` | text | ✅ | — | Tipo de ejercicio |
| `titulo` | text | ✅ | — | Título del ejercicio |
| `instrucciones` | text | ✅ | — | Instrucciones de ejecución |
| `contenido` | jsonb | ✅ | — | Estructura del ejercicio |
| `solucion` | jsonb | ✅ | — | Respuestas correctas |
| `dificultad` | text | ❌ | `'medio'` | Nivel de dificultad |
| `tiempo_estimado` | integer | ❌ | `10` | Tiempo en minutos |
| `created_at` | timestamptz | ❌ | `now()` | Timestamp de creación |

#### Índices:

- `idx_ejercicios_bloque` — Para búsquedas por bloque
- `idx_ejercicios_tipo` — Para búsquedas por tipo de ejercicio

#### RLS:

- `Lectura pública ejercicios_didacticos` — SELECT permitido para todos

---

## Ejemplos de Contenido

### Educational Content (JSON)

```json
{
  "titulo": "Identificación de Clientes",
  "descripcion": "Proceso de identificación según LFPIORPI Art. 18",
  "puntos_clave": [
    "Documento de identidad válido",
    "Verificación de origen de fondos",
    "Actualización periódica de datos"
  ],
  "normativa": "LFPIORPI Art. 18"
}
```

### Ejercicios Didácticos (JSON)

#### Caso Práctico:

```json
{
  "escenario": "Un cliente deposita 50,000 USD en efectivo sin justificación",
  "pregunta": "¿Cuál es la acción inmediata?",
  "opciones": [
    "Rechazar la operación y reportar",
    "Aceptar y registrar",
    "Solicitar comprobante de origen"
  ],
  "respuesta_correcta": 0,
  "explicacion": "Según GAFI Rec. 10, se requiere verificación de origen"
}
```

#### Crucigrama:

```json
{
  "pistas_horizontal": [
    { "numero": 1, "pista": "Art. 17 LFPIORPI" },
    { "numero": 3, "pista": "Comité internacional sobre PLD" }
  ],
  "pistas_vertical": [
    { "numero": 1, "pista": "Operación sospechosa" }
  ],
  "soluciones": {
    "1_h": "REPORTES",
    "3_h": "GAFI",
    "1_v": "REPORTE"
  }
}
```

---

## Migración en Código

Las migraciones se aplicaron a través de Supabase MCP:

```
Migration 1: create_educational_content_table ✅
Migration 2: create_ejercicios_didacticos_table ✅
```

---

## Usos Principales

1. **Carga de contenido preparado**: Scripts pueden insertar contenido bulk
2. **API de educación**: `/api/educational-content` para recuperar material
3. **Ejercicios interactivos**: UI puede renderizar ejercicios desde BD
4. **Búsqueda por tema**: Filtrar por `bloque`, `tema`, `tipo`
5. **Progreso del usuario**: Futuro: tabla de `user_exercise_results`

---

**Creado**: 2026-05-06  
**Status**: Production-ready
