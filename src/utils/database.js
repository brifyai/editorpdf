/**
 * Utilidades para operaciones de base de datos
 * Patrones reutilizables para eliminar código duplicado
 */

const { supabaseClient } = require('../database/supabaseClient');

/**
 * Respuesta estándar para endpoints
 */
const createResponse = (success, data = null, error = null, metadata = {}) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  if (success) {
    response.data = data;
  } else {
    response.error = error;
  }

  return response;
};

/**
 * Respuesta de error con código específico
 */
const createErrorResponse = (error, code = 'UNKNOWN_ERROR', statusCode = 500, details = null) => {
  return createResponse(false, null, {
    message: error.message || error,
    code,
    details
  }, { statusCode });
};

/**
 * Verificar si la base de datos está disponible
 */
const isDatabaseAvailable = () => {
  return supabaseClient.isInitialized();
};

/**
 * Obtener cliente de Supabase con manejo de errores
 */
const getSupabaseClient = () => {
  if (!isDatabaseAvailable()) {
    throw new Error('Base de datos no disponible');
  }
  return supabaseClient.getClient();
};

/**
 * Ejecutar operación de base de datos con manejo de errores
 */
const executeDbOperation = async (operation, fallback = null) => {
  try {
    if (!isDatabaseAvailable()) {
      if (fallback !== null) {
        return fallback;
      }
      throw new Error('Base de datos no disponible');
    }

    const supabase = getSupabaseClient();
    return await operation(supabase);
  } catch (error) {
    console.error('Error en operación de base de datos:', error);
    
    if (fallback !== null) {
      return fallback;
    }
    
    throw error;
  }
};

/**
 * Guardar configuración de usuario con manejo de errores
 */
const saveUserConfiguration = async (userId, config) => {
  return executeDbOperation(async (supabase) => {
    // Intentar crear la tabla si no existe
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .upsert({
          user_int_id: userId,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // Si el error es porque la tabla no existe, intentar crearla
        if (error.code === 'PGRST204' || error.message?.includes('schema cache')) {
          console.log('⚠️ Tabla user_configurations no existe, intentando crearla...');
          
          // Crear la tabla manualmente con la columna correcta
          await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS public.user_configurations (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                user_int_id BIGINT NOT NULL,
                groq_api_key TEXT,
                chutes_api_key TEXT,
                groq_model TEXT,
                chutes_model TEXT,
                groq_temperature DECIMAL(3,2),
                chutes_temperature DECIMAL(3,2),
                groq_max_tokens INTEGER,
                chutes_max_tokens INTEGER,
                groq_stream BOOLEAN DEFAULT true,
                chutes_stream BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                UNIQUE(user_int_id)
              );

              ALTER TABLE public.user_configurations ENABLE ROW LEVEL SECURITY;

              CREATE POLICY "Users can view own config" ON public.user_configurations
                  FOR SELECT USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

              CREATE POLICY "Users can update own config" ON public.user_configurations
                  FOR ALL USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);
            `
          });

          // Intentar nuevamente después de crear la tabla
          const retryResult = await supabase
            .from('user_configurations')
            .upsert({
              user_int_id: userId,
              ...config,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          return retryResult.data;
        }
        throw error;
      }

      return data;
    } catch (createError) {
      console.error('Error creando tabla o guardando configuración:', createError);
      // Si no podemos crear la tabla, retornar null para que use solo variables de entorno
      return null;
    }
  }, null); // Fallback a null si hay errores críticos
};

/**
 * Obtener configuración de usuario
 */
const getUserConfiguration = async (userId) => {
  return executeDbOperation(async (supabase) => {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .select('*')
        .eq('user_int_id', userId)
        .single();

      // Si no hay datos, retornar null sin error
      if (error && error.code === 'PGRST116') {
        return null;
      }

      if (error && error.code === 'PGRST204') {
        console.log('⚠️ Tabla user_configurations no existe');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return null;
    }
  }, null);
};

/**
 * Obtener métricas reales de uso de IA
 */
const getRealMetrics = async (timeRange = '7d', userId = null) => {
  try {
    // Verificar si la base de datos está disponible
    if (!isDatabaseAvailable()) {
      console.log('⚠️ Base de datos no disponible, usando métricas por defecto');
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 0,
        activeModels: 0,
        topModel: 'Ninguno',
        mostUsedProvider: 'Ninguno',
        dataSource: 'database_unavailable',
        lastUpdate: new Date().toISOString(),
        documentAnalyses: 0,
        activeUsers: 0,
        savedConfigurations: 0
      };
    }

    const supabase = getSupabaseClient();
    
    // Calcular fecha de inicio según el rango de tiempo
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`📊 Obteniendo métricas reales desde ${startDate.toISOString()}`);

    // MÉTRICAS REALES DESDE TABLAS EXISTENTES
    
    // 1. Contar análisis de documentos reales
    const { data: documentAnalyses, error: docError } = await supabase
      .from('analysis_results')
      .select('id, status, results, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    if (docError) {
      console.warn('⚠️ Error consultando analysis_results:', docError.message);
    } else {
      console.log(`📄 Documentos analizados encontrados: ${documentAnalyses?.length || 0}`);
    }

    // 2. Contar usuarios activos
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('is_active', true)
      .gte('created_at', startDate.toISOString());

    if (usersError) {
      console.warn('⚠️ Error consultando users:', usersError.message);
    } else {
      console.log(`👥 Usuarios activos encontrados: ${users?.length || 0}`);
    }

    // 3. Contar configuraciones guardadas (uso de IA)
    const { data: configurations, error: configError } = await supabase
      .from('user_configurations')
      .select('id, updated_at')
      .gte('updated_at', startDate.toISOString());

    if (configError) {
      console.warn('⚠️ Error consultando user_configurations:', configError.message);
    } else {
      console.log(`⚙️ Configuraciones guardadas encontradas: ${configurations?.length || 0}`);
    }

    // PROCESAR MÉTRICAS REALES - SOLO DATOS REALES, NO ESTIMACIONES
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let totalResponseTime = 0;
    let successCount = 0;
    const modelCounts = {};
    const providerCounts = {};

    // Procesar análisis de documentos REALES únicamente
    if (documentAnalyses && documentAnalyses.length > 0) {
      documentAnalyses.forEach(analysis => {
        totalRequests++;
        successCount++;
        
        // Extraer métricas REALES del campo results (JSON)
        const results = analysis.results || {};
        const processingTime = results.processingTime || 0;
        const wordCount = results.wordCount || 0;
        const fileSize = results.fileSize || 0;
        
        totalResponseTime += processingTime;
        totalTokens += wordCount; // Usar valor real, no estimación
        totalCost += results.cost_usd || 0; // Usar costo real si existe

        // Determinar modelo basado en el tipo de análisis REAL
        let modelName = 'Desconocido';
        let provider = 'Desconocido';
        
        if (results.analysisType) {
          if (results.analysisType.includes('ocr')) {
            modelName = 'tesseract-5-spanish';
            provider = 'tesseract';
          } else if (results.analysisType.includes('advanced')) {
            modelName = 'llama-3.1-70b-versatile';
            provider = 'groq';
          } else {
            modelName = 'llama-3.3-70b-versatile';
            provider = 'groq';
          }
        }

        // Contar por modelo
        modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;

        // Contar por proveedor
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });
    }

    // NO agregar estimaciones basadas en usuarios - solo datos reales de análisis
    // Los usuarios no generan requests automáticamente

    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests / 1000 : 0;

    // Encontrar el modelo más usado
    const topModel = Object.keys(modelCounts).length > 0
      ? Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b)
      : 'Ninguno';

    // Encontrar el proveedor más usado
    const mostUsedProvider = Object.keys(providerCounts).length > 0
      ? Object.keys(providerCounts).reduce((a, b) => providerCounts[a] > providerCounts[b] ? a : b)
      : 'Ninguno';

    const result = {
      totalRequests,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(2)),
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(1)),
      activeModels: Object.keys(modelCounts).length,
      topModel,
      mostUsedProvider,
      dataSource: 'real_database',
      lastUpdate: new Date().toISOString(),
      documentAnalyses: documentAnalyses?.length || 0,
      activeUsers: users?.length || 0,
      savedConfigurations: configurations?.length || 0
    };

    console.log('✅ Métricas reales calculadas:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en getRealMetrics:', error);
    // En caso de error, devolver métricas en cero en lugar de fallback
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      successRate: 0,
      activeModels: 0,
      topModel: 'Ninguno',
      mostUsedProvider: 'Ninguno',
      dataSource: 'error_fallback',
      lastUpdate: new Date().toISOString(),
      documentAnalyses: 0,
      activeUsers: 0,
      savedConfigurations: 0,
      error: error.message
    };
  }
};

/**
 * Obtener datos de rendimiento por hora
 */
const getPerformanceData = async (timeRange = '24h', userId = null) => {
  return executeDbOperation(async (supabase) => {
    const hours = timeRange === '24h' ? 24 : 24; // Siempre 24 horas para el gráfico
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    // Obtener datos agrupados por hora
    const { data, error } = await supabase
      .from('ai_model_metrics')
      .select('created_at, response_time_ms, cost_usd')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por hora
    const hourlyData = {};
    
    data.forEach(metric => {
      const hour = new Date(metric.created_at).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { requests: 0, tokens: 0, cost: 0 };
      }
      
      hourlyData[hourKey].requests++;
      hourlyData[hourKey].tokens += metric.tokens_used || 0;
      hourlyData[hourKey].cost += metric.cost_usd || 0;
    });

    // Convertir a array ordenado por hora
    const result = Object.keys(hourlyData).map(hour => ({
      time: hour,
      requests: hourlyData[hour].requests,
      tokens: hourlyData[hour].tokens,
      cost: parseFloat(hourlyData[hour].cost.toFixed(2))
    }));

    // Rellenar horas faltantes con ceros
    const allHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const finalResult = allHours.map(hour => {
      const existing = result.find(r => r.time === hour);
      return existing || { time: hour, requests: 0, tokens: 0, cost: 0 };
    });

    return finalResult;
  }, []);
};

/**
 * Obtener uso por modelo
 */
const getModelUsage = async (timeRange = '7d', userId = null) => {
  return executeDbOperation(async (supabase) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_model_metrics')
      .select('model_name, provider, success, response_time_ms, cost_usd')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por modelo
    const modelData = {};
    
    data.forEach(metric => {
      const modelName = metric.model_name || 'Desconocido';
      const provider = metric.provider || 'Desconocido';
      
      if (!modelData[modelName]) {
        modelData[modelName] = {
          model: modelName,
          requests: 0,
          percentage: 0,
          cost: 0,
          avgTime: 0,
          successCount: 0,
          totalTime: 0
        };
      }
      
      modelData[modelName].requests++;
      modelData[modelName].cost += metric.cost_usd || 0;
      modelData[modelName].totalTime += metric.response_time_ms || 0;
      if (metric.success) {
        modelData[modelName].successCount++;
      }
    });

    // Calcular porcentajes y tiempos promedio
    const totalRequests = Object.values(modelData).reduce((sum, model) => sum + model.requests, 0);
    
    const result = Object.values(modelData).map(model => ({
      model: model.model,
      requests: model.requests,
      percentage: totalRequests > 0 ? parseFloat(((model.requests / totalRequests) * 100).toFixed(1)) : 0,
      cost: parseFloat(model.cost.toFixed(2)),
      avgTime: model.requests > 0 ? parseFloat((model.totalTime / model.requests / 1000).toFixed(1)) : 0
    }));

    // Ordenar por cantidad de solicitudes
    return result.sort((a, b) => b.requests - a.requests);
  }, []);
};

/**
 * Obtener estadísticas por proveedor
 */
const getProviderStats = async (timeRange = '7d', userId = null) => {
  return executeDbOperation(async (supabase) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_model_metrics')
      .select('provider, success, response_time_ms, cost_usd')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por proveedor
    const providerData = {};
    
    data.forEach(metric => {
      const provider = metric.provider || 'Desconocido';
      
      if (!providerData[provider]) {
        providerData[provider] = {
          provider: provider,
          requests: 0,
          cost: 0,
          avgTime: 0,
          successRate: 0,
          successCount: 0,
          totalTime: 0
        };
      }
      
      providerData[provider].requests++;
      providerData[provider].cost += metric.cost_usd || 0;
      providerData[provider].totalTime += metric.response_time_ms || 0;
      if (metric.success) {
        providerData[provider].successCount++;
      }
    });

    // Calcular promedios y tasas de éxito
    const result = Object.values(providerData).map(provider => ({
      provider: provider.provider,
      requests: provider.requests,
      cost: parseFloat(provider.cost.toFixed(2)),
      avgTime: provider.requests > 0 ? parseFloat((provider.totalTime / provider.requests / 1000).toFixed(1)) : 0,
      successRate: provider.requests > 0 ? parseFloat(((provider.successCount / provider.requests) * 100).toFixed(1)) : 0,
      color: provider.provider === 'groq' ? '#f59e0b' : provider.provider === 'chutes' ? '#3b82f6' : '#6b7280',
      icon: provider.provider === 'groq' ? '⚡' : provider.provider === 'chutes' ? '📄' : '❓'
    }));

    // Ordenar por cantidad de solicitudes
    return result.sort((a, b) => b.requests - a.requests);
  }, []);
};

/**
 * Establecer contexto de usuario para RLS
 */
const setUserContext = async (userId) => {
  return executeDbOperation(async (supabase) => {
    try {
      // Establecer configuración para RLS
      await supabase.rpc('set_config', {
        config_name: 'app.current_user_id',
        config_value: userId.toString()
      });
      console.log(`✅ Contexto de usuario establecido: ${userId}`);
    } catch (error) {
      console.warn('⚠️ No se pudo establecer contexto de usuario:', error.message);
      // No lanzar error, continuar sin contexto RLS
    }
  }, null);
};

/**
 * Guardar documento en la base de datos
 */
const saveDocument = async (documentData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Guardar análisis en la base de datos
 */
const saveAnalysis = async (analysisData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('document_analyses')
      .insert(analysisData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Guardar resultados básicos
 */
const saveBasicResults = async (basicData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('analysis_results_basic')
      .insert(basicData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Guardar resultados avanzados
 */
const saveAdvancedResults = async (advancedData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('analysis_results_advanced')
      .insert(advancedData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Guardar resultados de IA
 */
const saveAIResults = async (aiData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('analysis_results_ai')
      .insert(aiData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Guardar métricas de análisis
 */
const saveAnalysisMetrics = async (metricsData) => {
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('analysis_metrics')
      .insert(metricsData)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
};

/**
 * Validar datos de documento
 */
const validateDocumentData = (data) => {
  const required = ['user_int_id', 'original_filename', 'file_type'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
};

/**
 * Validar datos de análisis
 */
const validateAnalysisData = (data) => {
  const required = ['document_id', 'user_int_id', 'analysis_type'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
};

/**
 * Obtener historial de documentos
 */
const getDocumentsHistory = async (options = {}) => {
  const { userId, limit = 50, offset = 0, sortBy = 'uploaded_at', sortOrder = 'desc' } = options;
  
  return executeDbOperation(async (supabase) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_int_id', userId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count: data?.length || 0 };
  }, { data: [], count: 0 });
};

/**
 * Transformar documento para respuesta
 */
const transformDocumentForResponse = (doc) => {
  return {
    id: doc.id,
    filename: doc.original_filename,
    fileType: doc.file_type,
    uploadedAt: doc.uploaded_at,
    processingStatus: doc.processing_status,
    fileSize: doc.file_size_bytes,
    storageUrl: doc.file_path,
    metadata: doc.metadata || {},
    analysis: {
      statistics: doc.metadata?.analysis_results || {},
      advanced: doc.metadata?.advanced_results || {},
      aiAnalysis: doc.metadata?.ai_results || {}
    },
    processingTime: doc.metadata?.processing_time_ms || 0,
    confidenceScore: doc.metadata?.confidence_score || 0
  };
};

module.exports = {
  // Respuestas
  createResponse,
  createErrorResponse,
  
  // Utilidades de DB
  isDatabaseAvailable,
  getSupabaseClient,
  executeDbOperation,
  
  // Configuración de usuario
  saveUserConfiguration,
  getUserConfiguration,
  
  // Contexto de usuario
  setUserContext,
  
  // Operaciones de documentos
  saveDocument,
  saveAnalysis,
  saveBasicResults,
  saveAdvancedResults,
  saveAIResults,
  saveAnalysisMetrics,
  
  // Validaciones
  validateDocumentData,
  validateAnalysisData,
  
  // Historial
  getDocumentsHistory,
  transformDocumentForResponse,
  
  // Métricas reales
  getRealMetrics,
  getPerformanceData,
  getModelUsage,
  getProviderStats
};