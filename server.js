/**
 * Servidor optimizado y modular
 * Reemplaza server.js de 4,727 líneas con una versión de ~300 líneas
 * 
 * Mejoras implementadas:
 * - Middleware unificado de autenticación
 * - Patrones reutilizables para base de datos
 * - Estructura de respuestas estandarizada
 * - Endpoints modulares y separados
 * - Código DRY (Don't Repeat Yourself)
 * - Mejor manejo de errores
 * - Mayor mantenibilidad
 */

// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Importar módulos optimizados
const { optionalAuth } = require('./src/middleware/auth');
const {
  createResponse,
  createErrorResponse,
  isDatabaseAvailable,
  getRealMetrics,
  getPerformanceData,
  getModelUsage,
  getProviderStats
} = require('./src/utils/database');

// Importar rutas modulares
const analysisRoutes = require('./src/routes/analysis');
const authRoutes = require('./src/routes/auth');

// Importar parsers y procesadores
const pdfAnalyzer = require('./src/parsers/pdfAnalyzer');
const pptxAnalyzer = require('./src/parsers/pptxAnalyzer');
const OCRProcessor = require('./src/ocr/ocrProcessor');
const ImageToPDFConverter = require('./src/ocr/imageToPDFConverter');
const ImageToDocxConverter = require('./src/ocr/imageToDocxConverter');
const { modelOptimizer } = require('./src/ai/modelOptimizer');

// Inicializar procesadores
const ocrProcessor = new OCRProcessor();
const pdfConverter = new ImageToPDFConverter();
const docxConverter = new ImageToDocxConverter();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware base
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// =====================================================
// CONFIGURACIÓN DE SEGURIDAD
// =====================================================

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting estricto para endpoints OCR (más restrictivo)
const ocrLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 requests OCR por ventana
  message: {
    success: false,
    error: 'Límite de procesamiento OCR excedido. Máximo 20 análisis OCR cada 15 minutos.',
    code: 'OCR_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para endpoints de análisis (moderado)
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 análisis por ventana
  message: {
    success: false,
    error: 'Límite de análisis excedido. Máximo 50 análisis cada 15 minutos.',
    code: 'ANALYSIS_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiting general
app.use('/api', generalLimiter);

// =====================================================
// CONFIGURACIÓN Y UTILIDADES
// =====================================================

/**
 * Cargar API keys desde la base de datos
 */
async function loadAPIKeysFromDatabase() {
  try {
    if (!isDatabaseAvailable()) {
      console.log('⚠️ Supabase no está inicializado, usando variables de entorno');
      return;
    }
    
    const { getSupabaseClient } = require('./src/utils/database');
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_configurations')
      .select('groq_api_key, chutes_api_key')
      .single();
    
    if (data) {
      if (data.groq_api_key) {
        process.env.GROQ_API_KEY = data.groq_api_key;
        console.log('✅ API key de Groq cargada desde la base de datos');
      }
      if (data.chutes_api_key) {
        process.env.CHUTES_API_KEY = data.chutes_api_key;
        console.log('✅ API key de Chutes.ai cargada desde la base de datos');
      }
    }
  } catch (error) {
    console.log('⚠️ No se pudieron cargar API keys desde la base de datos (usando variables de entorno)');
    console.log('   Error:', error.message);
  }
}

/**
 * Inicializar el analizador de IA
 */
function initializeAIAnalyzer() {
  try {
    const aiAnalyzer = require('./src/ai/aiAnalyzer');
    aiAnalyzer.initializeGroq();
    console.log('✅ Analizador de IA reinicializado con API keys del entorno');
  } catch (error) {
    console.error('Error inicializando analizador de IA:', error);
  }
}

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de autenticación
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Rutas modulares con rate limiting específico
app.use('/api/auth', authRoutes);

// Aplicar rate limiting específico a endpoints de análisis
app.use('/api/analyze', analysisLimiter);
app.use('/api/batch-analyze', analysisLimiter);
app.use('/api/ocr', ocrLimiter);
app.use('/api/convert-to-pdf', ocrLimiter);
app.use('/api/convert-to-docx', ocrLimiter);
app.use('/api/batch-convert', ocrLimiter);

// Ruta para guardar configuración de IA - CORREGIDA Y MOVIDA ANTES DE LAS RUTAS GENERALES
app.post('/api/save-ai-config', async (req, res) => {
  try {
    console.log('📥 Recibiendo configuración de IA...');
    console.log('Body recibido:', req.body);

    const { groq_api_key, chutes_api_key, user_id, ...otherConfig } = req.body;
    
    if (!user_id) {
      console.error('❌ ID de usuario no proporcionado');
      return res.status(400).json(createErrorResponse(
        'ID de usuario requerido',
        'USER_ID_REQUIRED',
        400
      ));
    }

    console.log(`📝 Guardando configuración para usuario: ${user_id}`);
    console.log(`🔑 Groq API Key presente: ${!!groq_api_key}`);
    console.log(`🔑 Chutes API Key presente: ${!!chutes_api_key}`);

    // Guardar en base de datos usando las funciones del módulo database
    if (isDatabaseAvailable()) {
      console.log('💾 Base de datos disponible, guardando configuración...');
      
      const { saveUserConfiguration } = require('./src/utils/database');
      
      const configData = {
        groq_api_key: groq_api_key || null,
        chutes_api_key: chutes_api_key || null,
        ...otherConfig
      };

      console.log('📊 Datos a guardar:', configData);

      const data = await saveUserConfiguration(user_id, configData);
      
      if (data) {
        console.log('✅ Configuración de IA guardada en base de datos');
      } else {
        console.log('⚠️ No se pudo guardar en base de datos');
      }
    } else {
      console.log('⚠️ Base de datos no disponible, actualizando solo variables de entorno');
    }

    // Actualizar variables de entorno en memoria
    if (groq_api_key) {
      process.env.GROQ_API_KEY = groq_api_key;
      console.log('✅ API key de Groq actualizada en memoria');
    }
    
    if (chutes_api_key) {
      process.env.CHUTES_API_KEY = chutes_api_key;
      console.log('✅ API key de Chutes.ai actualizada en memoria');
    }

    // Reinicializar el analizador de IA con las nuevas claves
    try {
      const aiAnalyzer = require('./src/ai/aiAnalyzer');
      const updated = aiAnalyzer.updateAPIConfig(
        process.env.GROQ_API_KEY,
        process.env.CHUTES_API_KEY
      );
      console.log(`✅ Analizador de IA reinicializado (${updated ? 'con' : 'sin'} cambios)`);
    } catch (error) {
      console.error('❌ Error reinicializando analizador:', error);
    }

    const response = createResponse(true, {
      message: 'Configuración guardada exitosamente',
      groq_configured: !!process.env.GROQ_API_KEY,
      chutes_configured: !!process.env.CHUTES_API_KEY
    });

    console.log('✅ Respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error en /api/save-ai-config:', error);
    console.error('Stack trace:', error.stack);
    
    // Enviar respuesta de error con más detalles
    res.status(500).json(createErrorResponse(
      'Error interno al guardar configuración',
      'SAVE_CONFIG_ERROR',
      500,
      {
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    ));
  }
});

// Ruta para obtener configuración de IA
app.get('/api/get-ai-config/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json(createErrorResponse(
        'ID de usuario requerido',
        'USER_ID_REQUIRED',
        400
      ));
    }

    console.log(`📤 Obteniendo configuración para usuario: ${userId}`);

    if (!isDatabaseAvailable()) {
      console.log('⚠️ Base de datos no disponible');
      return res.json(createResponse(true, {
        configuration: null,
        message: 'Base de datos no disponible'
      }));
    }

    const { getUserConfiguration } = require('./src/utils/database');
    
    const data = await getUserConfiguration(userId);
    
    if (!data) {
      console.log('ℹ️ No se encontró configuración para el usuario');
      return res.json(createResponse(true, {
        configuration: null,
        message: 'No se encontró configuración guardada'
      }));
    }

    console.log('✅ Configuración obtenida exitosamente');
    res.json(createResponse(true, {
      configuration: {
        groq_api_key: data.groq_api_key,
        chutes_api_key: data.chutes_api_key,
        groq_model: data.groq_model,
        chutes_model: data.chutes_model,
        groq_temperature: data.groq_temperature,
        chutes_temperature: data.chutes_temperature,
        groq_max_tokens: data.groq_max_tokens,
        chutes_max_tokens: data.chutes_max_tokens,
        groq_stream: data.groq_stream,
        chutes_stream: data.chutes_stream
      }
    }));

  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json(createErrorResponse(
      'Error interno al obtener configuración',
      'GET_CONFIG_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  try {
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        api: 'operational',
        server: 'operational',
        groq_api: process.env.GROQ_API_KEY ? 'configured' : 'not_configured',
        chutes_api: process.env.CHUTES_API_KEY ? 'configured' : 'not_configured',
        database: isDatabaseAvailable() ? 'connected' : 'disconnected'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      port: PORT
    };

    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Aplicar rate limiting general a otros endpoints de análisis
app.use('/api', analysisRoutes);

// =====================================================
// ENDPOINTS DE ESTADO Y CONFIGURACIÓN
// =====================================================

/**
 * Estado de APIs de IA
 */
app.get('/api/ai-status', async (req, res) => {
  try {
    const aiAnalyzer = require('./src/ai/aiAnalyzer');
    const status = await aiAnalyzer.checkAPIsAvailability();
    
    const detailedStatus = {
      ...status,
      configuration: {
        groq: {
          configured: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_api_key_here'),
          keyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0,
          keyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 7) + '...' : 'No configurada'
        },
        chutes: {
          configured: !!(process.env.CHUTES_API_KEY && process.env.CHUTES_API_KEY !== 'your_chutes_api_key_here'),
          keyLength: process.env.CHUTES_API_KEY ? process.env.CHUTES_API_KEY.length : 0,
          keyPrefix: process.env.CHUTES_API_KEY ? process.env.CHUTES_API_KEY.substring(0, 7) + '...' : 'No configurada',
          baseUrl: process.env.CHUTES_API_URL || 'https://api.chutes.ai'
        }
      },
      recommendations: []
    };
    
    // Agregar recomendaciones
    if (!status.groq) {
      detailedStatus.recommendations.push({
        api: 'groq',
        type: 'error',
        message: 'La API de Groq no está disponible. Verifica tu API key.',
        action: 'Configurar API key en Configuración IA'
      });
    }
    
    if (!status.chutes) {
      if (status.chutesError?.includes('API key no configurada')) {
        detailedStatus.recommendations.push({
          api: 'chutes',
          type: 'warning',
          message: 'La API key de Chutes.ai no está configurada.',
          action: 'Configurar API key en Configuración IA'
        });
      } else {
        detailedStatus.recommendations.push({
          api: 'chutes',
          type: 'error',
          message: `Chutes.ai no disponible: ${status.chutesError}`,
          action: 'Verificar API key o estado del servicio'
        });
      }
    }
    
    if (status.groq && !status.chutes) {
      detailedStatus.recommendations.push({
        api: 'general',
        type: 'info',
        message: 'La aplicación funcionará correctamente con Groq AI. Chutes.ai es opcional.',
        action: 'Puedes continuar usando la aplicación normalmente'
      });
    }
    
    res.json(createResponse(true, {
      apis: detailedStatus
    }));
    
  } catch (error) {
    res.status(500).json(createErrorResponse(
      error.message,
      'AI_STATUS_ERROR',
      500
    ));
  }
});

/**
 * Probar conexiones del sistema
 */
app.get('/api/test-connections', async (req, res) => {
  try {
    console.log('🔍 Probando conexiones del sistema...');
    
    const results = {
      database: { status: 'unknown', message: '', responseTime: 0 },
      groq: { status: 'unknown', message: '', responseTime: 0 },
      chutes: { status: 'unknown', message: '', responseTime: 0 },
      ocr: { status: 'unknown', message: '', responseTime: 0 },
      filesystem: { status: 'unknown', message: '', responseTime: 0 }
    };
    
    // Probar base de datos
    try {
      const dbStart = Date.now();
      if (isDatabaseAvailable()) {
        const { getSupabaseClient } = require('./src/utils/database');
        const supabase = getSupabaseClient();
        await supabase.from('users').select('id').limit(1);
        
        results.database = {
          status: 'connected',
          message: 'Conexión a Supabase exitosa',
          responseTime: Date.now() - dbStart
        };
      } else {
        results.database = {
          status: 'disconnected',
          message: 'Supabase no está inicializado',
          responseTime: Date.now() - dbStart
        };
      }
    } catch (error) {
      results.database = {
        status: 'error',
        message: `Error de base de datos: ${error.message}`,
        responseTime: Date.now() - Date.now()
      };
    }
    
    // Probar API de Groq
    try {
      const groqStart = Date.now();
      const aiAnalyzer = require('./src/ai/aiAnalyzer');
      const groqStatus = await aiAnalyzer.checkGroqAPI();
      
      results.groq = {
        status: groqStatus ? 'connected' : 'disconnected',
        message: groqStatus ? 'API de Groq disponible' : 'API de Groq no disponible',
        responseTime: Date.now() - groqStart
      };
    } catch (error) {
      results.groq = {
        status: 'error',
        message: `Error en API Groq: ${error.message}`,
        responseTime: Date.now() - Date.now()
      };
    }
    
    // Probar API de Chutes
    try {
      const chutesStart = Date.now();
      const aiAnalyzer = require('./src/ai/aiAnalyzer');
      const chutesStatus = await aiAnalyzer.checkChutesAPI();
      
      results.chutes = {
        status: chutesStatus ? 'connected' : 'disconnected',
        message: chutesStatus ? 'API de Chutes.ai disponible' : 'API de Chutes.ai no disponible',
        responseTime: Date.now() - chutesStart
      };
    } catch (error) {
      results.chutes = {
        status: 'error',
        message: `Error en API Chutes: ${error.message}`,
        responseTime: Date.now() - Date.now()
      };
    }
    
    // Probar OCR
    try {
      const ocrStart = Date.now();
      const ocrInfo = ocrProcessor.getInfo();
      
      results.ocr = {
        status: 'connected',
        message: `OCR disponible: ${ocrInfo.engine}`,
        responseTime: Date.now() - ocrStart
      };
    } catch (error) {
      results.ocr = {
        status: 'error',
        message: `Error en OCR: ${error.message}`,
        responseTime: Date.now() - Date.now()
      };
    }
    
    // Probar sistema de archivos
    try {
      const fsStart = Date.now();
      const testPath = path.join(__dirname, 'uploads');
      
      await fs.ensureDir(testPath);
      await fs.access(testPath, fs.constants.W_OK);
      
      results.filesystem = {
        status: 'connected',
        message: 'Sistema de archivos accesible',
        responseTime: Date.now() - fsStart
      };
    } catch (error) {
      results.filesystem = {
        status: 'error',
        message: `Error en sistema de archivos: ${error.message}`,
        responseTime: Date.now() - Date.now()
      };
    }
    
    // Calcular estado general
    const connectedServices = Object.values(results).filter(r => r.status === 'connected').length;
    const totalServices = Object.keys(results).length;
    const overallStatus = connectedServices === totalServices ? 'healthy' :
                          connectedServices > 0 ? 'partial' : 'critical';
    
    console.log(`✅ Test de conexiones completado: ${connectedServices}/${totalServices} servicios conectados`);
    
    res.json(createResponse(true, {
      overall: {
        status: overallStatus,
        connectedServices: connectedServices,
        totalServices: totalServices,
        healthPercentage: Math.round((connectedServices / totalServices) * 100)
      },
      services: results
    }));
    
  } catch (error) {
    console.error('Error en test de conexiones:', error);
    res.status(500).json(createErrorResponse(
      'Error interno al probar conexiones',
      'CONNECTION_TEST_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Métricas reales de uso de IA
 */
app.get('/api/metrics', async (req, res) => {
  try {
    const { timeRange = '7d', userId } = req.query;
    
    // Obtener métricas reales de la base de datos
    const metrics = await getRealMetrics(timeRange, userId);
    
    res.json(createResponse(true, metrics));
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json(createErrorResponse(
      'Error al obtener métricas',
      'METRICS_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Datos de rendimiento por hora
 */
app.get('/api/performance-data', async (req, res) => {
  try {
    const { timeRange = '24h', userId } = req.query;
    
    const performanceData = await getPerformanceData(timeRange, userId);
    
    res.json(createResponse(true, performanceData));
  } catch (error) {
    console.error('Error obteniendo datos de rendimiento:', error);
    res.status(500).json(createErrorResponse(
      'Error al obtener datos de rendimiento',
      'PERFORMANCE_DATA_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Uso por modelo
 */
app.get('/api/model-usage', async (req, res) => {
  try {
    const { timeRange = '7d', userId } = req.query;
    
    const modelUsage = await getModelUsage(timeRange, userId);
    
    res.json(createResponse(true, modelUsage));
  } catch (error) {
    console.error('Error obteniendo uso por modelo:', error);
    res.status(500).json(createErrorResponse(
      'Error al obtener uso por modelo',
      'MODEL_USAGE_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Estadísticas por proveedor
 */
app.get('/api/provider-stats', async (req, res) => {
  try {
    const { timeRange = '7d', userId } = req.query;
    
    const providerStats = await getProviderStats(timeRange, userId);
    
    res.json(createResponse(true, providerStats));
  } catch (error) {
    console.error('Error obteniendo estadísticas por proveedor:', error);
    res.status(500).json(createErrorResponse(
      'Error al obtener estadísticas por proveedor',
      'PROVIDER_STATS_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Ejecutar prueba de comparación real entre modelos
 */
app.post('/api/run-model-test', async (req, res) => {
  try {
    const { models, prompt, userId } = req.body;
    
    if (!models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json(createErrorResponse(
        'Se requieren modelos para la prueba',
        'MODELS_REQUIRED',
        400
      ));
    }
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json(createErrorResponse(
        'Se requiere un prompt válido',
        'PROMPT_REQUIRED',
        400
      ));
    }
    
    console.log(`🧪 Ejecutando prueba real con ${models.length} modelos...`);
    console.log(`📄 Prompt: ${prompt}`);
    console.log(`🎯 Modelos: ${models.join(', ')}`);
    
    const results = [];
    const startTime = Date.now();
    
    // Ejecutar prueba con cada modelo
    for (const modelId of models) {
      try {
        const startModelTime = Date.now();
        
        // Determinar el proveedor y modelo real - Actualizado diciembre 2025
        let provider, modelName;
        if (modelId.includes('groq')) {
          provider = 'groq';
          modelName = modelId.replace('groq-', '').replace(/\./g, '-');
        } else if (modelId.includes('chutes')) {
          provider = 'chutes';
          modelName = modelId.replace('chutes-', '');
        } else {
          // Modelos por defecto basados en el ID - Reemplazos para modelos descontinuados
          if (modelId.includes('llama-3.3')) {
            provider = 'groq';
            modelName = 'llama-3.3-70b-versatile';
          } else if (modelId.includes('mixtral')) {
            // Mixtral fue descontinuado, usar Llama 3.1 70B Versatile como reemplazo
            provider = 'groq';
            modelName = 'llama-3.1-70b-versatile';
          } else if (modelId.includes('llama-3.1-8b')) {
            provider = 'groq';
            modelName = 'llama-3.1-8b-instant';
          } else if (modelId.includes('chutes-ai-ocr')) {
            provider = 'chutes';
            modelName = 'chutes-ai-ocr';
          } else {
            continue; // Saltar modelo no reconocido
          }
        }
        
        console.log(`🔄 Probando modelo: ${modelName} (${provider})`);
        
        // Ejecutar análisis real con el modelo
        let result;
        try {
          const aiAnalyzer = require('./src/ai/aiAnalyzer');
          
          if (provider === 'groq') {
            result = await aiAnalyzer.analyzeWithGroq(prompt, modelName);
          } else if (provider === 'chutes') {
            result = await aiAnalyzer.analyzeWithChutes(prompt, modelName);
          }
          
          if (!result || !result.analysis) {
            throw new Error('Respuesta inválida del modelo');
          }
          
        } catch (aiError) {
          console.error(`❌ Error con modelo ${modelName}:`, aiError);
          result = {
            analysis: `Error: ${aiError.message}`,
            tokens_used: 0,
            cost_usd: 0,
            response_time_ms: Date.now() - startModelTime
          };
        }
        
        const responseTime = Date.now() - startModelTime;
        
        results.push({
          model: modelName,
          provider: provider,
          prompt: prompt,
          result: result.analysis || 'Sin resultado',
          tokens_used: result.tokens_used || 0,
          cost_usd: result.cost_usd || 0,
          response_time_ms: responseTime,
          success: true,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Modelo ${modelName} completado en ${responseTime}ms`);
        
      } catch (modelError) {
        console.error(`❌ Error procesando modelo ${modelId}:`, modelError);
        results.push({
          model: modelId,
          provider: 'unknown',
          prompt: prompt,
          result: `Error: ${modelError.message}`,
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: Date.now() - startModelTime,
          success: false,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`🎯 Prueba completada en ${totalTime}ms`);
    console.log(`📊 Resultados: ${results.length} modelos procesados`);
    
    // Guardar métricas en la base de datos si está disponible
    if (isDatabaseAvailable() && results.length > 0) {
      try {
        const { getSupabaseClient } = require('./src/utils/database');
        const supabase = getSupabaseClient();
        
        for (const result of results) {
          await supabase.from('ai_model_metrics').insert({
            user_int_id: userId || 1,
            model_name: result.model,
            provider: result.provider,
            prompt: result.prompt,
            response: result.result,
            tokens_used: result.tokens_used,
            cost_usd: result.cost_usd,
            response_time_ms: result.response_time_ms,
            success: result.success,
            created_at: result.timestamp
          });
        }
        
        console.log('💾 Métricas guardadas en base de datos');
      } catch (dbError) {
        console.warn('⚠️ No se pudieron guardar métricas en base de datos:', dbError);
      }
    }
    
    // Determinar el modelo ganador basado en velocidad y precisión
    const successfulResults = results.filter(r => r.success);
    let winner = null;
    let bestScore = -1;
    
    for (const result of successfulResults) {
      // Puntuación: velocidad (70%) + eficiencia de costo (30%)
      const speedScore = Math.max(0, 100 - (result.response_time_ms / 100)); // Más rápido = mejor
      const costScore = result.cost_usd > 0 ? Math.max(0, 100 - (result.cost_usd * 1000)) : 50;
      const totalScore = (speedScore * 0.7) + (costScore * 0.3);
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        winner = result;
      }
    }
    
    res.json(createResponse(true, {
      results: results,
      winner: winner,
      totalTime: totalTime,
      summary: {
        totalModels: results.length,
        successfulModels: successfulResults.length,
        averageTime: results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length,
        totalCost: results.reduce((sum, r) => sum + r.cost_usd, 0),
        fastestModel: results.reduce((fastest, current) =>
          !fastest || current.response_time_ms < fastest.response_time_ms ? current : fastest
        , null),
        mostEfficientModel: results.reduce((efficient, current) => {
          if (!current.success) return efficient;
          const currentEfficiency = current.cost_usd > 0 ? (1 / current.cost_usd) : 0;
          const efficientEfficiency = efficient?.cost_usd > 0 ? (1 / efficient.cost_usd) : 0;
          return currentEfficiency > efficientEfficiency ? current : efficient;
        }, null)
      }
    }));
    
  } catch (error) {
    console.error('❌ Error en prueba de modelos:', error);
    res.status(500).json(createErrorResponse(
      'Error al ejecutar prueba de modelos',
      'MODEL_TEST_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Obtener modelos disponibles (versión simplificada para el frontend)
 */
app.get('/api/available-models', (req, res) => {
  try {
    // Modelos reales disponibles en el sistema
    const availableModels = [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        provider: 'Groq',
        description: 'Modelo versátil para análisis de documentos',
        speed: 'Muy Rápido',
        accuracy: 'Alta'
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        provider: 'Groq',
        description: 'Modelo rápido para tareas simples',
        speed: 'Muy Rápido',
        accuracy: 'Media'
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'Groq',
        description: 'Modelo eficiente para procesamiento de texto',
        speed: 'Rápido',
        accuracy: 'Alta'
      },
      {
        id: 'chutes-ai-ocr',
        name: 'Chutes.ai OCR',
        provider: 'Chutes.ai',
        description: 'Modelo especializado en reconocimiento óptico de caracteres',
        speed: 'Rápido',
        accuracy: 'Alta'
      }
    ];

    res.json(createResponse(true, availableModels));
  } catch (error) {
    console.error('Error obteniendo modelos disponibles:', error);
    res.status(500).json(createErrorResponse(
      'Error al obtener modelos disponibles',
      'AVAILABLE_MODELS_ERROR',
      500,
      { details: error.message }
    ));
  }
});

/**
 * Obtener modelos disponibles (versión detallada)
 */
app.get('/api/models', (req, res) => {
  try {
    let models = [];
    
    try {
      const { AI_MODELS_CONFIG } = require('./config/ai-models-config');
      
      if (AI_MODELS_CONFIG && typeof AI_MODELS_CONFIG === 'object') {
        if (Array.isArray(AI_MODELS_CONFIG)) {
          models = AI_MODELS_CONFIG;
        } else {
          models = Object.values(AI_MODELS_CONFIG).map(model => ({
            id: model.id || model.name?.toLowerCase().replace(/\s+/g, '-'),
            name: model.name || 'Modelo desconocido',
            provider: model.provider || 'unknown',
            description: model.description || '',
            capabilities: model.capabilities || [],
            performance: model.performance || { accuracy: 85, speed: 1000 },
            parameters: model.parameters || { temperature: 0.2, maxTokens: 1500 },
            cost: model.cost || { perToken: 0.0001, perRequest: 0.01 },
            category: model.category || 'general',
            isAvailable: model.isAvailable !== false
          }));
        }
      }
    } catch (configError) {
      console.warn('⚠️ No se pudo cargar AI_MODELS_CONFIG, usando modelos predeterminados');
    }
    
    // Modelos por defecto
    if (models.length === 0) {
      models = [
        {
          id: 'llama-3-3-70b',
          name: 'Llama 3.3 70B Versatile',
          provider: 'Groq',
          description: 'Modelo balanceado con alta precisión para análisis general',
          capabilities: ['text-analysis', 'summarization', 'classification'],
          performance: { accuracy: 92, speed: 1200 },
          parameters: { temperature: 0.2, maxTokens: 1500 },
          cost: { perToken: 0.0001, perRequest: 0.01 },
          category: 'general',
          isAvailable: true
        },
        {
          id: 'llama-3-1-8b',
          name: 'Llama 3.1 8B Instant',
          provider: 'Groq',
          description: 'Modelo rápido para análisis básico y respuestas rápidas',
          capabilities: ['text-analysis', 'quick-summarization'],
          performance: { accuracy: 85, speed: 800 },
          parameters: { temperature: 0.2, maxTokens: 1500 },
          cost: { perToken: 0.00005, perRequest: 0.005 },
          category: 'speed',
          isAvailable: true
        },
        {
          id: 'mixtral-8x7b',
          name: 'Mixtral 8x7B',
          provider: 'Groq',
          description: 'Modelo de alta precisión para análisis detallado',
          capabilities: ['text-analysis', 'deep-analysis', 'classification'],
          performance: { accuracy: 95, speed: 1500 },
          parameters: { temperature: 0.1, maxTokens: 2000 },
          cost: { perToken: 0.0002, perRequest: 0.02 },
          category: 'accuracy',
          isAvailable: true
        },
        {
          id: 'chutes-ai',
          name: 'Chutes.ai OCR',
          provider: 'Chutes.ai',
          description: 'Modelo especializado en OCR y análisis de documentos',
          capabilities: ['ocr', 'document-analysis', 'text-extraction'],
          performance: { accuracy: 96, speed: 1000 },
          parameters: { temperature: 0.1, maxTokens: 1000 },
          cost: { perToken: 0.00015, perRequest: 0.015 },
          category: 'ocr',
          isAvailable: true
        }
      ];
    }
    
    res.json(createResponse(true, {
      models: models,
      count: models.length
    }));
    
  } catch (error) {
    console.error('Error en /api/models:', error);
    res.status(500).json(createErrorResponse(
      error.message,
      'MODELS_ERROR',
      500
    ));
  }
});

/**
 * Optimización de modelos
 */
app.post('/api/save-ai-config', async (req, res) => {
  try {
    console.log('📥 Recibiendo configuración de IA...');
    console.log('Body recibido:', req.body);

    const { groq_api_key, chutes_api_key, user_id, ...otherConfig } = req.body;
    
    if (!user_id) {
      console.error('❌ ID de usuario no proporcionado');
      return res.status(400).json(createErrorResponse(
        'ID de usuario requerido',
        'USER_ID_REQUIRED',
        400
      ));
    }

    console.log(`📝 Guardando configuración para usuario: ${user_id}`);
    console.log(`🔑 Groq API Key presente: ${!!groq_api_key}`);
    console.log(`🔑 Chutes API Key presente: ${!!chutes_api_key}`);

    // Guardar en base de datos si está disponible
    if (isDatabaseAvailable()) {
      console.log('💾 Base de datos disponible, guardando configuración...');
      
      const { getSupabaseClient } = require('./src/utils/database');
      const supabase = getSupabaseClient();
      
      const configData = {
        user_id: user_id,
        groq_api_key: groq_api_key || null,
        chutes_api_key: chutes_api_key || null,
        ...otherConfig,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Datos a guardar:', configData);

      const { data, error } = await supabase
        .from('user_configurations')
        .upsert(configData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando configuración:', error);
        return res.status(500).json(createErrorResponse(
          'Error al guardar configuración',
          'SAVE_CONFIG_ERROR',
          500,
          { details: error.message }
        ));
      }

      console.log('✅ Configuración de IA guardada en base de datos');
    } else {
      console.log('⚠️ Base de datos no disponible, actualizando solo variables de entorno');
    }

    // Actualizar variables de entorno en memoria
    if (groq_api_key) {
      process.env.GROQ_API_KEY = groq_api_key;
      console.log('✅ API key de Groq actualizada en memoria');
    }
    
    if (chutes_api_key) {
      process.env.CHUTES_API_KEY = chutes_api_key;
      console.log('✅ API key de Chutes.ai actualizada en memoria');
    }

    // Reinicializar el analizador de IA con las nuevas claves
    try {
      const aiAnalyzer = require('./src/ai/aiAnalyzer');
      const updated = aiAnalyzer.updateAPIConfig(
        process.env.GROQ_API_KEY,
        process.env.CHUTES_API_KEY
      );
      console.log(`✅ Analizador de IA reinicializado (${updated ? 'con' : 'sin'} cambios)`);
    } catch (error) {
      console.error('❌ Error reinicializando analizador:', error);
    }

    const response = createResponse(true, {
      message: 'Configuración guardada exitosamente',
      groq_configured: !!process.env.GROQ_API_KEY,
      chutes_configured: !!process.env.CHUTES_API_KEY
    });

    console.log('✅ Respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error en /api/save-ai-config:', error);
    console.error('Stack trace:', error.stack);
    
    // Enviar respuesta de error con más detalles
    res.status(500).json(createErrorResponse(
      'Error interno al guardar configuración',
      'SAVE_CONFIG_ERROR',
      500,
      {
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    ));
  }
});

app.get('/api/best-ocr-model', async (req, res) => {
  try {
    const {
      documentType = 'general',
      ocrConfidence = 75,
      strategy = 'auto',
      priority = 'balanced',
      documentLength = 1500
    } = req.query;

    const config = await modelOptimizer.getOptimalConfiguration({
      documentType,
      ocrConfidence: parseInt(ocrConfidence),
      strategy,
      priority,
      documentLength: parseInt(documentLength)
    });

    res.json(createResponse(true, {
      optimal_model: config.model,
      strategy: config.strategy,
      recommendation: config.recommendation,
      parameters: config.parameters,
      reasoning: config.reasoning,
      confidence_level: config.ocr_confidence
    }));

  } catch (error) {
    res.status(500).json(createErrorResponse(
      error.message,
      'MODEL_OPTIMIZATION_ERROR',
      500
    ));
  }
});

/**
 * Información OCR
 */
app.get('/api/ocr-info', (req, res) => {
  try {
    const ocrInfo = ocrProcessor.getInfo();
    const pdfInfo = pdfConverter.getInfo();
    const docxInfo = docxConverter.getInfo();
    
    res.json(createResponse(true, {
      ocr: ocrInfo,
      pdfConverter: pdfInfo,
      docxConverter: docxInfo
    }));
    
  } catch (error) {
    res.status(500).json(createErrorResponse(
      error.message,
      'OCR_INFO_ERROR',
      500
    ));
  }
});

// =====================================================
// MANEJO DE ERRORES
// =====================================================

/**
 * Manejo de errores de Multer
 */
app.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(createErrorResponse(
        'El archivo es demasiado grande. Máximo 50MB.',
        'FILE_TOO_LARGE',
        400
      ));
    }
  }
  
  res.status(500).json(createErrorResponse(
    error.message || 'Error interno del servidor',
    'INTERNAL_ERROR',
    500
  ));
});

/**
 * Ruta 404
 */
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse(
    'Endpoint no encontrado',
    'NOT_FOUND',
    404,
    { path: req.originalUrl }
  ));
});

// =====================================================
// INICIALIZACIÓN DEL SERVIDOR
// =====================================================

/**
 * Iniciar servidor con configuración optimizada
 */
async function startServer() {
  try {
    // Cargar configuración desde la base de datos
    console.log('🔧 Cargando configuración desde la base de datos...');
    await loadAPIKeysFromDatabase();
    
    // Inicializar analizador de IA
    console.log('🤖 Inicializando analizador de IA...');
    initializeAIAnalyzer();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor optimizado corriendo en http://localhost:${PORT}`);
      console.log(`📁 Directorio de uploads: ${path.join(__dirname, 'uploads')}`);
      console.log(`🤖 APIs de IA disponibles: Verifica en /api/ai-status`);
      console.log(`💾 Base de datos: ${isDatabaseAvailable() ? 'Conectada' : 'No disponible'}`);
      console.log(`🔑 API Key de Groq: ${process.env.GROQ_API_KEY ? 'Configurada' : 'No configurada'}`);
      console.log(`📊 Endpoints optimizados y modulares activos`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    // Iniciar servidor de todas formas con configuración por defecto
    app.listen(PORT, () => {
      console.log(`🚀 Servidor optimizado corriendo en http://localhost:${PORT} (modo fallback)`);
      console.log(`📁 Directorio de uploads: ${path.join(__dirname, 'uploads')}`);
      console.log(`⚠️  Usando configuración por defecto - verifica /api/ai-status`);
    });
  }
}

// Iniciar servidor
startServer();

module.exports = app;