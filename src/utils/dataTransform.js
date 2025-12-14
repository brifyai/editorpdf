/**
 * Capa de transformación de datos para la aplicación
 * Este archivo proporciona utilidades para transformar datos entre
 * diferentes formatos (frontend/backend) y estandarizar la respuesta.
 */

const { 
  transformColumnNames, 
  getStandardColumnName,
  USER_COLUMNS,
  DOCUMENT_COLUMNS,
  ANALYSIS_COLUMNS,
  BATCH_JOB_COLUMNS,
  USER_CONFIGURATION_COLUMNS
} = require('../constants/columnNames');

/**
 * Transforma datos del formato frontend (camelCase) a backend (snake_case)
 * @param {Object|Array} data - Datos a transformar
 * @returns {Object|Array} Datos transformados
 */
function transformToFrontendToBackend(data) {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => transformColumnNames(item, 'frontendToBackend'));
  }
  
  return transformColumnNames(data, 'frontendToBackend');
}

/**
 * Transforma datos del formato backend (snake_case) a frontend (camelCase)
 * @param {Object|Array} data - Datos a transformar
 * @returns {Object|Array} Datos transformados
 */
function transformBackendToFrontend(data) {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => transformColumnNames(item, 'backendToFrontend'));
  }
  
  return transformColumnNames(data, 'backendToFrontend');
}

/**
 * Estandariza la respuesta de la API
 * @param {boolean} success - Indica si la operación fue exitosa
 * @param {any} data - Datos a incluir en la respuesta
 * @param {string} message - Mensaje opcional
 * @param {Object} meta - Metadatos adicionales
 * @returns {Object} Respuesta estandarizada
 */
function standardizeResponse(success, data = null, message = '', meta = {}) {
  return {
    success: Boolean(success),
    data: data,
    message: message || (success ? 'Operación exitosa' : 'Operación fallida'),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Estandariza la respuesta de error
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Object} details - Detalles adicionales del error
 * @returns {Object} Respuesta de error estandarizada
 */
function standardizeError(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
  return {
    success: false,
    error: {
      message: message,
      code: code,
      statusCode: statusCode,
      details: details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Transforma datos de usuario para el frontend
 * @param {Object} user - Datos del usuario desde la base de datos
 * @returns {Object} Datos del usuario transformados para el frontend
 */
function transformUserData(user) {
  if (!user) return null;
  
  return {
    id: user[USER_COLUMNS.ID],
    userIntId: user[USER_COLUMNS.USER_INT_ID],
    email: user[USER_COLUMNS.EMAIL],
    firstName: user[USER_COLUMNS.FIRST_NAME],
    lastName: user[USER_COLUMNS.LAST_NAME],
    role: user[USER_COLUMNS.ROLE],
    subscriptionTier: user[USER_COLUMNS.SUBSCRIPTION_TIER],
    apiUsageLimit: user[USER_COLUMNS.API_USAGE_LIMIT],
    monthlyApiCount: user[USER_COLUMNS.MONTHLY_API_COUNT],
    storageQuotaMb: user[USER_COLUMNS.STORAGE_QUOTA_MB],
    storageUsedMb: user[USER_COLUMNS.STORAGE_USED_MB],
    preferences: user[USER_COLUMNS.PREFERENCES] ? JSON.parse(user[USER_COLUMNS.PREFERENCES]) : {},
    isActive: user[USER_COLUMNS.IS_ACTIVE],
    emailVerified: user[USER_COLUMNS.EMAIL_VERIFIED],
    createdAt: user[USER_COLUMNS.CREATED_AT],
    updatedAt: user[USER_COLUMNS.UPDATED_AT]
  };
}

/**
 * Transforma datos de documento para el frontend
 * @param {Object} document - Datos del documento desde la base de datos
 * @returns {Object} Datos del documento transformados para el frontend
 */
function transformDocumentData(document) {
  if (!document) return null;
  
  return {
    id: document[DOCUMENT_COLUMNS.ID],
    userIntId: document[DOCUMENT_COLUMNS.USER_INT_ID],
    filename: document[DOCUMENT_COLUMNS.ORIGINAL_FILENAME],
    fileType: document[DOCUMENT_COLUMNS.FILE_TYPE],
    fileSize: document[DOCUMENT_COLUMNS.FILE_SIZE_BYTES],
    filePath: document[DOCUMENT_COLUMNS.FILE_PATH],
    storageUrl: document[DOCUMENT_COLUMNS.STORAGE_URL],
    processingStatus: document[DOCUMENT_COLUMNS.PROCESSING_STATUS],
    metadata: document[DOCUMENT_COLUMNS.METADATA] || {},
    uploadedAt: document[DOCUMENT_COLUMNS.UPLOADED_AT],
    processedAt: document[DOCUMENT_COLUMNS.PROCESSED_AT],
    createdAt: document[DOCUMENT_COLUMNS.CREATED_AT]
  };
}

/**
 * Transforma datos de análisis para el frontend
 * @param {Object} analysis - Datos del análisis desde la base de datos
 * @returns {Object} Datos del análisis transformados para el frontend
 */
function transformAnalysisData(analysis) {
  if (!analysis) return null;
  
  return {
    id: analysis[ANALYSIS_COLUMNS.ID],
    userIntId: analysis[ANALYSIS_COLUMNS.USER_INT_ID],
    documentId: analysis[ANALYSIS_COLUMNS.DOCUMENT_ID],
    analysisType: analysis[ANALYSIS_COLUMNS.ANALYSIS_TYPE],
    analysisResults: analysis[ANALYSIS_COLUMNS.ANALYSIS_RESULTS] || {},
    confidenceScore: analysis[ANALYSIS_COLUMNS.CONFIDENCE_SCORE],
    processingTime: analysis[ANALYSIS_COLUMNS.PROCESSING_TIME_MS],
    tokensUsed: analysis[ANALYSIS_COLUMNS.TOKENS_USED],
    costUsd: analysis[ANALYSIS_COLUMNS.COST_USD],
    modelUsed: analysis[ANALYSIS_COLUMNS.MODEL_USED],
    provider: analysis[ANALYSIS_COLUMNS.PROVIDER],
    createdAt: analysis[ANALYSIS_COLUMNS.CREATED_AT]
  };
}

/**
 * Transforma datos de trabajo batch para el frontend
 * @param {Object} batchJob - Datos del trabajo batch desde la base de datos
 * @returns {Object} Datos del trabajo batch transformados para el frontend
 */
function transformBatchJobData(batchJob) {
  if (!batchJob) return null;
  
  return {
    id: batchJob[BATCH_JOB_COLUMNS.ID],
    userIntId: batchJob[BATCH_JOB_COLUMNS.USER_INT_ID],
    jobName: batchJob[BATCH_JOB_COLUMNS.JOB_NAME],
    description: batchJob[BATCH_JOB_COLUMNS.DESCRIPTION],
    jobConfig: batchJob[BATCH_JOB_COLUMNS.JOB_CONFIG] || {},
    priority: batchJob[BATCH_JOB_COLUMNS.PRIORITY],
    outputFormat: batchJob[BATCH_JOB_COLUMNS.OUTPUT_FORMAT],
    jobStatus: batchJob[BATCH_JOB_COLUMNS.JOB_STATUS],
    totalFiles: batchJob[BATCH_JOB_COLUMNS.TOTAL_FILES],
    processedFiles: batchJob[BATCH_JOB_COLUMNS.PROCESSED_FILES],
    failedFiles: batchJob[BATCH_JOB_COLUMNS.FAILED_FILES],
    startedAt: batchJob[BATCH_JOB_COLUMNS.STARTED_AT],
    completedAt: batchJob[BATCH_JOB_COLUMNS.COMPLETED_AT],
    createdAt: batchJob[BATCH_JOB_COLUMNS.CREATED_AT],
    updatedAt: batchJob[BATCH_JOB_COLUMNS.UPDATED_AT]
  };
}

/**
 * Transforma datos de configuración de IA para el frontend
 * @param {Object} config - Datos de configuración desde la base de datos
 * @returns {Object} Datos de configuración transformados para el frontend
 */
function transformAIConfigurationData(config) {
  if (!config) return null;
  
  return {
    id: config[USER_CONFIGURATION_COLUMNS.ID],
    userIntId: config[USER_CONFIGURATION_COLUMNS.USER_INT_ID],
    groqApiKey: config[USER_CONFIGURATION_COLUMNS.GROQ_API_KEY],
    chutesApiKey: config[USER_CONFIGURATION_COLUMNS.CHUTES_API_KEY],
    groqModel: config[USER_CONFIGURATION_COLUMNS.GROQ_MODEL],
    chutesModel: config[USER_CONFIGURATION_COLUMNS.CHUTES_MODEL],
    groqTemperature: config[USER_CONFIGURATION_COLUMNS.GROQ_TEMPERATURE],
    chutesTemperature: config[USER_CONFIGURATION_COLUMNS.CHUTES_TEMPERATURE],
    groqMaxTokens: config[USER_CONFIGURATION_COLUMNS.GROQ_MAX_TOKENS],
    chutesMaxTokens: config[USER_CONFIGURATION_COLUMNS.CHUTES_MAX_TOKENS],
    groqStream: config[USER_CONFIGURATION_COLUMNS.GROQ_STREAM],
    chutesStream: config[USER_CONFIGURATION_COLUMNS.CHUTES_STREAM],
    createdAt: config[USER_CONFIGURATION_COLUMNS.CREATED_AT],
    updatedAt: config[USER_CONFIGURATION_COLUMNS.UPDATED_AT]
  };
}

/**
 * Transforma datos de configuración de IA para el backend
 * @param {Object} config - Datos de configuración desde el frontend
 * @returns {Object} Datos de configuración transformados para el backend
 */
function transformAIConfigurationToBackend(config) {
  if (!config) return null;
  
  return {
    [USER_CONFIGURATION_COLUMNS.GROQ_API_KEY]: config.groqApiKey,
    [USER_CONFIGURATION_COLUMNS.CHUTES_API_KEY]: config.chutesApiKey,
    [USER_CONFIGURATION_COLUMNS.GROQ_MODEL]: config.groqModel,
    [USER_CONFIGURATION_COLUMNS.CHUTES_MODEL]: config.chutesModel,
    [USER_CONFIGURATION_COLUMNS.GROQ_TEMPERATURE]: config.groqTemperature,
    [USER_CONFIGURATION_COLUMNS.CHUTES_TEMPERATURE]: config.chutesTemperature,
    [USER_CONFIGURATION_COLUMNS.GROQ_MAX_TOKENS]: config.groqMaxTokens,
    [USER_CONFIGURATION_COLUMNS.CHUTES_MAX_TOKENS]: config.chutesMaxTokens,
    [USER_CONFIGURATION_COLUMNS.GROQ_STREAM]: config.groqStream,
    [USER_CONFIGURATION_COLUMNS.CHUTES_STREAM]: config.chutesStream
  };
}

/**
 * Transforma una lista de datos usando una función de transformación específica
 * @param {Array} list - Lista de datos a transformar
 * @param {Function} transformFunction - Función de transformación a aplicar
 * @returns {Array} Lista transformada
 */
function transformList(list, transformFunction) {
  if (!Array.isArray(list)) return [];
  
  return list
    .filter(item => item !== null && item !== undefined)
    .map(item => transformFunction(item))
    .filter(item => item !== null && item !== undefined);
}

/**
 * Crea un objeto de paginación estandarizado
 * @param {number} page - Número de página actual
 * @param {number} limit - Límite de elementos por página
 * @param {number} total - Total de elementos
 * @returns {Object} Objeto de paginación
 */
function createPagination(page = 1, limit = 10, total = 0) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: Number(page),
    limit: Number(limit),
    total: Number(total),
    totalPages: totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Filtra y ordena datos
 * @param {Array} data - Datos a filtrar y ordenar
 * @param {Object} filters - Objeto con filtros a aplicar
 * @param {Object} sort - Objeto con criterios de ordenamiento
 * @returns {Array} Datos filtrados y ordenados
 */
function filterAndSort(data, filters = {}, sort = {}) {
  if (!Array.isArray(data)) return [];
  
  let filtered = [...data];
  
  // Aplicar filtros
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filtered = filtered.filter(item => {
        const itemValue = item[key];
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    }
  });
  
  // Aplicar ordenamiento
  if (sort.field) {
    const sortField = sort.field;
    const sortOrder = sort.order === 'desc' ? -1 : 1;
    
    filtered.sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (valueA < valueB) return -1 * sortOrder;
      if (valueA > valueB) return 1 * sortOrder;
      return 0;
    });
  }
  
  return filtered;
}

/**
 * Valida datos según un esquema
 * @param {Object} data - Datos a validar
 * @param {Object} schema - Esquema de validación
 * @returns {Object} Resultado de la validación
 */
function validateData(data, schema) {
  const errors = [];
  const validated = {};
  
  Object.entries(schema).forEach(([key, rules]) => {
    const value = data[key];
    
    // Validar requerido
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`El campo '${key}' es requerido`);
      return;
    }
    
    // Si no es requerido y no está presente, omitir
    if (!rules.required && (value === undefined || value === null)) {
      return;
    }
    
    // Validar tipo
    if (rules.type && typeof value !== rules.type) {
      errors.push(`El campo '${key}' debe ser de tipo ${rules.type}`);
      return;
    }
    
    // Validar longitud mínima
    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`El campo '${key}' debe tener al menos ${rules.minLength} caracteres`);
      return;
    }
    
    // Validar longitud máxima
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`El campo '${key}' debe tener como máximo ${rules.maxLength} caracteres`);
      return;
    }
    
    // Validar valores mínimos y máximos para números
    if (rules.type === 'number') {
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`El campo '${key}' debe ser mayor o igual a ${rules.min}`);
        return;
      }
      
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`El campo '${key}' debe ser menor o igual a ${rules.max}`);
        return;
      }
    }
    
    // Validar valores en lista
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`El campo '${key}' debe ser uno de: ${rules.enum.join(', ')}`);
      return;
    }
    
    // Validar formato de email
    if (rules.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`El campo '${key}' debe ser un email válido`);
      return;
    }
    
    // Validar formato de URL
    if (rules.format === 'url' && !/^https?:\/\/.+/.test(value)) {
      errors.push(`El campo '${key}' debe ser una URL válida`);
      return;
    }
    
    // Si pasa todas las validaciones, agregar al objeto validado
    validated[key] = value;
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    validatedData: validated
  };
}

module.exports = {
  transformToFrontendToBackend,
  transformBackendToFrontend,
  standardizeResponse,
  standardizeError,
  transformUserData,
  transformDocumentData,
  transformAnalysisData,
  transformBatchJobData,
  transformAIConfigurationData,
  transformAIConfigurationToBackend,
  transformList,
  createPagination,
  filterAndSort,
  validateData,
  getStandardColumnName
};