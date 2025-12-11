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
  return executeDbOperation(async (supabase) => {
    // Calcular fecha de inicio según el rango de tiempo
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener estadísticas de uso de modelos
    const { data: modelData, error: modelError } = await supabase
      .from('ai_model_metrics')
      .select('model_name, provider, success, response_time_ms, cost_usd, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (modelError) throw modelError;

    // Procesar datos reales
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let totalResponseTime = 0;
    let successCount = 0;
    const modelCounts = {};
    const providerCounts = {};
    const modelCosts = {};
    const modelTimes = {};

    modelData.forEach(metric => {
      totalRequests++;
      totalTokens += metric.tokens_used || 0;
      totalCost += metric.cost_usd || 0;
      totalResponseTime += metric.response_time_ms || 0;
      
      if (metric.success) {
        successCount++;
      }

      // Contar por modelo
      const modelName = metric.model_name || 'Desconocido';
      modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
      modelCosts[modelName] = (modelCosts[modelName] || 0) + (metric.cost_usd || 0);
      modelTimes[modelName] = (modelTimes[modelName] || 0) + (metric.response_time_ms || 0);

      // Contar por proveedor
      const provider = metric.provider || 'Desconocido';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests / 1000 : 0; // Convertir a segundos

    // Encontrar el modelo más usado
    const topModel = Object.keys(modelCounts).reduce((a, b) => 
      modelCounts[a] > modelCounts[b] ? a : b, Object.keys(modelCounts)[0] || 'Ninguno'
    );

    // Encontrar el proveedor más usado
    const mostUsedProvider = Object.keys(providerCounts).reduce((a, b) => 
      providerCounts[a] > providerCounts[b] ? a : b, Object.keys(providerCounts)[0] || 'Ninguno'
    );

    return {
      totalRequests,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(2)),
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(1)),
      activeModels: Object.keys(modelCounts).length,
      topModel,
      mostUsedProvider
    };
  }, {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageResponseTime: 0,
    successRate: 0,
    activeModels: 0,
    topModel: 'Ninguno',
    mostUsedProvider: 'Ninguno'
  });
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

module.exports = {
  // Respuestas
  createResponse,
  createErrorResponse,
  
  // Utilidades de DB
  isDatabaseAvailable,
  getSupabaseClient,
  
  // Configuración de usuario
  saveUserConfiguration,
  getUserConfiguration,
  
  // Métricas reales
  getRealMetrics,
  getPerformanceData,
  getModelUsage,
  getProviderStats
};