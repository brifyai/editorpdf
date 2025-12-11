/**
 * Netlify Function Handler para Document Analyzer
 * Este archivo actúa como adaptador entre el servidor Express y Netlify Functions
 */

// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

// Importar el servidor Express existente
const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// =====================================================
// IMPORTAR RUTAS DEL SERVIDOR EXISTENTE
// =====================================================

// Importar middleware y utilidades
const { optionalAuth } = require('../../../src/middleware/auth');
const {
  createResponse,
  createErrorResponse,
  isDatabaseAvailable,
  getRealMetrics,
  getPerformanceData,
  getModelUsage,
  getProviderStats
} = require('../../../src/utils/database');

// Importar rutas modulares
const analysisRoutes = require('../../../src/routes/analysis');
const authRoutes = require('../../../src/routes/auth');

// Importar parsers y procesadores
const pdfAnalyzer = require('../../../src/parsers/pdfAnalyzer');
const pptxAnalyzer = require('../../../src/parsers/pptxAnalyzer');
const OCRProcessor = require('../../../src/ocr/ocrProcessor');
const ImageToPDFConverter = require('../../../src/ocr/imageToPDFConverter');
const ImageToDocxConverter = require('../../../src/ocr/imageToDocxConverter');
const { modelOptimizer } = require('../../../src/ai/modelOptimizer');

// Inicializar procesadores
const ocrProcessor = new OCRProcessor();
const pdfConverter = new ImageToPDFConverter();
const docxConverter = new ImageToDocxConverter();

// =====================================================
// CONFIGURACIÓN DE SEGURIDAD
// =====================================================

const rateLimit = require('express-rate-limit');

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para endpoints OCR
const ocrLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Límite de procesamiento OCR excedido. Máximo 20 análisis OCR cada 15 minutos.',
    code: 'OCR_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para endpoints de análisis
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Límite de análisis excedido. Máximo 50 análisis cada 15 minutos.',
    code: 'ANALYSIS_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiting
app.use('/api', generalLimiter);
app.use('/api/analyze', analysisLimiter);
app.use('/api/batch-analyze', analysisLimiter);
app.use('/api/ocr', ocrLimiter);
app.use('/api/convert-to-pdf', ocrLimiter);
app.use('/api/convert-to-docx', ocrLimiter);
app.use('/api/batch-convert', ocrLimiter);

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);

// Importar endpoints específicos del servidor principal
function setupAPIEndpoints() {
  // Cargar API keys desde la base de datos
  async function loadAPIKeysFromDatabase() {
    try {
      if (!isDatabaseAvailable()) {
        console.log('⚠️ Supabase no está inicializado, usando variables de entorno');
        return;
      }
      
      const { getSupabaseClient } = require('../../../src/utils/database');
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
      console.log('⚠️ No se pudieron cargar API keys desde la base de datos');
      console.log('   Error:', error.message);
    }
  }

  // Inicializar analizador de IA
  function initializeAIAnalyzer() {
    try {
      const aiAnalyzer = require('../../../src/ai/aiAnalyzer');
      aiAnalyzer.initializeGroq();
      console.log('✅ Analizador de IA reinicializado con API keys del entorno');
    } catch (error) {
      console.error('Error inicializando analizador de IA:', error);
    }
  }

  // Endpoint para guardar configuración de IA
  app.post('/api/save-ai-config', async (req, res) => {
    try {
      console.log('📥 Recibiendo configuración de IA...');
      const { groq_api_key, chutes_api_key, user_id, ...otherConfig } = req.body;
      
      if (!user_id) {
        return res.status(400).json(createErrorResponse(
          'ID de usuario requerido',
          'USER_ID_REQUIRED',
          400
        ));
      }

      // Guardar en base de datos si está disponible
      if (isDatabaseAvailable()) {
        const { saveUserConfiguration } = require('../../../src/utils/database');
        const configData = {
          groq_api_key: groq_api_key || null,
          chutes_api_key: chutes_api_key || null,
          ...otherConfig
        };
        await saveUserConfiguration(user_id, configData);
      }

      // Actualizar variables de entorno en memoria
      if (groq_api_key) process.env.GROQ_API_KEY = groq_api_key;
      if (chutes_api_key) process.env.CHUTES_API_KEY = chutes_api_key;

      // Reinicializar analizador de IA
      try {
        const aiAnalyzer = require('../../../src/ai/aiAnalyzer');
        aiAnalyzer.updateAPIConfig(process.env.GROQ_API_KEY, process.env.CHUTES_API_KEY);
      } catch (error) {
        console.error('❌ Error reinicializando analizador:', error);
      }

      res.json(createResponse(true, {
        message: 'Configuración guardada exitosamente',
        groq_configured: !!process.env.GROQ_API_KEY,
        chutes_configured: !!process.env.CHUTES_API_KEY
      }));

    } catch (error) {
      console.error('❌ Error en /api/save-ai-config:', error);
      res.status(500).json(createErrorResponse(
        'Error interno al guardar configuración',
        'SAVE_CONFIG_ERROR',
        500,
        { details: error.message }
      ));
    }
  });

  // Endpoint para obtener configuración de IA
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

      if (!isDatabaseAvailable()) {
        return res.json(createResponse(true, {
          configuration: null,
          message: 'Base de datos no disponible'
        }));
      }

      const { getUserConfiguration } = require('../../../src/utils/database');
      const data = await getUserConfiguration(userId);
      
      if (!data) {
        return res.json(createResponse(true, {
          configuration: null,
          message: 'No se encontró configuración guardada'
        }));
      }

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

  // Endpoint de estado de APIs de IA
  app.get('/api/ai-status', async (req, res) => {
    try {
      const aiAnalyzer = require('../../../src/ai/aiAnalyzer');
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
      
      res.json(createResponse(true, { apis: detailedStatus }));
      
    } catch (error) {
      res.status(500).json(createErrorResponse(
        error.message,
        'AI_STATUS_ERROR',
        500
      ));
    }
  });

  // Endpoint para probar conexiones
  app.get('/api/test-connections', async (req, res) => {
    try {
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
          const { getSupabaseClient } = require('../../../src/utils/database');
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
          responseTime: 0
        };
      }
      
      // Probar API de Groq
      try {
        const groqStart = Date.now();
        const aiAnalyzer = require('../../../src/ai/aiAnalyzer');
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
          responseTime: 0
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
          responseTime: 0
        };
      }
      
      // Calcular estado general
      const connectedServices = Object.values(results).filter(r => r.status === 'connected').length;
      const totalServices = Object.keys(results).length;
      const overallStatus = connectedServices === totalServices ? 'healthy' :
                            connectedServices > 0 ? 'partial' : 'critical';
      
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

  // Endpoint de modelos disponibles
  app.get('/api/models', (req, res) => {
    try {
      let models = [];
      
      try {
        const { AI_MODELS_CONFIG } = require('./ai-models-config.js');
        
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
          }
        ];
      }
      
      res.json(createResponse(true, { models: models, count: models.length }));
      
    } catch (error) {
      console.error('Error en /api/models:', error);
      res.status(500).json(createErrorResponse(
        error.message,
        'MODELS_ERROR',
        500
      ));
    }
  });

  // Endpoint de modelos disponibles (simplificado)
  app.get('/api/available-models', (req, res) => {
    try {
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

  // Endpoint de información OCR
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

  // Inicializar configuración
  loadAPIKeysFromDatabase().then(() => {
    initializeAIAnalyzer();
  });
}

// Configurar endpoints
setupAPIEndpoints();

// =====================================================
// EXPORTAR PARA NETLIFY FUNCTIONS
// =====================================================

// Exportar el handler para Netlify Functions
module.exports.handler = serverless(app);

// También exportar la app para testing
module.exports.app = app;