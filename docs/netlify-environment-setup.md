# Guía de Configuración de Variables de Entorno en Netlify

## 📋 Overview

Esta guía te ayudará a configurar todas las variables de entorno necesarias para desplegar la aplicación de **Document Analyzer** en Netlify.

## 🔧 Variables de Entorno Requeridas

### 1. Variables Esenciales (Obligatorias)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | `3000` | Puerto del servidor (Netlify usa variables propias) |

### 2. Base de Datos Supabase

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://your-project-id.supabase.co` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Clave anónima de Supabase |

### 3. APIs de Inteligencia Artificial

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `GROQ_API_KEY` | `gsk_your_groq_api_key_here` | API Key de Groq (obtener de https://console.groq.com/) |
| `CHUTES_API_KEY` | `your_chutes_api_key_here` | API Key de Chutes.ai (opcional) |
| `CHUTES_API_URL` | `https://api.chutes.ai` | URL base de API Chutes.ai |

### 4. Configuración de la Aplicación

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MAX_FILE_SIZE` | `52428800` | Tamaño máximo de archivo (50MB) |
| `MAX_BATCH_FILES` | `10` | Máximo de archivos por lote |
| `DEFAULT_AI_MODEL` | `llama-3.3-70b-versatile` | Modelo de IA predeterminado |
| `AI_MAX_TOKENS` | `8000` | Límite de tokens para análisis |
| `AI_TEMPERATURE` | `0.2` | Temperatura para generación (0.0-1.0) |
| `ENABLE_AI_BY_DEFAULT` | `true` | Habilitar análisis IA por defecto |

### 5. Variables para el Frontend (React)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | URL de Supabase para frontend |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Clave Supabase para frontend |
| `VITE_API_BASE_URL` | `/api` | URL base de API (para Netlify Functions) |

## 🚀 Pasos para Configurar en Netlify

### Paso 1: Acceder al Panel de Netlify

1. Ve a [https://app.netlify.com/](https://app.netlify.com/)
2. Inicia sesión con tu cuenta
3. Selecciona tu sitio o crea uno nuevo desde el repositorio GitHub

### Paso 2: Configurar Variables de Entorno

#### Opción A: Interfaz Gráfica (Recomendado)

1. En tu sitio, ve a **Site settings** → **Environment variables**
2. Haz clic en **Edit variables**
3. Agrega cada variable con su valor correspondiente:

```
Variables Esenciales:
- NODE_ENV = production
- PORT = 3000

Base de Datos:
- SUPABASE_URL = https://tu-proyecto-id.supabase.co
- SUPABASE_ANON_KEY = tu_clave_anonima_aqui

APIs de IA:
- GROQ_API_KEY = gsk_tu_api_key_de_groq_aqui
- CHUTES_API_KEY = tu_api_key_de_chutes_aqui (opcional)
- CHUTES_API_URL = https://api.chutes.ai

Configuración:
- MAX_FILE_SIZE = 52428800
- MAX_BATCH_FILES = 10
- DEFAULT_AI_MODEL = llama-3.3-70b-versatile
- AI_MAX_TOKENS = 8000
- AI_TEMPERATURE = 0.2
- ENABLE_AI_BY_DEFAULT = true

Frontend (con prefijo VITE_):
- VITE_SUPABASE_URL = https://tu-proyecto-id.supabase.co
- VITE_SUPABASE_ANON_KEY = tu_clave_anonima_aqui
- VITE_API_BASE_URL = /api
```

#### Opción B: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Iniciar sesión
netlify login

# Conectar al sitio
netlify link

# Agregar variables de entorno
netlify env:set NODE_ENV production
netlify env:set SUPABASE_URL https://tu-proyecto-id.supabase.co
netlify env:set SUPABASE_ANON_KEY tu_clave_anonima_aqui
netlify env:set GROQ_API_KEY gsk_tu_api_key_de_groq_aqui
netlify env:set CHUTES_API_KEY tu_api_key_de_chutes_aqui
# ... y así sucesivamente para cada variable
```

### Paso 3: Configurar Build Settings

En **Site settings** → **Build & deploy** → **Build settings**:

```
Build command: npm run build
Publish directory: frontend-react/dist
```

### Paso 4: Configurar Netlify Functions

Crea un archivo `netlify.toml` en la raíz del proyecto:

```toml
[build]
  command = "npm run build"
  publish = "frontend-react/dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
```

## 🔑 Obtener las API Keys

### Groq AI API Key

1. Ve a [https://console.groq.com/](https://console.groq.com/)
2. Inicia sesión o crea una cuenta
3. Ve a **API Keys** → **Create Key**
4. Copia la clave (comienza con `gsk_`)

### Supabase Configuration

1. Ve a [https://supabase.com/](https://supabase.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings** → **API**
4. Copia:
   - **Project URL** (para `SUPABASE_URL`)
   - **anon public** key (para `SUPABASE_ANON_KEY`)

### Chutes.ai API Key (Opcional)

1. Ve a [https://chutes.ai/](https://chutes.ai/)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** o **Dashboard**
4. Genera y copia tu API key

## 🧪 Verificar Configuración

### 1. Despliegue de Prueba

```bash
# Desplegar cambios
git add .
git commit -m "Configurar variables de entorno para Netlify"
git push origin main
```

### 2. Verificar Variables

Netlify mostrará las variables configuradas en:
- **Site settings** → **Environment variables**
- Durante el build process en los logs

### 3. Probar Funcionalidad

1. Visita tu sitio desplegado
2. Ve a **Configuración IA**
3. Verifica que las APIs estén conectadas
4. Prueba subir y analizar un documento

## 🚨 Solución de Problemas Comunes

### Error: "API Key no configurada"

**Causa:** La variable de entorno no está configurada correctamente.

**Solución:**
1. Verifica que el nombre de la variable sea exacto
2. Confirma que el valor no tenga espacios extra
3. Reinicia el deploy después de configurar

### Error: "CORS issues"

**Causa:** Las URLs de frontend y backend no coinciden.

**Solución:**
1. Configura `VITE_API_BASE_URL = /api`
2. Asegúrate de que los redirects en `netlify.toml` estén correctos

### Error: "Supabase connection failed"

**Causa:** Credenciales de Supabase incorrectas.

**Solución:**
1. Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`
2. Confirma que el proyecto Supabase esté activo
3. Revisa las RLS policies en Supabase

### Error: "Build failed"

**Causa:** Variables de entorno faltantes durante el build.

**Solución:**
1. Configura todas las variables requeridas
2. Usa `netlify env:list` para verificar
3. Revisa los logs de build

## 📝 Variables Opcionales para Producción

| Variable | Valor Default | Descripción |
|----------|---------------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Ventana de rate limiting (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Máximo de requests por ventana |
| `AI_TIMEOUT` | `60000` | Timeout para APIs de IA (ms) |
| `LOG_LEVEL` | `info` | Nivel de logging (error/warn/info/debug) |

## 🔐 Consideraciones de Seguridad

1. **Nunca** commits archivos `.env` con claves reales
2. Usa variables de entorno para todos los secretos
3. Limita los permisos de las API keys al mínimo necesario
4. Rota las API keys periódicamente
5. Monitorea el uso de las APIs para detectar actividad inusual

## 📚 Recursos Adicionales

- [Netlify Environment Variables Docs](https://docs.netlify.com/configure-builds/environment-variables/)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts)
- [Groq API Documentation](https://console.groq.com/docs/quickstart)
- [Netlify Functions Guide](https://docs.netlify.com/edge-functions/overview/)

---

**Última actualización:** 11 de diciembre de 2024  
**Versión:** 1.0  
**Estado:** Probado y verificado para producción