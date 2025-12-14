/**
 * Constantes para estandarizar nombres de columnas en toda la aplicación
 * Este archivo centraliza los nombres de columnas para evitar inconsistencias
 * y facilitar el mantenimiento del código.
 */

// Tabla de usuarios
export const USER_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  EMAIL: 'email',
  PASSWORD_HASH: 'password_hash',
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  ROLE: 'role',
  SUBSCRIPTION_TIER: 'subscription_tier',
  API_USAGE_LIMIT: 'api_usage_limit',
  MONTHLY_API_COUNT: 'monthly_api_count',
  STORAGE_QUOTA_MB: 'storage_quota_mb',
  STORAGE_USED_MB: 'storage_used_mb',
  PREFERENCES: 'preferences',
  IS_ACTIVE: 'is_active',
  EMAIL_VERIFIED: 'email_verified',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de documentos
export const DOCUMENT_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  ORIGINAL_FILENAME: 'original_filename',
  FILE_TYPE: 'file_type',
  FILE_SIZE_BYTES: 'file_size_bytes',
  FILE_PATH: 'file_path',
  STORAGE_URL: 'storage_url',
  PROCESSING_STATUS: 'processing_status',
  METADATA: 'metadata',
  UPLOADED_AT: 'uploaded_at',
  PROCESSED_AT: 'processed_at',
  CREATED_AT: 'created_at'
};

// Tabla de análisis
export const ANALYSIS_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  DOCUMENT_ID: 'document_id',
  ANALYSIS_TYPE: 'analysis_type',
  ANALYSIS_RESULTS: 'analysis_results',
  CONFIDENCE_SCORE: 'confidence_score',
  PROCESSING_TIME_MS: 'processing_time_ms',
  TOKENS_USED: 'tokens_used',
  COST_USD: 'cost_usd',
  MODEL_USED: 'model_used',
  PROVIDER: 'provider',
  CREATED_AT: 'created_at'
};

// Tabla de procesos OCR
export const OCR_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  DOCUMENT_ID: 'document_id',
  OCR_ENGINE: 'ocr_engine',
  OCR_CONFIDENCE: 'ocr_confidence',
  EXTRACTED_TEXT: 'extracted_text',
  PROCESSING_TIME_MS: 'processing_time_ms',
  CREATED_AT: 'created_at'
};

// Tabla de trabajos batch
export const BATCH_JOB_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  JOB_NAME: 'job_name',
  DESCRIPTION: 'description',
  JOB_CONFIG: 'job_config',
  PRIORITY: 'priority',
  OUTPUT_FORMAT: 'output_format',
  JOB_STATUS: 'job_status',
  TOTAL_FILES: 'total_files',
  PROCESSED_FILES: 'processed_files',
  FAILED_FILES: 'failed_files',
  STARTED_AT: 'started_at',
  COMPLETED_AT: 'completed_at',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de archivos de trabajos batch
export const BATCH_JOB_FILE_COLUMNS = {
  ID: 'id',
  JOB_ID: 'job_id',
  FILE_NAME: 'file_name',
  FILE_TYPE: 'file_type',
  FILE_SIZE: 'file_size',
  FILE_ORDER: 'file_order',
  PROCESSING_STATUS: 'processing_status',
  ERROR_MESSAGE: 'error_message',
  OUTPUT_FILE_PATH: 'output_file_path',
  OUTPUT_FILE_URL: 'output_file_url',
  OUTPUT_FILE_SIZE: 'output_file_size',
  CREATED_AT: 'created_at',
  COMPLETED_AT: 'completed_at'
};

// Tabla de conversiones de documentos
export const DOCUMENT_CONVERSION_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  DOCUMENT_ID: 'document_id',
  CONVERSION_TYPE: 'conversion_type',
  OUTPUT_FORMAT: 'output_format',
  CONVERSION_CONFIG: 'conversion_config',
  PROCESSING_STATUS: 'processing_status',
  OUTPUT_FILE_PATH: 'output_file_path',
  OUTPUT_FILE_URL: 'output_file_url',
  OUTPUT_FILE_SIZE: 'output_file_size',
  PROCESSING_TIME_MS: 'processing_time_ms',
  ERROR_MESSAGE: 'error_message',
  CREATED_AT: 'created_at',
  COMPLETED_AT: 'completed_at'
};

// Tabla de métricas de modelos de IA
export const AI_MODEL_METRICS_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  MODEL_NAME: 'model_name',
  PROVIDER: 'provider',
  PROMPT: 'prompt',
  RESPONSE: 'response',
  TOKENS_USED: 'tokens_used',
  COST_USD: 'cost_usd',
  RESPONSE_TIME_MS: 'response_time_ms',
  SUCCESS: 'success',
  CREATED_AT: 'created_at'
};

// Tabla de configuraciones de usuario
export const USER_CONFIGURATION_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  GROQ_API_KEY: 'groq_api_key',
  CHUTES_API_KEY: 'chutes_api_key',
  GROQ_MODEL: 'groq_model',
  CHUTES_MODEL: 'chutes_model',
  GROQ_TEMPERATURE: 'groq_temperature',
  CHUTES_TEMPERATURE: 'chutes_temperature',
  GROQ_MAX_TOKENS: 'groq_max_tokens',
  CHUTES_MAX_TOKENS: 'chutes_max_tokens',
  GROQ_STREAM: 'groq_stream',
  CHUTES_STREAM: 'chutes_stream',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de perfiles de usuario
export const USER_PROFILE_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  AVATAR_URL: 'avatar_url',
  BIO: 'bio',
  COMPANY: 'company',
  POSITION: 'position',
  WEBSITE: 'website',
  SOCIAL_LINKS: 'social_links',
  PREFERENCES: 'preferences',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de preferencias de usuario
export const USER_PREFERENCE_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  AUTO_SAVE: 'auto_save',
  DEFAULT_EXPORT_FORMAT: 'default_export_format',
  DEFAULT_AI_MODEL: 'default_ai_model',
  PREFERENCES: 'preferences',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de estadísticas de uso
export const USER_USAGE_STATS_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  DATE: 'date',
  DOCUMENTS_UPLOADED: 'documents_uploaded',
  ANALYSES_PERFORMED: 'analyses_performed',
  TOKENS_USED: 'tokens_used',
  COST_USD: 'cost_usd',
  API_CALLS: 'api_calls',
  STORAGE_USED_MB: 'storage_used_mb',
  CREATED_AT: 'created_at'
};

// Tabla de artículos de ayuda
export const HELP_ARTICLE_COLUMNS = {
  ID: 'id',
  TITLE: 'title',
  CONTENT: 'content',
  CATEGORY: 'category',
  TAGS: 'tags',
  IS_PUBLISHED: 'is_published',
  VIEW_COUNT: 'view_count',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de tickets de soporte
export const SUPPORT_TICKET_COLUMNS = {
  ID: 'id',
  USER_INT_ID: 'user_int_id',
  SUBJECT: 'subject',
  DESCRIPTION: 'description',
  CATEGORY: 'category',
  PRIORITY: 'priority',
  STATUS: 'status',
  CLOSED_AT: 'closed_at',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Tabla de mensajes de tickets
export const TICKET_MESSAGE_COLUMNS = {
  ID: 'id',
  TICKET_ID: 'ticket_id',
  USER_INT_ID: 'user_int_id',
  MESSAGE: 'message',
  IS_FROM_SUPPORT: 'is_from_support',
  CREATED_AT: 'created_at'
};

// Mapeo de nombres de columnas para transformación de datos
// Esto facilita la conversión entre diferentes formatos (frontend/backend)
export const COLUMN_MAPPING = {
  // Usuarios
  userId: USER_COLUMNS.USER_INT_ID,
  userIntId: USER_COLUMNS.USER_INT_ID,
  userEmail: USER_COLUMNS.EMAIL,
  firstName: USER_COLUMNS.FIRST_NAME,
  lastName: USER_COLUMNS.LAST_NAME,
  userRole: USER_COLUMNS.ROLE,
  
  // Documentos
  documentId: DOCUMENT_COLUMNS.ID,
  filename: DOCUMENT_COLUMNS.ORIGINAL_FILENAME,
  fileType: DOCUMENT_COLUMNS.FILE_TYPE,
  fileSize: DOCUMENT_COLUMNS.FILE_SIZE_BYTES,
  filePath: DOCUMENT_COLUMNS.FILE_PATH,
  storageUrl: DOCUMENT_COLUMNS.STORAGE_URL,
  processingStatus: DOCUMENT_COLUMNS.PROCESSING_STATUS,
  uploadedAt: DOCUMENT_COLUMNS.UPLOADED_AT,
  
  // Análisis
  analysisId: ANALYSIS_COLUMNS.ID,
  analysisType: ANALYSIS_COLUMNS.ANALYSIS_TYPE,
  analysisResults: ANALYSIS_COLUMNS.ANALYSIS_RESULTS,
  confidenceScore: ANALYSIS_COLUMNS.CONFIDENCE_SCORE,
  processingTime: ANALYSIS_COLUMNS.PROCESSING_TIME_MS,
  tokensUsed: ANALYSIS_COLUMNS.TOKENS_USED,
  costUsd: ANALYSIS_COLUMNS.COST_USD,
  modelUsed: ANALYSIS_COLUMNS.MODEL_USED,
  
  // Trabajos batch
  jobId: BATCH_JOB_COLUMNS.ID,
  jobName: BATCH_JOB_COLUMNS.JOB_NAME,
  jobConfig: BATCH_JOB_COLUMNS.JOB_CONFIG,
  jobStatus: BATCH_JOB_COLUMNS.JOB_STATUS,
  totalFiles: BATCH_JOB_COLUMNS.TOTAL_FILES,
  processedFiles: BATCH_JOB_COLUMNS.PROCESSED_FILES,
  failedFiles: BATCH_JOB_COLUMNS.FAILED_FILES,
  
  // Configuración de IA
  groqApiKey: USER_CONFIGURATION_COLUMNS.GROQ_API_KEY,
  chutesApiKey: USER_CONFIGURATION_COLUMNS.CHUTES_API_KEY,
  groqModel: USER_CONFIGURATION_COLUMNS.GROQ_MODEL,
  chutesModel: USER_CONFIGURATION_COLUMNS.CHUTES_MODEL,
  groqTemperature: USER_CONFIGURATION_COLUMNS.GROQ_TEMPERATURE,
  chutesTemperature: USER_CONFIGURATION_COLUMNS.CHUTES_TEMPERATURE,
  groqMaxTokens: USER_CONFIGURATION_COLUMNS.GROQ_MAX_TOKENS,
  chutesMaxTokens: USER_CONFIGURATION_COLUMNS.CHUTES_MAX_TOKENS,
  groqStream: USER_CONFIGURATION_COLUMNS.GROQ_STREAM,
  chutesStream: USER_CONFIGURATION_COLUMNS.CHUTES_STREAM
};

// Función para transformar nombres de columnas
export function transformColumnNames(data, direction = 'frontendToBackend') {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const transformed = {};
  
  for (const [key, value] of Object.entries(data)) {
    let newKey = key;
    
    if (direction === 'frontendToBackend') {
      // Transformar de formato frontend (camelCase) a backend (snake_case)
      newKey = COLUMN_MAPPING[key] || key;
    } else {
      // Transformar de formato backend (snake_case) a frontend (camelCase)
      // Buscar la clave inversa en el mapeo
      const inverseMapping = Object.entries(COLUMN_MAPPING)
        .find(([frontendKey, backendKey]) => backendKey === key);
      
      if (inverseMapping) {
        newKey = inverseMapping[0];
      }
    }
    
    // Si el valor es un objeto, aplicar transformación recursiva
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      transformed[newKey] = transformColumnNames(value, direction);
    } else if (Array.isArray(value)) {
      transformed[newKey] = value.map(item => 
        typeof item === 'object' ? transformColumnNames(item, direction) : item
      );
    } else {
      transformed[newKey] = value;
    }
  }
  
  return transformed;
}

// Función para obtener el nombre de columna estándar
export function getStandardColumnName(table, field) {
  const tableColumns = {
    users: USER_COLUMNS,
    documents: DOCUMENT_COLUMNS,
    analyses: ANALYSIS_COLUMNS,
    ocr_processes: OCR_COLUMNS,
    batch_jobs: BATCH_JOB_COLUMNS,
    batch_job_files: BATCH_JOB_FILE_COLUMNS,
    document_conversions: DOCUMENT_CONVERSION_COLUMNS,
    ai_model_metrics: AI_MODEL_METRICS_COLUMNS,
    user_configurations: USER_CONFIGURATION_COLUMNS,
    user_profiles: USER_PROFILE_COLUMNS,
    user_preferences: USER_PREFERENCE_COLUMNS,
    user_usage_stats: USER_USAGE_STATS_COLUMNS,
    help_articles: HELP_ARTICLE_COLUMNS,
    support_tickets: SUPPORT_TICKET_COLUMNS,
    ticket_messages: TICKET_MESSAGE_COLUMNS
  };
  
  const columns = tableColumns[table];
  if (!columns) {
    return field;
  }
  
  // Buscar en mayúsculas (constantes)
  const upperField = field.toUpperCase();
  if (columns[upperField]) {
    return columns[upperField];
  }
  
  // Buscar en el mapeo
  return COLUMN_MAPPING[field] || field;
}