# Guía de Despliegue en Netlify - Document Analyzer

## 📋 Overview

Esta guía explica cómo desplegar la aplicación **Document Analyzer** en Netlify utilizando Netlify Functions para el backend y el frontend de React.

## 🏗️ Arquitectura

```
Document Analyzer
├── frontend-react/          # Frontend de React
│   ├── src/
│   ├── dist/                # Archivos estáticos generados
│   └── package.json
├── netlify/
│   └── functions/           # Netlify Functions (backend)
│       ├── api-handler.js   # Handler principal de la API
│       └── package.json
├── src/                     # Código fuente compartido
├── docs/                    # Documentación
└── netlify.toml            # Configuración de Netlify
```

## 🚀 Pasos para el Despliegue

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio GitHub contenga:

- ✅ Código fuente del frontend (`frontend-react/`)
- ✅ Configuración de Netlify (`netlify.toml`)
- ✅ Netlify Functions (`netlify/functions/`)
- ✅ Documentación (`docs/netlify-environment-setup.md`)

### 2. Configurar Variables de Entorno

Sigue la guía completa en [`docs/netlify-environment-setup.md`](docs/netlify-environment-setup.md)

**Variables esenciales mínimas:**
```
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
GROQ_API_KEY=gsk_tu_api_key
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_API_BASE_URL=/api
```

### 3. Crear Sitio en Netlify

1. Ve a [https://app.netlify.com/](https://app.netlify.com/)
2. Haz clic en **"Add new site"** → **"Import an existing project"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `brifyai/editorpdf`

### 4. Configurar Build Settings

En la configuración del sitio:

```
Build command: cd frontend-react && npm run build
Publish directory: frontend-react/dist
```

### 5. Desplegar

Netlify detectará automáticamente el archivo `netlify.toml` y configurará:

- ✅ Build settings
- ✅ Redirects para la API
- ✅ Environment variables
- ✅ Netlify Functions

Haz clic en **"Deploy site"**.

## 🔧 Configuración Técnica

### netlify.toml

El archivo [`netlify.toml`](netlify.toml) contiene:

- **Build configuration**: Comandos y directorios
- **Redirects**: Rutas de la API a Netlify Functions
- **Headers**: Configuración de seguridad y caché
- **Environment**: Node.js 18, npm 9

### Netlify Functions

El backend está adaptado en [`netlify/functions/api-handler.js`](netlify/functions/api-handler.js):

- **Express.js** con `serverless-http`
- **Todos los endpoints** del servidor original
- **Rate limiting** y seguridad
- **Integración** con Supabase y APIs de IA

### Frontend

El frontend en `frontend-react/` está configurado para:

- **Vite** como bundler
- **React** para la UI
- **Supabase** para autenticación y base de datos
- **API calls** a `/api/*` (redirigidos a Functions)

## 🧪 Verificación del Despliegue

### 1. Funcionalidad Básica

1. **Acceso al sitio**: Visita la URL proporcionada por Netlify
2. **Página principal**: Debe cargar la aplicación React
3. **Autenticación**: Prueba el login/registro
4. **Base de datos**: Verifica conexión a Supabase

### 2. APIs de IA

1. Ve a **Configuración IA**
2. Verifica el estado de las APIs:
   ```
   ✅ Groq AI: Disponible
   ⚠️  Chutes.ai: Opcional
   ```
3. Prueba analizar un documento pequeño

### 3. Endpoints Críticos

Verifica que estos endpoints funcionen:

- `GET /api/ai-status` - Estado de APIs
- `GET /api/test-connections` - Conexiones del sistema
- `GET /api/models` - Modelos disponibles
- `POST /api/save-ai-config` - Guardar configuración

### 4. Logs de Netlify

Revisa los logs si hay problemas:

1. Ve a **Site settings** → **Functions**
2. Revisa **Function logs**
3. Verifica **Deploy logs** para errores de build

## 🚨 Solución de Problemas

### Error: "Function not found"

**Causa:** Las Functions no se desplegaron correctamente.

**Solución:**
1. Verifica que `netlify/functions/` esté en el repositorio
2. Revisa el archivo `netlify.toml`
3. Haz un nuevo deploy

### Error: "API Key no configurada"

**Causa:** Variables de entorno faltantes.

**Solución:**
1. Ve a **Site settings** → **Environment variables**
2. Agrega todas las variables requeridas
3. Redeploy

### Error: "CORS issues"

**Causa:** Configuración incorrecta de redirects.

**Solución:**
1. Verifica `netlify.toml` redirects
2. Confirma `VITE_API_BASE_URL=/api`
3. Revisa headers de CORS

### Error: "Build failed"

**Causa:** Problemas en el build del frontend.

**Solución:**
1. Revisa `frontend-react/package.json`
2. Verifica comando de build: `npm run build`
3. Revisa logs de build en Netlify

### Error: "Supabase connection failed"

**Causa:** Credenciales incorrectas o RLS policies.

**Solución:**
1. Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`
2. Revisa RLS policies en Supabase
3. Prueba conexión directa

## 📊 Monitoreo y Mantenimiento

### Netlify Analytics

1. Ve a **Site analytics** para métricas
2. Monitorea **Function usage**
3. Revisa **Page views** y **Bandwidth**

### Logs y Errores

1. **Function logs**: Errores del backend
2. **Deploy logs**: Problemas de despliegue
3. **Site logs**: Accesos y errores HTTP

### Performance

1. **Netlify Speed Insights**: Rendimiento del frontend
2. **Function response time**: Latencia de la API
3. **Database queries**: Rendimiento de Supabase

## 🔐 Seguridad

### Variables de Entorno

- ✅ Todas las claves en Environment variables
- ✅ Sin archivos `.env` en el repositorio
- ✅ Keys con permisos mínimos necesarios

### Headers de Seguridad

El `netlify.toml` incluye:

```
X-Frame-Options = DENY
X-XSS-Protection = 1; mode=block
X-Content-Type-Options = nosniff
Referrer-Policy = strict-origin-when-cross-origin
```

### Rate Limiting

- **General**: 100 requests cada 15 minutos
- **OCR**: 20 requests cada 15 minutos
- **Análisis**: 50 requests cada 15 minutos

## 🚀 Optimizaciones

### Frontend

- **Build optimizado**: Vite con minificación
- **Caché estática**: Headers para assets
- **Lazy loading**: Componentes bajo demanda

### Backend

- **Functions serverless**: Escalabilidad automática
- **Rate limiting**: Protección contra abuso
- **Connection pooling**: Optimización de base de datos

### CDN

- **Netlify Edge**: Distribución global
- **Caché inteligente**: Respuestas rápidas
- **Compression**: Gzip automático

## 📝 Actualizaciones y Mantenimiento

### Actualizar el Código

1. **Hacer cambios** en el repositorio local
2. **Test local**: `npm run dev`
3. **Commit y push**: `git push origin main`
4. **Netlify deploy**: Automático

### Actualizar Dependencias

```bash
# Frontend
cd frontend-react
npm update

# Backend
npm update
```

### Actualizar Variables de Entorno

1. Ve a **Site settings** → **Environment variables**
2. Edita las variables necesarias
3. Redeploy para aplicar cambios

## 📞 Soporte

### Documentación

- **Guía de variables**: [`docs/netlify-environment-setup.md`](docs/netlify-environment-setup.md)
- **Documentación general**: [`README.md`](README.md)
- **Guías de IA**: [`docs/`](docs/)

### Recursos Externos

- **Netlify Docs**: [https://docs.netlify.com/](https://docs.netlify.com/)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Groq API**: [https://console.groq.com/docs](https://console.groq.com/docs)

### Comunidad

- **Issues de GitHub**: Reportar problemas
- **Discussions**: Preguntas y sugerencias
- **Netlify Community**: Soporte de despliegue

---

**Última actualización:** 11 de diciembre de 2024  
**Versión:** 1.0  
**Estado:** Production ready