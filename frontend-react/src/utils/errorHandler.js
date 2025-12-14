/**
 * Servicio de manejo de errores para el frontend
 * Proporciona un manejo consistente y amigable de errores en toda la aplicación
 */

/**
 * Clase de error personalizada para el frontend
 */
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null, isRetryable = false) {
    super(message);
    this.code = code;
    this.details = details;
    this.isRetryable = isRetryable;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Códigos de error estandarizados
 */
const ERROR_CODES = {
  // Errores de red
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Errores de API
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Errores de datos
  DATA_ERROR: 'DATA_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_REFERENCE: 'INVALID_REFERENCE',
  
  // Errores de archivo
  FILE_ERROR: 'FILE_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  
  // Errores de procesamiento
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  BATCH_PROCESSING_ERROR: 'BATCH_PROCESSING_ERROR',
  AI_PROCESSING_ERROR: 'AI_PROCESSING_ERROR',
  
  // Errores de sistema
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Errores de usuario
  USER_CANCELLED: 'USER_CANCELLED',
  INVALID_INPUT: 'INVALID_INPUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Mapeo de códigos de error a mensajes amigables
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'La operación tardó demasiado tiempo. Intenta nuevamente.',
  [ERROR_CODES.CONNECTION_ERROR]: 'No se pudo conectar al servidor. Intenta más tarde.',
  
  [ERROR_CODES.API_ERROR]: 'Error en la comunicación con el servidor.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Los datos proporcionados no son válidos.',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'No tienes permisos para realizar esta acción.',
  [ERROR_CODES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Demasiadas solicitudes. Espera unos minutos e intenta nuevamente.',
  
  [ERROR_CODES.DATA_ERROR]: 'Error en los datos. Verifica la información proporcionada.',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Este registro ya existe.',
  [ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Faltan campos requeridos.',
  [ERROR_CODES.INVALID_REFERENCE]: 'Referencia inválida. El elemento relacionado no existe.',
  
  [ERROR_CODES.FILE_ERROR]: 'Error en el manejo del archivo.',
  [ERROR_CODES.FILE_TOO_LARGE]: 'El archivo es demasiado grande. El tamaño máximo es 10MB.',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Tipo de archivo no válido. Solo se permiten PDF, DOCX y TXT.',
  [ERROR_CODES.FILE_UPLOAD_ERROR]: 'Error al subir el archivo. Intenta nuevamente.',
  
  [ERROR_CODES.PROCESSING_ERROR]: 'Error en el procesamiento de datos.',
  [ERROR_CODES.BATCH_PROCESSING_ERROR]: 'Error en el procesamiento por lotes.',
  [ERROR_CODES.AI_PROCESSING_ERROR]: 'Error en el procesamiento con inteligencia artificial.',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'Error interno del servidor. Contacta al soporte técnico.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Servicio no disponible. Intenta más tarde.',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Error en un servicio externo. Intenta más tarde.',
  
  [ERROR_CODES.USER_CANCELLED]: 'Operación cancelada por el usuario.',
  [ERROR_CODES.INVALID_INPUT]: 'Entrada inválida. Verifica los datos proporcionados.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Error desconocido. Contacta al soporte técnico.'
};

/**
 * Determina si un error es reintentable
 */
const isRetryableError = (error) => {
  const retryableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.CONNECTION_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE,
    ERROR_CODES.RATE_LIMIT_EXCEEDED
  ];
  
  return retryableCodes.includes(error?.code) || error?.isRetryable;
};

/**
 * Extrae información de error de una respuesta HTTP
 */
const extractErrorFromResponse = (response) => {
  if (!response) {
    return new AppError(
      'No se recibió respuesta del servidor',
      ERROR_CODES.NETWORK_ERROR,
      null,
      true
    );
  }
  
  const { status, data } = response;
  
  // Errores comunes por código de estado
  switch (status) {
    case 400:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
        ERROR_CODES.VALIDATION_ERROR,
        data?.details || data
      );
    
    case 401:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_ERROR],
        ERROR_CODES.AUTHENTICATION_ERROR,
        data?.details || data
      );
    
    case 403:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.AUTHORIZATION_ERROR],
        ERROR_CODES.AUTHORIZATION_ERROR,
        data?.details || data
      );
    
    case 404:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.NOT_FOUND],
        ERROR_CODES.NOT_FOUND,
        data?.details || data
      );
    
    case 429:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        data?.details || data,
        true
      );
    
    case 500:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
        ERROR_CODES.INTERNAL_ERROR,
        data?.details || data
      );
    
    case 502:
    case 503:
    case 504:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.SERVICE_UNAVAILABLE],
        ERROR_CODES.SERVICE_UNAVAILABLE,
        data?.details || data,
        true
      );
    
    default:
      return new AppError(
        data?.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        ERROR_CODES.UNKNOWN_ERROR,
        data?.details || data
      );
  }
};

/**
 * Maneja errores de red
 */
const handleNetworkError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
      ERROR_CODES.TIMEOUT_ERROR,
      { originalError: error.message },
      true
    );
  }
  
  if (error.message === 'Network Error') {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR,
      { originalError: error.message },
      true
    );
  }
  
  return new AppError(
    error.message || ERROR_MESSAGES[ERROR_CODES.CONNECTION_ERROR],
    ERROR_CODES.CONNECTION_ERROR,
    { originalError: error.message },
    true
  );
};

/**
 * Normaliza un error a un formato estándar
 */
const normalizeError = (error) => {
  // Si ya es un AppError, devolverlo tal cual
  if (error instanceof AppError) {
    return error;
  }
  
  // Si es un error de Axios con respuesta
  if (error?.response) {
    return extractErrorFromResponse(error.response);
  }
  
  // Si es un error de red de Axios
  if (error?.request) {
    return handleNetworkError(error);
  }
  
  // Si es un error genérico
  return new AppError(
    error?.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    ERROR_CODES.UNKNOWN_ERROR,
    { originalError: error?.message || error }
  );
};

/**
 * Muestra un error al usuario
 */
const showErrorToUser = (error, options = {}) => {
  const normalizedError = normalizeError(error);
  const { 
    showToast = true, 
    logToConsole = true, 
    customMessage = null 
  } = options;
  
  const message = customMessage || normalizedError.message;
  
  // Log a consola para depuración
  if (logToConsole) {
    console.error('❌ Error:', {
      message: normalizedError.message,
      code: normalizedError.code,
      details: normalizedError.details,
      timestamp: normalizedError.timestamp,
      stack: normalizedError.stack
    });
  }
  
  // Mostrar toast al usuario
  if (showToast && typeof window !== 'undefined') {
    // Importar dinámicamente para evitar problemas con SSR
    import('react-hot-toast').then(({ toast }) => {
      toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    });
  }
  
  return normalizedError;
};

/**
 * Maneja errores en operaciones asíncronas con reintentos
 */
const withRetry = async (fn, options = {}) => {
  const { 
    maxRetries = 3, 
    delay = 1000, 
    backoff = 2,
    onRetry = null 
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = normalizeError(error);
      
      if (!isRetryableError(lastError) || attempt === maxRetries) {
        throw lastError;
      }
      
      if (onRetry) {
        onRetry(lastError, attempt);
      }
      
      // Esperar con backoff exponencial
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

/**
 * Envuelve una función con manejo de errores
 */
const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const normalizedError = normalizeError(error);
      showErrorToUser(normalizedError, options);
      throw normalizedError;
    }
  };
};

/**
 * Crea un manejador de errores para componentes React
 */
const useErrorHandler = () => {
  const handleError = (error, options = {}) => {
    return showErrorToUser(error, options);
  };
  
  const handleAsyncError = async (asyncFn, options = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  };
  
  return { handleError, handleAsyncError };
};

module.exports = {
  AppError,
  ERROR_CODES,
  ERROR_MESSAGES,
  isRetryableError,
  extractErrorFromResponse,
  handleNetworkError,
  normalizeError,
  showErrorToUser,
  withRetry,
  withErrorHandling,
  useErrorHandler
};