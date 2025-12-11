# Guía de Configuración de Base de Datos - Document Analyzer

## 📋 Overview

Esta guía te ayudará a configurar completamente la base de datos de Supabase para Document Analyzer. El sistema incluye 15 tablas optimizadas con seguridad, auditoría y métricas de rendimiento.

## 🚀 Configuración Automática (Recomendada)

Ya ejecutaste el script de configuración automática que instaló todas las dependencias necesarias. Ahora solo necesitas ejecutar el schema SQL manualmente en Supabase.

## 🗄️ Paso 1: Ejecutar Schema SQL en Supabase

### 1.1 Accede al Dashboard de Supabase
```
📂 URL: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm
```

### 1.2 Abre el SQL Editor
1. En el menú lateral, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"** para crear una nueva consulta

### 1.3 Copia y Pega el Schema
1. Abre el archivo: `database/supabase-schema.sql`
2. Copia todo el contenido (598 líneas)
3. Pégalo en el SQL Editor

### 1.4 Ejecuta el Schema
1. Haz clic en **"Run"** o presiona `Ctrl+Enter`
2. Espera a que se completen todas las operaciones
3. Verifica que no haya errores en la consola

## 📊 Estructura de Base de Datos Creada

### 👥 Tablas de Usuarios
- **`profiles`** - Perfiles extendidos con roles y suscripciones
- **`user_api_configs`** - Configuraciones encriptadas de APIs

### 📄 Tablas de Documentos
- **`documents`** - Metadatos y almacenamiento de archivos
- **`document_analyses`** - Análisis realizados a documentos
- **`analysis_results_basic`** - Resultados básicos de análisis
- **`analysis_results_advanced`** - Resultados avanzados
- **`analysis_results_ai`** - Resultados de análisis con IA

### 🔍 Tablas de OCR
- **`ocr_processes`** - Procesamientos OCR con seguimiento
- **`ocr_results`** - Resultados detallados por página
- **`document_conversions`** - Conversiones a diferentes formatos

### 🤖 Tablas de IA
- **`ai_model_metrics`** - Registro de uso y rendimiento de modelos
- **`model_optimization_history`** - Historial de optimizaciones
- **`usage_statistics`** - Estadísticas agregadas por usuario

### 📦 Tablas de Batch Processing
- **`batch_jobs`** - Trabajos por lotes con seguimiento
- **`batch_job_files`** - Archivos individuales en lotes

### 🔍 Tablas de Auditoría
- **`audit_logs`** - Registro completo de auditoría
- **`error_logs`** - Logs de errores del sistema
- **`system_settings`** - Configuraciones del sistema

## 🔐 Características de Seguridad

### Row Level Security (RLS)
- Todas las tablas tienen políticas RLS implementadas
- Los usuarios solo pueden acceder a sus propios datos
- Validación automática de permisos

### Encriptación
- API keys almacenadas con encriptación base64
- Datos sensibles protegidos
- Validación de inputs en todos los endpoints

### Triggers Automáticos
- Actualización automática de timestamps
- Creación de perfiles al registrar usuarios
- Actualización de estadísticas en tiempo real

## 🎯 Vistas Útiles Creadas

### `user_document_summary`
Resumen de documentos por usuario:
```sql
SELECT * FROM user_document_summary WHERE user_id = 'your_user_id';
```

### `user_ai_metrics_summary`
Métricas de IA agregadas:
```sql
SELECT * FROM user_ai_metrics_summary WHERE user_id = 'your_user_id';
```

### `system_status`
Estado general del sistema:
```sql
SELECT * FROM system_status;
```

## 📈 Índices Optimizados

### Índices Compuestos
- Para consultas frecuentes de usuario + fecha
- Para búsquedas de documentos por estado
- Para métricas de rendimiento por modelo

### Índices GIN
- Para búsqueda de texto completo
- Para arrays de etiquetas y metadatos

### Índices Temporales
- Para consultas por rangos de fecha
- Para auditoría histórica

## 🧪 Verificación de Instalación

### 1. Verificar Tablas Creadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver 15 tablas principales + 3 vistas.

### 2. Verificar Políticas RLS
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### 3. Verificar Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🔧 Configuración Adicional

### 1. Configurar API Keys de IA
Edita el archivo `.env.local`:
```bash
# Groq API (para análisis de texto)
GROQ_API_KEY=your_groq_api_key_here

# Chutes API (para análisis avanzado)
CHUTES_API_KEY=your_chutes_api_key_here

# OpenAI (opcional, para análisis adicional)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (opcional, para análisis adicional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Obtener API Keys

#### Groq API
1. Ve a: https://console.groq.com/
2. Regístrate o inicia sesión
3. Ve a "API Keys"
4. Crea una nueva key y cópiala

#### Chutes API
1. Ve a: https://chutes.ai/
2. Regístrate o inicia sesión
3. Ve a "Dashboard" > "API Settings"
4. Genera una nueva API key

## 🚀 Iniciar la Aplicación

### 1. Iniciar el Servidor
```bash
npm start
```

### 2. Acceder a la Aplicación
```
🌐 URL: http://localhost:3000
```

### 3. Configurar APIs en la Interfaz
1. Haz clic en **"Configuración de APIs"**
2. Ingresa tus API keys
3. Prueba la conexión
4. Guarda la configuración

## 📊 Monitoreo y Métricas

### Métricas Disponibles
- Tiempos de respuesta por modelo
- Costos de uso por API
- Precisión de análisis
- Estadísticas de uso por usuario

### Consultas Útiles
```sql
-- Métricas de uso por modelo
SELECT model_name, AVG(response_time), AVG(cost_per_request)
FROM ai_model_metrics 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY model_name;

-- Documentos procesados por día
SELECT DATE(uploaded_at) as date, COUNT(*) as documents
FROM documents
WHERE uploaded_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(uploaded_at)
ORDER BY date;
```

## 🔍 Solución de Problemas

### Error: "column created_at does not exist"
**Causa:** El schema SQL tiene referencias incorrectas a columnas
**Solución:**
1. Primero prueba con el schema mínimo: `database/minimal-test-schema.sql`
2. Si el schema mínimo funciona, el problema está en el schema completo
3. Verifica que todas las referencias a `documents.created_at` usen `documents.uploaded_at`

### Error: "invalid input syntax for type json"
**Causa:** Valores JSON incorrectamente formateados en los INSERT statements
**Solución:**
1. Verifica que todos los valores JSON estén entre comillas dobles
2. Ejemplo incorrecto: `'spa+eng'`
3. Ejemplo correcto: `'"spa+eng"'`
4. Los strings en JSON deben estar entre comillas dobles

### Error: "Could not find the table"
**Causa:** El schema no se ejecutó completamente
**Solución:** Re-ejecuta el schema SQL completo

### Error: "Permission denied"
**Causa:** Las políticas RLS no se aplicaron
**Solución:** Verifica que las políticas estén habilitadas

### Error: "Connection refused"
**Causa:** Configuración incorrecta de Supabase
**Solución:** Verifica URL y API keys en `.env.local`

### 🧪 Prueba con Schema Mínimo

Si tienes problemas con el schema completo:

1. **Prueba primero el schema mínimo:**
   ```sql
   -- Copia y pega el contenido de database/minimal-test-schema.sql
   ```

2. **Si funciona, el problema está en el schema completo**
   - Revisa las referencias a columnas
   - Verifica nombres de tablas
   - Ejecuta statement por statement

3. **Herramienta de diagnóstico:**
   ```bash
   node scripts/test-schema.js
   ```

## 📚 Documentación Adicional

- [Guía de Configuración de IA](docs/ai-setup-guide.md)
- [Guía de OCR](docs/ocr-guide.md)
- [Referencia de Modelos](docs/models-reference.md)
- [Recomendaciones de Modelos](docs/ai-model-recommendations.md)

## 🎉 ¡Listo!

Una vez completados estos pasos, tu base de datos estará completamente configurada y lista para usar con Document Analyzer. El sistema ahora puede:

✅ Almacenar y gestionar documentos  
✅ Realizar análisis con múltiples modelos de IA  
✅ Procesar imágenes con OCR  
✅ Mantener historial completo de uso  
✅ Proporcionar métricas y estadísticas  
✅ Garantizar seguridad y privacidad  

¡Disfruta de Document Analyzer con base de datos enterprise-ready!