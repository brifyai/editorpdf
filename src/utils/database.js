/**
 * Utilidades para operaciones de base de datos
 * Patrones reutilizables para eliminar código duplicado
 */

const { SupabaseClient, supabaseClient } = require('../database/supabaseClient');

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
 * Obtener proveedor basado en el modelo
 */
const getProviderFromModel = (modelName) => {
  if (!modelName || modelName === 'none' || modelName === 'Desconocido') {
    return 'Ninguno';
  }
  
  if (modelName.includes('llama') || modelName.includes('mixtral')) {
    return 'groq';
  } else if (modelName.includes('chutes')) {
    return 'chutes';
  } else if (modelName.includes('tesseract')) {
    return 'tesseract';
  }
  
  return 'Desconocido';
};

/**
 * Calcular costo real de IA basado en modelo y tokens
 */
const calculateAICost = (modelName, tokensUsed) => {
  if (!modelName || !tokensUsed) return 0;
  
  const costPer1KTokens = {
    'llama-3.1-8b-instant': 0.0005,
    'llama-3.3-70b-versatile': 0.0008,
    'mixtral-8x7b-32768': 0.0007,
    'llama-3.1-70b-versatile': 0.0008,
    'chutes-ai-ocr': 0.001,
    'tesseract-5-spanish': 0.0001
  };
  
  const rate = costPer1KTokens[modelName] || 0.001;
  return (tokensUsed / 1000) * rate;
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

    // MÉTRICAS REALES DESDE LAS TABLAS CORRECTAS
    
    // 1. Contar documentos reales desde documents (tabla principal que sí tiene datos)
    // Sin restricción de fecha para obtener todos los documentos disponibles
    console.log('🔍 Iniciando consulta a tabla documents...');
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, original_filename, file_type, file_size_bytes, uploaded_at, processing_status, metadata');

    if (docError) {
      console.error('❌ Error consultando documents:', docError.message, docError);
    } else {
      console.log(`✅ Documentos encontrados: ${documents?.length || 0}`);
      if (documents && documents.length > 0) {
        console.log('📋 Primer documento como ejemplo:', {
          id: documents[0].id,
          filename: documents[0].original_filename,
          type: documents[0].file_type,
          uploaded_at: documents[0].uploaded_at
        });
      }
    }

    // 2. También contar análisis de documentos si existen datos
    // Sin restricción de fecha para obtener todos los análisis disponibles
    const { data: documentAnalyses, error: analysesError } = await supabase
      .from('document_analyses')
      .select('id, status, ai_model_used, processing_time_ms, confidence_score, created_at')
      .eq('status', 'completed');

    if (analysesError) {
      console.warn('⚠️ Error consultando document_analyses:', analysesError.message);
    } else {
      console.log(`📄 Análisis de documentos encontrados: ${documentAnalyses?.length || 0}`);
    }

    // 3. Contar usuarios activos (sin restricción de fecha)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('is_active', true);

    if (usersError) {
      console.warn('⚠️ Error consultando users:', usersError.message);
    } else {
      console.log(`👥 Usuarios activos encontrados: ${users?.length || 0}`);
    }

    // 4. Contar configuraciones guardadas (uso de IA, sin restricción de fecha)
    const { data: configurations, error: configError } = await supabase
      .from('user_configurations')
      .select('id, updated_at');

    if (configError) {
      console.warn('⚠️ Error consultando user_configurations:', configError.message);
    } else {
      console.log(`⚙️ Configuraciones guardadas encontradas: ${configurations?.length || 0}`);
    }

    // 5. Obtener métricas reales de IA desde analysis_results_ai (sin restricción de fecha)
    const { data: aiResults, error: aiError } = await supabase
      .from('analysis_results_ai')
      .select('ai_model, ai_provider, created_at');

    if (aiError) {
      console.warn('⚠️ Error consultando analysis_results_ai:', aiError.message);
    } else {
      console.log(`🤖 Análisis con IA encontrados: ${aiResults?.length || 0}`);
    }

    // 6. Obtener métricas de procesamiento desde document_analyses (sin restricción de fecha)
    const { data: metrics, error: metricsError } = await supabase
      .from('document_analyses')
      .select('processing_time_ms, ai_model_used, confidence_score, created_at')
      .eq('status', 'completed');

    if (metricsError) {
      console.warn('⚠️ Error consultando document_analyses para métricas:', metricsError.message);
    } else {
      console.log(`📊 Métricas de análisis encontradas: ${metrics?.length || 0}`);
    }

    // PROCESAR MÉTRICAS REALES DE IA
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let totalResponseTime = 0;
    let successCount = 0;
    const modelCounts = {};
    const providerCounts = {};

    // Procesar documentos REALES (usar documents como fuente principal)
    if (documents && documents.length > 0) {
      documents.forEach(document => {
        totalRequests++;
        successCount++;
        
        // Estimar tiempo de procesamiento basado en el tamaño del archivo
        const fileSize = document.file_size_bytes || 0;
        const estimatedProcessingTime = Math.max(1000, fileSize / 1000); // Mínimo 1 segundo
        totalResponseTime += estimatedProcessingTime;

        // Determinar modelo usado (basado en metadata o por defecto)
        const metadata = document.metadata || {};
        const modelName = metadata.ai_model_used || metadata.model_used || 'Procesamiento Básico';
        const provider = getProviderFromModel(modelName);
        
        // Contar por modelo
        modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
        // Contar por proveedor
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });
    }

    // Procesar análisis de documentos si existen (datos adicionales)
    if (documentAnalyses && documentAnalyses.length > 0) {
      documentAnalyses.forEach(analysis => {
        const processingTime = analysis.processing_time_ms || 0;
        totalResponseTime += processingTime;

        // Determinar modelo REAL usado
        const modelName = analysis.ai_model_used || 'Desconocido';
        const provider = getProviderFromModel(modelName);
        
        // Contar por modelo
        modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
        // Contar por proveedor
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });
    }

    // Procesar métricas REALES de IA (usando columnas correctas)
    if (aiResults && aiResults.length > 0) {
      aiResults.forEach(aiResult => {
        // Estimar tokens y tiempo basado en el modelo usado
        const modelName = aiResult.ai_model || 'Desconocido';
        const provider = aiResult.ai_provider || 'Desconocido';
        
        // Estimación básica basada en el tipo de modelo
        let estimatedTokens = 0;
        let estimatedProcessingTime = 0;
        
        if (modelName.includes('llama')) {
          estimatedTokens = 1500; // Estimación para modelos Llama
          estimatedProcessingTime = 2000; // 2 segundos
        } else if (modelName.includes('mixtral')) {
          estimatedTokens = 2000;
          estimatedProcessingTime = 3000; // 3 segundos
        } else if (modelName.includes('tesseract')) {
          estimatedTokens = 500;
          estimatedProcessingTime = 1000; // 1 segundo
        } else {
          estimatedTokens = 1000;
          estimatedProcessingTime = 1500; // 1.5 segundos
        }
        
        const costUSD = calculateAICost(modelName, estimatedTokens);
        
        totalTokens += estimatedTokens;
        totalCost += costUSD;
        totalResponseTime += estimatedProcessingTime;
        
        modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });
    }

    // Procesar métricas generales de análisis (usando datos reales)
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        // Ya se procesaron en documentAnalyses, pero podemos agregar datos adicionales
        const processingTime = metric.processing_time_ms || 0;
        totalResponseTime += processingTime;
        
        // Estimar tokens basado en el tamaño del documento y tiempo de procesamiento
        const estimatedTokens = Math.floor(processingTime / 10); // Estimación simple
        totalTokens += estimatedTokens;
      });
    }

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
      totalCost: parseFloat(totalCost.toFixed(4)),
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(1)),
      activeModels: Object.keys(modelCounts).length,
      topModel,
      mostUsedProvider,
      dataSource: 'real_database_documents',
      lastUpdate: new Date().toISOString(),
      documentAnalyses: documentAnalyses?.length || 0,
      documentsCount: documents?.length || 0, // Nuevo campo con el conteo real de documentos
      aiAnalyses: aiResults?.length || 0,
      activeUsers: users?.length || 0,
      savedConfigurations: configurations?.length || 0,
      modelBreakdown: modelCounts,
      providerBreakdown: providerCounts
    };

    console.log('✅ Métricas reales de IA calculadas:', result);
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
      hourlyData[hourKey].cost += 0;
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
      modelData[modelName].cost += 0;
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
      providerData[provider].cost += 0;
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
  getProviderStats,
  
  // Funciones auxiliares para métricas
  getProviderFromModel,
  calculateAICost
};