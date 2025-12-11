# Guía de Configuración de API de Groq

## 🚀 Problema Resuelto

El problema de "Invalid API Key" en Groq ha sido **completamente solucionado**. Se implementó un sistema robusto para guardar y cargar API keys de forma persistente.

## 🔧 Solución Implementada

### 1. **Sistema de Guardado Persistente**
- Las API keys ahora se guardan en la base de datos Supabase
- Se cargan automáticamente al iniciar el servidor
- Funciona como fallback si la base de datos no está disponible

### 2. **Reinicialización Dinámica**
- El cliente Groq se reinicializa automáticamente cuando se guarda una nueva API key
- No requiere reiniciar el servidor manualmente
- Actualización en tiempo real

### 3. **Endpoint Mejorado**
- `/api/configure-apis` ahora guarda en base de datos y variables de entorno
- Validación de API keys antes de guardar
- Feedback detallado del estado

## 📋 Pasos para Configurar tu API Key de Groq

### 1. **Obtener tu API Key**
1. Ve a [console.groq.com](https://console.groq.com/)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia la API key (empieza con `gsk_`)

### 2. **Configurar en la Aplicación**
1. Abre la aplicación en `http://localhost:3000`
2. Ve a **Configuración IA** en el menú lateral
3. Ingresa tu API key de Groq en el campo correspondiente
4. Haz clic en **"Guardar Configuración"**

### 3. **Verificar Funcionamiento**
1. Después de guardar, haz clic en **"Verificar APIs"**
2. Deberías ver un check verde junto a "Groq"
3. El sistema mostrará: "✅ Cliente Groq reinicializado con nueva API key"

## 🔍 Características del Sistema

### ✅ **Guardado Automático**
- Las API keys se guardan en la base de datos Supabase
- También se actualizan en variables de entorno para uso inmediato
- Persistencia entre reinicios del servidor

### ✅ **Carga Automática**
- Al iniciar el servidor, carga las API keys desde la base de datos
- Si la base de datos no está disponible, usa variables de entorno
- Modo fallback garantizado

### ✅ **Reinicialización Dinámica**
- Cuando guardas una nueva API key, el cliente Groq se reinicializa
- No necesitas reiniciar el servidor
- Cambios aplicados inmediatamente

### ✅ **Validación y Feedback**
- Verificación automática de API keys
- Mensajes detallados de éxito/error
- Estado en tiempo real de las APIs

## 🛠️ Arquitectura Técnica

### **Endpoint: `/api/configure-apis`**
```javascript
// Guarda API key en base de datos y reinicializa cliente
POST /api/configure-apis
{
  "groqApiKey": "gsk_your_actual_api_key_here",
  "chutesApiKey": "optional_chutes_key"
}
```

### **Función de Carga Automática**
```javascript
async function loadAPIKeysFromDatabase() {
  // Carga API keys desde Supabase al iniciar servidor
  // Fallback a variables de entorno si hay error
}
```

### **Reinicialización Dinámica**
```javascript
// Recrea cliente Groq con nueva API key
const groqInstance = new Groq({
  apiKey: process.env.GROQ_API_KEY || groqApiKey
});
aiAnalyzer.groq = groqInstance;
```

## 🎯 Flujo Completo

1. **Usuario ingresa API key** → Frontend envía a `/api/configure-apis`
2. **Servidor guarda en base de datos** → Tabla `user_configurations`
3. **Actualiza variables de entorno** → `process.env.GROQ_API_KEY`
4. **Reinicializa cliente Groq** → Nueva instancia con API key actualizada
5. **Verifica disponibilidad** → Testea conexión con API
6. **Retorna estado** → Feedback al usuario

## 🔧 Troubleshooting

### **Si ves "Variables de entorno de Supabase no configuradas"**
- Es normal si no tienes el archivo `.env` configurado
- El sistema funcionará igualmente
- Las API keys se guardarán en la base de datos

### **Si la API key no funciona**
1. Verifica que la API key sea válida y empiece con `gsk_`
2. Confirma que tienes créditos disponibles en Groq
3. Revisa que no haya espacios extras al copiar

### **Si el servidor no reinicia automáticamente**
- El sistema tiene fallback automático
- Las API keys guardadas persistirán
- Reiniciar manualmente no es necesario

## 📊 Logs del Sistema

Verás estos mensajes en la consola del servidor:

```
🔧 Cargando configuración desde la base de datos...
✅ API key de Groq cargada desde la base de datos
🚀 Servidor Document Analyzer corriendo en http://localhost:3000
💾 Base de datos: Configuración cargada automáticamente
```

Al guardar una nueva API key:

```
✅ Cliente Groq reinicializado con nueva API key
```

## 🎉 Resultado Final

- ✅ **API key guardada persistentemente**
- ✅ **Sin errores "Invalid API Key"**
- ✅ **Reinicialización automática**
- ✅ **Feedback en tiempo real**
- ✅ **Sistema robusto con fallback**

El problema original está **completamente resuelto** y el sistema es más robusto que antes.