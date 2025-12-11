# Guía de Configuración de APIs de IA

Esta guía te ayudará a configurar las APIs de IA (Groq y Chutes.ai) para habilitar el análisis avanzado con inteligencia artificial en Document Analyzer.

## 🚀 Requisitos Previos

- Node.js 14.0 o superior
- Cuentas en las plataformas de IA
- Document Analyzer instalado y funcionando

## 🔧 Configuración de Groq API

### 1. Crear cuenta en Groq

1. Visita [https://console.groq.com/](https://console.groq.com/)
2. Regístrate o inicia sesión
3. Ve a la sección "API Keys"
4. Crea una nueva API key

### 2. Obtener tu API Key

```bash
# Tu API key se verá así:
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configurar la variable de entorno

```bash
# Método 1: Crear archivo .env
cp .env.example .env

# Editar .env y agregar:
GROQ_API_KEY=gsk_tu_api_key_aqui
```

O exportar directamente:

```bash
export GROQ_API_KEY=gsk_tu_api_key_aqui
```

## 🤖 Configuración de Chutes.ai

### 1. Crear cuenta en Chutes.ai

1. Visita [https://chutes.ai/](https://chutes.ai/)
2. Regístrate y crea una cuenta
3. Configura tu wallet Bittensor (requerido para Chutes)

### 2. Crear API Key

```bash
# Usando la CLI de Chutes
chutes register
chutes keys create --name document-analyzer --admin
```

### 3. Configurar la variable de entorno

```bash
# En tu archivo .env
CHUTES_API_KEY=tu_chutes_api_key_aqui
CHUTES_API_URL=https://api.chutes.ai
```

## 📋 Configuración Completa

Tu archivo `.env` debería verse así:

```bash
# Configuración básica
PORT=3000
NODE_ENV=development

# APIs de IA
GROQ_API_KEY=gsk_tu_real_groq_api_key
CHUTES_API_KEY=tu_real_chutes_api_key
CHUTES_API_URL=https://api.chutes.ai

# Configuración de IA
DEFAULT_AI_MODEL=llama-3.3-70b-versatile
ENABLE_AI_BY_DEFAULT=true
DEFAULT_AI_ANALYSIS_TYPE=balanced
```

## 🧪 Verificar Configuración

### 1. Reiniciar el servidor

```bash
npm start
```

### 2. Verificar estado de APIs

Abre tu navegador y ve a `http://localhost:3000/api/ai-status`

Deberías ver una respuesta como:

```json
{
  "success": true,
  "apis": {
    "groq": true,
    "chutes": true
  },
  "timestamp": "2023-12-07T02:17:00.000Z"
}
```

### 3. Verificar en la interfaz web

1. Abre `http://localhost:3000`
2. Haz clic en "Verificar APIs"
3. Deberías ver badges verdes para Groq y Chutes.ai

## 🎯 Modelos Disponibles

### Groq Models

| Modelo | Velocidad | Uso | Descripción |
|--------|----------|-----|-------------|
| `llama-3.1-8b-instant` | ⚡ Rápido | Análisis rápido | Ideal para documentos simples |
| `llama-3.3-70b-versatile` | 🔄 Balanceado | Uso general | Mejor relación calidad/velocidad |
| `mixtral-8x7b-32768` | 🐌 Lento | Análisis profundo | Máxima calidad y detalle |

## 🔍 Solución de Problemas

### Problema: "Groq API no configurada"

**Solución:**
```bash
# Verifica que la variable esté configurada
echo $GROQ_API_KEY

# O verifica en el archivo .env
cat .env | grep GROQ_API_KEY
```

### Problema: "Error en análisis con IA"

**Solución:**
1. Verifica tu conexión a internet
2. Confirma que las API keys son válidas
3. Revisa los límites de uso de las APIs

### Problema: "Timeout en análisis"

**Solución:**
```bash
# Aumenta el timeout en .env
AI_TIMEOUT=120000  # 2 minutos
PROCESSING_TIMEOUT=600000  # 10 minutos
```

## 📊 Uso de las APIs

### Límites de Groq

- **Gratis**: 30 requests/minuto
- **Pro**: Ilimitado
- **Tokens**: Hasta 8,000 por request

### Límites de Chutes.ai

- Depende de tu plan y configuración
- Requiere wallet Bittensor con fondos

## 🎛️ Configuración Avanzada

### Personalizar prompts de IA

Edita `src/ai/aiAnalyzer.js` para ajustar los prompts:

```javascript
const prompt = `
Analiza el siguiente texto con alta precisión. 
Personaliza este prompt según tus necesidades.
`;
```

### Configurar modelos específicos

```javascript
// En aiAnalyzer.js
this.models = {
    fast: 'llama-3.1-8b-instant',
    balanced: 'llama-3.3-70b-versatile',
    deep: 'mixtral-8x7b-32768',
    custom: 'tu-modelo-personalizado'
};
```

## 🚀 Mejores Prácticas

1. **Usar el modelo balanceado** para la mayoría de casos
2. **Limitar tamaño de texto** a 8,000 tokens para mejor rendimiento
3. **Monitorear uso** de APIs para evitar límites
4. **Tener fallbacks** por si las APIs no están disponibles
5. **Cachear resultados** para análisis repetidos

## 📚 Recursos Adicionales

- [Documentación de Groq](https://console.groq.com/docs)
- [Documentación de Chutes.ai](https://chutes.ai/docs)
- [Guía de Node.js](https://nodejs.org/docs)
- [Soporte de Document Analyzer](README.md)

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa esta guía cuidadosamente
2. Verifica la documentación oficial de cada API
3. Crea un issue en el repositorio del proyecto
4. Contacta al soporte técnico

---

**¡Listo! Con estas configuraciones, tu Document Analyzer tendrá capacidades de análisis con IA de última generación.**