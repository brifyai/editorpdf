/**
 * Middleware de manejo de errores centralizado
 * Proporciona un manejo consistente de errores en toda la aplicación
 */

const createErrorResponse = require('../utils/database').createErrorResponse;

/**
 * Manejo de errores asíncronos para rutas Express
 * Evita el try-catch en cada ruta
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Clase de error personalizada para la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log del error para depuración
  console.error(`❌ Error [${new Date().toISOString()}]:`, {
    path: req.path,
    method: req.method,
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    stack: err.stack,
    details: error.details
  });

  // Error de base de datos
  if (err.code === '23505') {
    error = new AppError(
      'Registro duplicado: ya existe un elemento con estos datos',
      409,
      'DUPLICATE_ENTRY',
      { field: err.detail?.match(/Key \((.*?)\)/)?.[1] }
    );
  }

  // Error de validación de datos
  if (err.code === '23502') {
    error = new AppError(
      'Datos incompletos: faltan campos requeridos',
      400,
      'MISSING_REQUIRED_FIELDS',
      { field: err.column }
    );
  }

  // Error de restricción de clave foránea
  if (err.code === '23503') {
    error = new AppError(
      'Referencia inválida: el elemento relacionado no existe',
      400,
      'INVALID_REFERENCE',
      { table: err.table, constraint: err.constraint }
    );
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError(
      'Token inválido',
      401,
      'INVALID_TOKEN'
    );
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = new AppError(
      'Token expirado',
      401,
      'EXPIRED_TOKEN'
    );
  }

  // Error de límite de velocidad
  if (err.code === 'ERR_HTTP_HEADERS_SENT') {
    return res.status(429).json(createErrorResponse(
      'Demasiadas solicitudes, por favor intente más tarde',
      'RATE_LIMIT_EXCEEDED',
      429
    ));
  }

  // Error de validación de entrada
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new AppError(
      'Error de validación de datos',
      400,
      'VALIDATION_ERROR',
      { fields: messages }
    );
  }

  // Error de conexión a base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    error = new AppError(
      'Error de conexión a la base de datos',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  // Error de API externa
  if (err.response) {
    error = new AppError(
      'Error en servicio externo',
      502,
      'EXTERNAL_SERVICE_ERROR',
      { 
        service: err.config?.url,
        status: err.response.status,
        message: err.response.data?.message || 'Error desconocido'
      }
    );
  }

  // Error de archivo no encontrado
  if (err.code === 'ENOENT') {
    error = new AppError(
      'Recurso no encontrado',
      404,
      'NOT_FOUND',
      { path: err.path }
    );
  }

  // Error de permisos
  if (err.code === 'EACCES') {
    error = new AppError(
      'Permiso denegado',
      403,
      'PERMISSION_DENIED'
    );
  }

  // Si es un error de la aplicación (AppError), usar su información
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(createErrorResponse(
      err.message,
      err.code,
      err.statusCode,
      err.details
    ));
  }

  // Error genérico para desarrollo
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode || 500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message || 'Error interno del servidor',
        code: error.code || 'INTERNAL_ERROR',
        details: error.details || null,
        stack: err.stack
      }
    });
  }

  // Error genérico para producción
  res.status(error.statusCode || 500).json(createErrorResponse(
    'Error interno del servidor',
    'INTERNAL_ERROR',
    error.statusCode || 500
  ));
};

/**
 * Middleware para capturar rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.originalUrl}`,
    404,
    'NOT_FOUND',
    { method: req.method, path: req.path }
  );
  next(error);
};

/**
 * Middleware para validar esquemas de datos
 */
const validateSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new AppError(
      errorMessage,
      400,
      'VALIDATION_ERROR',
      { fields: error.details.map(detail => detail.path.join('.')) }
    ));
  }
  next();
};

module.exports = {
  asyncHandler,
  AppError,
  errorHandler,
  notFoundHandler,
  validateSchema
};