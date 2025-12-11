/**
 * Middleware unificado de autenticación
 * Reemplaza requireAuth y authenticateUser duplicados
 */

const { supabaseClient } = require('../database/supabaseClient');
const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Middleware principal de autenticación
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.requireUser - Si requiere objeto usuario completo
 * @param {boolean} options.setUserContext - Si establece contexto de usuario para RLS
 * @param {string[]} options.allowedRoles - Roles permitidos (opcional)
 */
const authenticate = (options = {}) => {
  const {
    requireUser = false,
    setUserContext = false,
    allowedRoles = []
  } = options;

  return async (req, res, next) => {
    try {
      // Extraer token de múltiples fuentes
      const token = req.headers.authorization?.replace('Bearer ', '') ||
                   req.cookies?.authToken ||
                   req.cookies?.auth_token ||
                   req.query.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token de autenticación requerido',
          code: 'AUTH_TOKEN_REQUIRED',
          redirectTo: '/auth'
        });
      }

      // Verificar token JWT
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET, {
          issuer: 'pdf-analyzer-app',
          audience: 'pdf-analyzer-users'
        });
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido o expirado',
          code: 'INVALID_TOKEN',
          details: jwtError.message
        });
      }
      
      const userId = decoded.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Token no contiene información de usuario válida',
          code: 'INVALID_TOKEN_PAYLOAD'
        });
      }

      // Verificar conexión a base de datos
      if (!supabaseClient.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'Base de datos no disponible',
          code: 'DATABASE_UNAVAILABLE'
        });
      }

      const supabase = supabaseClient.getClient();

      // Obtener usuario
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, first_name, last_name, role, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado o inactivo',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar roles si se especifican
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: user.role
        });
      }

      // Establecer contexto de usuario para RLS si se solicita
      if (setUserContext) {
        await supabase.rpc('set_config', {
          config_name: 'app.current_user_id',
          config_value: userId.toString()
        });
      }

      // Establecer información de usuario en la request
      req.user = user;
      req.userId = userId;

      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero establece usuario si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Leer token de múltiples fuentes, incluyendo X-User-ID
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                 req.cookies?.authToken ||
                 req.cookies?.auth_token ||
                 req.query.token;
    
    // También leer X-User-ID header
    const userIdHeader = req.headers['x-user-id'];

    if (!token && !userIdHeader) {
      req.user = null;
      req.userId = null;
      return next();
    }

    // Usar X-User-ID si está disponible, sino usar token
    const userId = parseInt(userIdHeader || token);
    
    if (!userId || isNaN(userId)) {
      req.user = null;
      req.userId = null;
      return next();
    }

    if (!supabaseClient.isInitialized()) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const supabase = supabaseClient.getClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role, is_active')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      req.user = null;
      req.userId = null;
    } else {
      req.user = user;
      req.userId = userId;
      
      // Establecer contexto de usuario para RLS
      await supabase.rpc('set_config', {
        config_name: 'app.current_user_id',
        config_value: userId.toString()
      });
    }

    next();
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole
};