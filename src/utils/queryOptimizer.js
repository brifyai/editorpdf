/**
 * Utilidades de optimización de consultas para la base de datos
 */

/**
 * Función para crear índices recomendados en la base de datos
 * @param {Object} supabaseClient - Cliente de Supabase
 */
const createRecommendedIndexes = async (supabaseClient) => {
  try {
    // Lista de índices recomendados para mejorar el rendimiento
    const recommendedIndexes = [
      {
        table: 'batch_jobs',
        columns: ['user_int_id', 'job_status', 'created_at'],
        name: 'idx_batch_jobs_user_status_created'
      },
      {
        table: 'batch_jobs',
        columns: ['user_int_id', 'priority'],
        name: 'idx_batch_jobs_user_priority'
      },
      {
        table: 'batch_job_files',
        columns: ['job_id', 'processing_status'],
        name: 'idx_batch_job_files_job_status'
      },
      {
        table: 'documents',
        columns: ['user_int_id', 'uploaded_at'],
        name: 'idx_documents_user_uploaded'
      },
      {
        table: 'analyses',
        columns: ['document_id', 'analysis_type'],
        name: 'idx_analyses_document_type'
      },
      {
        table: 'user_preferences',
        columns: ['user_int_id'],
        name: 'idx_user_preferences_user'
      },
      {
        table: 'user_profiles',
        columns: ['user_int_id'],
        name: 'idx_user_profiles_user'
      },
      {
        table: 'user_api_configs',
        columns: ['user_int_id', 'provider'],
        name: 'idx_user_api_configs_user_provider'
      },
      {
        table: 'document_conversions',
        columns: ['user_int_id', 'processing_status'],
        name: 'idx_document_conversions_user_status'
      },
      {
        table: 'ai_configurations',
        columns: ['user_int_id'],
        name: 'idx_ai_configurations_user'
      }
    ];

    console.log('🔍 Verificando y creando índices recomendados...');

    // Ejecutar comandos SQL para crear índices
    for (const index of recommendedIndexes) {
      const createIndexSQL = `
        CREATE INDEX IF NOT EXISTS ${index.name} 
        ON ${index.table} (${index.columns.join(', ')})
      `;

      try {
        const { error } = await supabaseClient.rpc('exec_sql', { sql: createIndexSQL });
        if (error) {
          console.warn(`⚠️ No se pudo crear índice ${index.name}:`, error.message);
        } else {
          console.log(`✅ Índice ${index.name} creado/verificado exitosamente`);
        }
      } catch (error) {
        console.warn(`⚠️ Error al crear índice ${index.name}:`, error.message);
      }
    }

    console.log('🔍 Verificación de índices completada');
  } catch (error) {
    console.error('❌ Error al crear índices recomendados:', error);
  }
};

/**
 * Función para optimizar consultas con paginación
 * @param {Object} query - Objeto de consulta de Supabase
 * @param {Object} options - Opciones de paginación
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.limit - Límite de resultados por página (default: 50)
 * @param {string} options.orderBy - Campo para ordenar (default: 'created_at')
 * @param {boolean} options.ascending - Orden ascendente (default: false)
 * @returns {Object} - Query optimizada con paginación
 */
const optimizePaginatedQuery = (query, options = {}) => {
  const {
    page = 1,
    limit = 50,
    orderBy = 'created_at',
    ascending = false
  } = options;

  const offset = (page - 1) * limit;

  return query
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);
};

/**
 * Función para optimizar consultas con filtros comunes
 * @param {Object} query - Objeto de consulta de Supabase
 * @param {Object} filters - Objeto de filtros
 * @param {string} filters.status - Filtro por estado
 * @param {string} filters.priority - Filtro por prioridad
 * @param {string} filters.type - Filtro por tipo
 * @param {Date} filters.dateFrom - Filtro por fecha desde
 * @param {Date} filters.dateTo - Filtro por fecha hasta
 * @returns {Object} - Query optimizada con filtros
 */
const optimizeFilteredQuery = (query, filters = {}) => {
  const { status, priority, type, dateFrom, dateTo } = filters;

  if (status) {
    query = query.eq('job_status', status);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString());
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString());
  }

  return query;
};

/**
 * Función para optimizar consultas de conteo
 * @param {Object} supabaseClient - Cliente de Supabase
 * @param {string} table - Nombre de la tabla
 * @param {Object} filters - Filtros para el conteo
 * @returns {Promise<number>} - Número de registros
 */
const optimizeCountQuery = async (supabaseClient, table, filters = {}) => {
  try {
    let query = supabaseClient.from(table).select('*', { count: 'exact', head: true });

    // Aplicar filtros
    if (filters.user_int_id) {
      query = query.eq('user_int_id', filters.user_int_id);
    }

    if (filters.status) {
      query = query.eq('job_status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error en conteo: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('Error en optimizeCountQuery:', error);
    throw error;
  }
};

/**
 * Función para optimizar consultas de relaciones uno a muchos
 * @param {Object} query - Objeto de consulta de Supabase
 * @param {string} relationName - Nombre de la relación
 * @param {Array} selectFields - Campos a seleccionar de la relación
 * @returns {Object} - Query optimizada con relación
 */
const optimizeRelationQuery = (query, relationName, selectFields = ['*']) => {
  return query.select(`
    *,
    ${relationName} (${selectFields.join(', ')})
  `);
};

/**
 * Función para crear consultas batch optimizadas
 * @param {Object} supabaseClient - Cliente de Supabase
 * @param {Array} queries - Array de consultas a ejecutar
 * @returns {Promise<Array>} - Resultados de las consultas
 */
const executeBatchQueries = async (supabaseClient, queries) => {
  try {
    // Ejecutar todas las consultas en paralelo
    const results = await Promise.all(
      queries.map(query => query.execute())
    );

    // Procesar resultados
    return results.map(result => {
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    });
  } catch (error) {
    console.error('Error en executeBatchQueries:', error);
    throw error;
  }
};

/**
 * Función para optimizar consultas con búsqueda de texto
 * @param {Object} query - Objeto de consulta de Supabase
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Object} - Query optimizada con búsqueda de texto
 */
const optimizeTextSearch = (query, searchTerm, searchFields) => {
  if (!searchTerm || !searchFields.length) {
    return query;
  }

  const searchConditions = searchFields.map(field => 
    `${field}.ilike.%${searchTerm}%`
  ).join(',');

  return query.or(searchConditions);
};

/**
 * Función para obtener estadísticas de rendimiento de consultas
 * @param {Object} supabaseClient - Cliente de Supabase
 * @returns {Promise<Object>} - Estadísticas de rendimiento
 */
const getQueryPerformanceStats = async (supabaseClient) => {
  try {
    // Obtener estadísticas de tablas más grandes
    const { data: tableStats, error } = await supabaseClient.rpc('get_table_stats');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    return {
      tableStats,
      recommendations: generatePerformanceRecommendations(tableStats)
    };
  } catch (error) {
    console.error('Error en getQueryPerformanceStats:', error);
    throw error;
  }
};

/**
 * Función para generar recomendaciones de rendimiento basadas en estadísticas
 * @param {Array} tableStats - Estadísticas de tablas
 * @returns {Array} - Recomendaciones de rendimiento
 */
const generatePerformanceRecommendations = (tableStats) => {
  const recommendations = [];

  tableStats.forEach(stat => {
    // Recomendar índices para tablas grandes con muchos registros
    if (stat.row_count > 10000 && stat.index_count < 3) {
      recommendations.push({
        table: stat.table_name,
        type: 'index',
        message: `La tabla ${stat.table_name} tiene ${stat.row_count} registros pero solo ${stat.index_count} índices. Considera agregar más índices para mejorar el rendimiento.`,
        priority: 'high'
      });
    }

    // Recomendar particionamiento para tablas muy grandes
    if (stat.row_count > 100000) {
      recommendations.push({
        table: stat.table_name,
        type: 'partition',
        message: `La tabla ${stat.table_name} tiene ${stat.row_count} registros. Considera particionar la tabla por fecha para mejorar el rendimiento.`,
        priority: 'medium'
      });
    }

    // Recomendar limpieza para tablas con muchos registros muertos
    if (stat.dead_rows_ratio > 0.2) {
      recommendations.push({
        table: stat.table_name,
        type: 'cleanup',
        message: `La tabla ${stat.table_name} tiene ${(stat.dead_rows_ratio * 100).toFixed(1)}% de registros muertos. Considera ejecutar VACUUM.`,
        priority: 'medium'
      });
    }
  });

  return recommendations;
};

/**
 * Función para crear vistas materializadas para consultas frecuentes
 * @param {Object} supabaseClient - Cliente de Supabase
 */
const createMaterializedViews = async (supabaseClient) => {
  try {
    const materializedViews = [
      {
        name: 'mv_user_batch_summary',
        query: `
          SELECT 
            user_int_id,
            COUNT(*) as total_jobs,
            COUNT(CASE WHEN job_status = 'completed' THEN 1 END) as completed_jobs,
            COUNT(CASE WHEN job_status = 'failed' THEN 1 END) as failed_jobs,
            AVG(processed_files) as avg_processed_files,
            MAX(created_at) as last_job_date
          FROM batch_jobs
          GROUP BY user_int_id
        `
      },
      {
        name: 'mv_document_stats',
        query: `
          SELECT 
            user_int_id,
            COUNT(*) as total_documents,
            COUNT(CASE WHEN file_type = 'pdf' THEN 1 END) as pdf_count,
            COUNT(CASE WHEN file_type = 'docx' THEN 1 END) as docx_count,
            SUM(file_size) as total_size,
            MAX(uploaded_at) as last_upload_date
          FROM documents
          GROUP BY user_int_id
        `
      }
    ];

    console.log('🔍 Creando vistas materializadas...');

    for (const view of materializedViews) {
      const createViewSQL = `
        CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS
        ${view.query}
        WITH DATA;
      `;

      try {
        const { error } = await supabaseClient.rpc('exec_sql', { sql: createViewSQL });
        if (error) {
          console.warn(`⚠️ No se pudo crear vista materializada ${view.name}:`, error.message);
        } else {
          console.log(`✅ Vista materializada ${view.name} creada exitosamente`);
        }
      } catch (error) {
        console.warn(`⚠️ Error al crear vista materializada ${view.name}:`, error.message);
      }
    }

    console.log('🔍 Creación de vistas materializadas completada');
  } catch (error) {
    console.error('❌ Error al crear vistas materializadas:', error);
  }
};

/**
 * Función para refrescar vistas materializadas
 * @param {Object} supabaseClient - Cliente de Supabase
 * @param {string} viewName - Nombre de la vista a refrescar (opcional)
 */
const refreshMaterializedViews = async (supabaseClient, viewName = null) => {
  try {
    const views = viewName ? [viewName] : ['mv_user_batch_summary', 'mv_document_stats'];

    for (const view of views) {
      const refreshSQL = `REFRESH MATERIALIZED VIEW ${view};`;
      
      try {
        const { error } = await supabaseClient.rpc('exec_sql', { sql: refreshSQL });
        if (error) {
          console.warn(`⚠️ No se pudo refrescar vista materializada ${view}:`, error.message);
        } else {
          console.log(`✅ Vista materializada ${view} refrescada exitosamente`);
        }
      } catch (error) {
        console.warn(`⚠️ Error al refrescar vista materializada ${view}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error al refrescar vistas materializadas:', error);
  }
};

module.exports = {
  createRecommendedIndexes,
  optimizePaginatedQuery,
  optimizeFilteredQuery,
  optimizeCountQuery,
  optimizeRelationQuery,
  executeBatchQueries,
  optimizeTextSearch,
  getQueryPerformanceStats,
  generatePerformanceRecommendations,
  createMaterializedViews,
  refreshMaterializedViews
};