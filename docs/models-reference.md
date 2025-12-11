# Referencia Completa de Modelos de IA

Esta guía describe todos los modelos de IA disponibles en Document Analyzer, sus características y casos de uso recomendados.

## 🤖 Modelos Groq

Groq提供超快速的AI推理服务，使用优化的硬件栈实现极低的延迟。

### 1. Llama 3.1 8B Instant

**ID del Modelo**: `llama-3.1-8b-instant`

#### 📊 Características Técnicas
- **Parámetros**: 8 mil millones
- **Ventana de Contexto**: 131,072 tokens
- **Velocidad**: ⚡⚡⚡⚡⚡ Ultra Rápida
- **Latencia**: < 100ms promedio
- **Costo**: $ más económico

#### 🎯 Casos de Uso Recomendados
- ✅ **Análisis rápido de documentos simples**
- ✅ **Clasificación básica de contenido**
- ✅ **Resúmenes cortos y directos**
- ✅ **Extracción de entidades simple**
- ✅ **Procesamiento en tiempo real**

#### ⚡ Ventajas
- Respuestas casi instantáneas
- Bajo costo de procesamiento
- Ideal para aplicaciones interactivas
- Manejo eficiente de documentos pequeños

#### 🔴 Limitaciones
- Menor profundidad de análisis
- Capacidades de razonamiento limitadas
- No ideal para contenido complejo

---

### 2. Llama 3.3 70B Versatile

**ID del Modelo**: `llama-3.3-70b-versatile`

#### 📊 Características Técnicas
- **Parámetros**: 70 mil millones
- **Ventana de Contexto**: 131,072 tokens
- **Velocidad**: ⚡⚡⚡ Balanceada
- **Latencia**: 200-500ms promedio
- **Costo**: $$ económico

#### 🎯 Casos de Uso Recomendados
- ✅ **Análisis general de documentos**
- ✅ **Clasificación detallada**
- ✅ **Resúmenes de calidad media-alta**
- ✅ **Análisis de sentimiento preciso**
- ✅ **Extracción de insights básicos**
- ✅ **Documentos de longitud media**

#### ⚡ Ventajas
- Excelente relación calidad/velocidad
- Buen manejo de lenguaje complejo
- Versátil para múltiples tipos de análisis
- Balance ideal para la mayoría de casos

#### 🔴 Limitaciones
- Más costoso que el modelo instantáneo
- Latencia mayor para documentos muy largos

---

### 3. Mixtral 8x7B

**ID del Modelo**: `mixtral-8x7b-32768`

#### 📊 Características Técnicas
- **Parámetros**: 47 mil millones (8 expertos × 7B)
- **Ventana de Contexto**: 32,768 tokens
- **Velocidad**: ⚡⚡ Lenta pero precisa
- **Latencia**: 500-1000ms promedio
- **Costo**: $$$ premium

#### 🎯 Casos de Uso Recomendados
- ✅ **Análisis profundo y detallado**
- ✅ **Resúmenes ejecutivos de alta calidad**
- ✅ **Análisis crítico complejo**
- ✅ **Razonamiento multi-paso**
- ✅ **Documentos largos y complejos**
- ✅ **Insights estratégicos**

#### ⚡ Ventajas
- Máxima calidad de análisis
- Excelentes capacidades de razonamiento
- Manejo superior de contenido complejo
- Ideal para análisis crítico

#### 🔴 Limitaciones
- Mayor tiempo de procesamiento
- Costo más elevado
- Ventana de contexto más pequeña

---

## 🌐 Modelos Chutes.ai

Chutes.ai es una plataforma descentralizada que ofrece modelos especializados con aceleración GPU.

### Características de la Plataforma

#### 🏗️ Arquitectura
- **Red Descentralizada**: Basada en ecosistema Bittensor
- **Aceleración GPU**: Procesamiento paralelo optimizado
- **Modelos Especializados**: Fine-tuned para dominios específicos
- **Escalabilidad Horizontal**: Múltiples nodos de procesamiento

#### 🎯 Especializaciones Disponibles
- **Análisis de Documentos**: Modelos optimizados para PDF/PPTX
- **Extracción de Entidades**: Detección precisa de información estructurada
- **Clasificación de Contenido**: Categorización automática avanzada
- **Análisis de Sentimiento**: Detección emocional contextual
- **Resumen Automático**: Generación condensada de contenido

#### ⚡ Ventajas de Chutes.ai
- Modelos especializados para documentos
- Procesamiento paralelo de alto rendimiento
- Capacidades de fine-tuning personalizadas
- Ecosistema descentralizado resistente

#### 🔴 Consideraciones
- Requiere configuración de wallet Bittensor
- Disponibilidad variable según red
- Costos basados en mercado de subastas

---

## 📊 Comparación Detallada

### Tabla Comparativa

| Modelo | Parámetros | Contexto | Velocidad | Costo | Calidad | Uso Ideal |
|--------|------------|----------|----------|-------|--------|-----------|
| `llama-3.1-8b-instant` | 8B | 131K | ⚡⚡⚡⚡⚡ | $ | ⚡⚡⚡ | Rápido |
| `llama-3.3-70b-versatile` | 70B | 131K | ⚡⚡⚡ | $$ | ⚡⚡⚡⚡⚡ | General |
| `mixtral-8x7b-32768` | 47B | 32K | ⚡⚡ | $$$ | ⚡⚡⚡⚡⚡ | Profundo |
| `chutes-specialized` | Variable | Variable | ⚡⚡⚡ | $$ | ⚡⚡⚡⚡ | Especializado |

### Métricas de Rendimiento

#### 📈 Velocidad de Procesamiento
- **Llama 3.1 8B**: ~100ms para 1K tokens
- **Llama 3.3 70B**: ~300ms para 1K tokens
- **Mixtral 8x7B**: ~600ms para 1K tokens
- **Chutes.ai**: ~200-400ms (variable)

#### 💰 Costo por 1M Tokens
- **Llama 3.1 8B**: ~$0.05-0.10
- **Llama 3.3 70B**: ~$0.20-0.50
- **Mixtral 8x7B**: ~$0.50-1.00
- **Chutes.ai**: ~$0.15-0.40 (variable)

#### 🎯 Precisión de Análisis
- **Llama 3.1 8B**: 70-75% (tareas simples)
- **Llama 3.3 70B**: 85-90% (tareas generales)
- **Mixtral 8x7B**: 90-95% (tareas complejas)
- **Chutes.ai**: 80-90% (tareas especializadas)

---

## 🎛️ Configuración y Uso

### Selección Automática de Modelos

La aplicación selecciona automáticamente el modelo óptimo basado en:

```javascript
// Lógica de selección automática
function selectOptimalModel(documentSize, complexity, analysisType) {
    if (analysisType === 'fast' || documentSize < 1000) {
        return 'llama-3.1-8b-instant';
    } else if (analysisType === 'balanced' || documentSize < 5000) {
        return 'llama-3.3-70b-versatile';
    } else if (analysisType === 'deep' || documentSize >= 5000) {
        return 'mixtral-8x7b-32768';
    }
    return 'llama-3.3-70b-versatile'; // default
}
```

### Configuración Manual

Los usuarios pueden seleccionar manualmente:

1. **Tipo de Análisis**: Rápido, Balanceado, Profundo
2. **Modelo Específico**: Cualquier modelo disponible
3. **API Keys**: Configurar Groq y Chutes.ai

### Ejemplos de Configuración

#### Para Análisis Rápido
```javascript
{
    "useAI": true,
    "analysisType": "fast",
    "selectedModel": "llama-3.1-8b-instant"
}
```

#### Para Análisis Balanceado
```javascript
{
    "useAI": true,
    "analysisType": "balanced",
    "selectedModel": "llama-3.3-70b-versatile"
}
```

#### Para Análisis Profundo
```javascript
{
    "useAI": true,
    "analysisType": "deep",
    "selectedModel": "mixtral-8x7b-32768"
}
```

---

## 🚀 Mejores Prácticas

### 📋 Recomendaciones Generales

1. **Documentos Pequeños (< 2 páginas)**
   - Usar `llama-3.1-8b-instant`
   - Análisis rápido y eficiente

2. **Documentos Medianos (2-10 páginas)**
   - Usar `llama-3.3-70b-versatile`
   - Balance ideal calidad/velocidad

3. **Documentos Grandes (> 10 páginas)**
   - Usar `mixtral-8x7b-32768`
   - Máxima calidad para contenido complejo

4. **Análisis Especializado**
   - Considerar `chutes-specialized`
   - Para dominios específicos

### ⚡ Optimización de Rendimiento

#### División de Documentos
```javascript
// Para documentos muy largos, dividir en chunks
const chunks = splitDocumentIntoChunks(text, 8000);
const results = [];
for (const chunk of chunks) {
    const result = await analyzeChunk(chunk, model);
    results.push(result);
}
```

#### Caching de Resultados
```javascript
// Implementar caché para análisis repetidos
const cache = new Map();
function getCachedResult(hash) {
    return cache.get(hash);
}
function setCachedResult(hash, result) {
    cache.set(hash, result);
}
```

### 🔧 Configuración de APIs

#### Groq API
```bash
# Configurar variable de entorno
export GROQ_API_KEY=gsk_your_api_key_here

# O en archivo .env
GROQ_API_KEY=gsk_your_api_key_here
```

#### Chutes.ai API
```bash
# Configurar variable de entorno
export CHUTES_API_KEY=your_chutes_key_here
export CHUTES_API_URL=https://api.chutes.ai
```

---

## 📈 Métricas y Monitoreo

### 📊 Indicadores Clave

#### Latencia
- **Óptima**: < 200ms
- **Aceptable**: 200-500ms
- **Lenta**: > 500ms

#### Precisión
- **Excelente**: > 90%
- **Buena**: 80-90%
- **Aceptable**: 70-80%

#### Costo-Efectividad
- **Alta**: Llama 3.1 8B
- **Media**: Llama 3.3 70B
- **Baja**: Mixtral 8x7B

### 📱 Monitoreo en Tiempo Real

La aplicación proporciona monitoreo de:
- Estado de APIs
- Tiempos de procesamiento
- Costos acumulados
- Calidad de resultados

---

## 🔮 Futuro de los Modelos

### 🚀 Próximas Integraciones

1. **Modelos Multimodales**: Análisis de imágenes y texto
2. **Modelos Especializados**: Fine-tuning para dominios específicos
3. **Modelos Locales**: Opciones on-premise para privacidad
4. **Modelos Personalizados**: Entrenamiento con datos del usuario

### 📈 Roadmap

- **Q1 2024**: Integración con más proveedores de IA
- **Q2 2024**: Modelos multimodales
- **Q3 2024**: Fine-tuning personalizado
- **Q4 2024**: Modelos locales y edge computing

---

## 🆘 Soporte y Troubleshooting

### ❌ Problemas Comunes

#### Error: "Invalid API Key"
- **Solución**: Verificar la API key en la configuración
- **Causa**: API key incorrecta o expirada

#### Error: "Model not found"
- **Solución**: Verificar el ID del modelo
- **Causa**: Modelo no disponible o nombre incorrecto

#### Error: "Context length exceeded"
- **Solución**: Usar modelo con mayor ventana de contexto
- **Causa**: Documento muy largo para el modelo seleccionado

#### Error: "Rate limit exceeded"
- **Solución**: Esperar y reintentar, o usar plan superior
- **Causa**: Límite de peticiones por minuto excedido

### 📞 Obtener Ayuda

1. **Documentación**: Revisar guías detalladas
2. **Logs**: Verificar logs del servidor
3. **Estado**: Verificar estado de APIs en `/api/ai-status`
4. **Soporte**: Contactar al equipo de desarrollo

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Compatibilidad**: Node.js 14+, Navegadores modernos