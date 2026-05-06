# Inserción de Contenido Educativo — Script

**Última actualización**: 2026-05-06

## Descripción

Script para insertar contenido educativo pre-generado en las tablas `educational_content` y `ejercicios_didacticos` de Supabase.

## Ubicación

```
scripts/insert-educational-content.mjs
```

## Requisitos

1. **Variables de entorno** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Archivos de datos**:
   - `data/educational-content/bloque1.json` a `bloque7.json`, `gafi.json`
   - `data/ejercicios/ejercicios-bloque1.json` a `ejercicios-bloque7.json`, `ejercicios-gafi.json`

3. **Dependencias instaladas**:
   ```bash
   npm install @supabase/supabase-js
   ```

## Uso

### Opción 1: Ejecutar directamente

```bash
node scripts/insert-educational-content.mjs
```

### Opción 2: Con npm (agrega script a package.json)

```json
{
  "scripts": {
    "seed:educational-content": "node scripts/insert-educational-content.mjs"
  }
}
```

Luego:

```bash
npm run seed:educational-content
```

## Estructura de Archivos JSON

### Educational Content

**Archivo**: `data/educational-content/bloqueN.json`

```json
{
  "bloque": 1,
  "tema": "Nombre del bloque",
  "contenido": [
    {
      "subtema": "Subtema específico",
      "tipo": "explicacion|diagrama|mapa_conceptual|fundamento_legal|resumen",
      "orden": 1,
      "contenido": {
        "titulo": "...",
        "descripcion": "...",
        "puntos_clave": [],
        "ejemplos": []
      },
      "fuente_detallada": "LFPIORPI Art. 17, Frac. VI"
    }
  ]
}
```

#### Tipos de Contenido:

- **`explicacion`**: Explicación textual detallada de un concepto
- **`diagrama`**: Representación visual en formato JSON (relaciones, flujos)
- **`mapa_conceptual`**: Estructura jerárquica de conceptos
- **`fundamento_legal`**: Artículos, circulares, disposiciones normativas
- **`resumen`**: Resumen ejecutivo de un tema

#### Estructura `contenido` (JSONB):

```json
{
  "titulo": "Título del contenido",
  "descripcion": "Descripción breve",
  "puntos_clave": ["Punto 1", "Punto 2"],
  "ejemplos": ["Ejemplo 1", "Ejemplo 2"],
  "referencias": ["Referencia 1"],
  // ... otros campos según el tipo
}
```

### Ejercicios

**Archivo**: `data/ejercicios/ejercicios-bloqueN.json`

```json
{
  "bloque": 1,
  "tema": "Nombre del bloque",
  "ejercicios": [
    {
      "titulo": "Título del ejercicio",
      "tipo": "crucigrama|sopa_letras|caso_practico|relacionar|completar|verdadero_falso",
      "dificultad": "basico|medio|avanzado",
      "tiempo_estimado": 10,
      "instrucciones": "Instrucciones claras del ejercicio",
      "contenido": {
        // Estructura específica según el tipo
      },
      "solucion": {
        // Respuestas correctas y explicación
      }
    }
  ]
}
```

#### Tipos de Ejercicios:

| Tipo | Descripción | Tiempo Est. |
|------|-------------|-------------|
| **caso_practico** | Escenario real con preguntas de opción múltiple | 15 min |
| **relacionar** | Emparejar conceptos con definiciones | 8 min |
| **completar** | Llenar espacios en blanco | 10 min |
| **verdadero_falso** | Afirmaciones V/F | 5 min |
| **crucigrama** | Palabras cruzadas con pistas | 20 min |
| **sopa_letras** | Encontrar palabras en matriz | 10 min |

## Ejemplos

Véase:
- `data/educational-content/bloque1.ejemplo.json`
- `data/ejercicios/ejercicios-bloque1.ejemplo.json`

## Operación

El script realiza las siguientes acciones:

1. **Lee archivos JSON** de `data/educational-content/` y `data/ejercicios/`
2. **Valida estructura** de cada archivo
3. **Upsert en BD**: Inserta o actualiza registros si existen
   - **educational_content**: Conflict en `(bloque, subtema, tipo)`
   - **ejercicios_didacticos**: Conflict en `(bloque, titulo)`
4. **Manejo de errores**: Continúa con el siguiente archivo si hay error
5. **Reporte**: Imprime número de registros insertados por archivo

## Output Esperado

```
╔════════════════════════════════════════════════════════════╗
║  Insertor de Contenido Educativo — Certifik PLD           ║
╚════════════════════════════════════════════════════════════╝

📚 Insertando contenido educativo...

✅ bloque1.json: 25 registros insertados
✅ bloque2.json: 18 registros insertados
...

🎯 Insertando ejercicios didácticos...

✅ ejercicios-bloque1.json: 8 ejercicios insertados
✅ ejercicios-bloque2.json: 6 ejercicios insertados
...

╔════════════════════════════════════════════════════════════╗
║  ✅ Inserción completada                                  ║
╚════════════════════════════════════════════════════════════╝
```

## Errores Comunes

### ❌ "NEXT_PUBLIC_SUPABASE_URL no está definido"

**Solución**: Asegúrate de crear `.env.local` con las variables correctas:

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### ❌ "Archivo no encontrado: data/educational-content/bloque1.json"

**Solución**: Crea el archivo con la estructura JSON correcta o copia desde el ejemplo:

```bash
cp data/educational-content/bloque1.ejemplo.json data/educational-content/bloque1.json
```

### ❌ "Error de validación: 'tipo' es requerido"

**Solución**: Verifica que la estructura JSON incluya todos los campos requeridos:

- `bloque` (integer)
- `tema` (string)
- `subtema` (string) — en educational_content
- `tipo` (string) — debe ser válido
- `contenido` (object)
- `fuente_detallada` (string) — opcional

## Rendimiento

- **Batch size**: El script inserta de 1 en 1 (seguro para errores)
- **Velocidad esperada**: ~50-100 registros/segundo
- **Total estimado**: 500 registros → ~5-10 segundos

Para inserción bulk más rápida, modifica el script para usar transacciones.

## Desarrollo Futuro

- [ ] Soporte para CSV y Excel
- [ ] Validación de esquema JSON antes de insertar
- [ ] Dry-run mode (verificar sin insertar)
- [ ] Batch insert para mayor velocidad
- [ ] CLI interactivo con progress bar

---

**Versión**: 1.0  
**Autor**: Certifik PLD Team  
**Fecha**: 2026-05-06
