/**
 * Endpoints de autenticación optimizados
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');
const {
  createResponse,
  createErrorResponse,
  isDatabaseAvailable,
  getSupabaseClient,
  setUserContext
} = require('../utils/database');

const router = express.Router();

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generar token JWT
 */
function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'pdf-analyzer-app',
      audience: 'pdf-analyzer-users'
    }
  );
}

/**
 * Verificar token JWT
 */
function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'pdf-analyzer-app',
      audience: 'pdf-analyzer-users'
    });
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Registro de usuario
 */
router.post('/register', async (req, res) => {
  // Invalidar caché de métricas (nuevo usuario)
  invalidateCache(CACHE_TYPES.METRICS);
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validaciones básicas
    if (!email || !username || !password) {
      return res.status(400).json(createErrorResponse(
        'Email, username y password son requeridos',
        'MISSING_REQUIRED_FIELDS',
        400
      ));
    }

    if (password.length < 6) {
      return res.status(400).json(createErrorResponse(
        'La contraseña debe tener al menos 6 caracteres',
        'PASSWORD_TOO_SHORT',
        400
      ));
    }

    if (!isDatabaseAvailable()) {
      return res.status(503).json(createErrorResponse(
        'Base de datos no disponible',
        'DATABASE_UNAVAILABLE',
        503
      ));
    }

    const supabase = getSupabaseClient();

    // Verificar si el email ya existe
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(400).json(createErrorResponse(
        'El email ya está registrado',
        'EMAIL_ALREADY_EXISTS',
        400
      ));
    }

    // Verificar si el username ya existe
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(400).json(createErrorResponse(
        'El username ya está en uso',
        'USERNAME_ALREADY_EXISTS',
        400
      ));
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        email_verified: false
      }])
      .select('id, email, username, first_name, last_name, role, created_at')
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      return res.status(500).json(createErrorResponse(
        'Error al crear usuario: ' + error.message,
        'USER_CREATION_ERROR',
        500
      ));
    }

    // Generar token JWT
    const token = generateJWT(newUser);

    console.log(`✅ Usuario creado en Supabase: ${email} (ID: ${newUser.id})`);

    res.status(201).json(createResponse(true, {
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      },
      token: token,
      expiresIn: JWT_EXPIRES_IN
    }));

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json(createErrorResponse(
      'Error interno del servidor',
      'INTERNAL_ERROR',
      500
    ));
  }
});

/**
 * Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse(
        'Email y password son requeridos',
        'MISSING_CREDENTIALS',
        400
      ));
    }

    if (!isDatabaseAvailable()) {
      return res.status(503).json(createErrorResponse(
        'Base de datos no disponible',
        'DATABASE_UNAVAILABLE',
        503
      ));
    }

    const supabase = getSupabaseClient();

    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, password_hash, first_name, last_name, role, is_active, last_login')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json(createErrorResponse(
        'Credenciales inválidas',
        'INVALID_CREDENTIALS',
        401
      ));
    }

    if (!user.is_active) {
      return res.status(401).json(createErrorResponse(
        'Usuario inactivo',
        'USER_INACTIVE',
        401
      ));
    }

    // Verificar contraseña (compatible con hash y texto plano)
    let passwordMatch = false;
    
    // Detectar si la contraseña almacenada es un hash bcrypt o texto plano
    const isHashedPassword = user.password_hash && user.password_hash.startsWith('$2');
    
    if (isHashedPassword) {
      // Es un hash bcrypt, usar bcrypt.compare()
      try {
        passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log('🔍 LOGIN DEBUG - bcrypt compare result:', passwordMatch);
      } catch (bcryptError) {
        console.log('🔍 LOGIN DEBUG - Error bcrypt:', bcryptError.message);
        passwordMatch = false;
      }
    } else {
      // Es texto plano, comparar directamente
      console.log('🔍 LOGIN DEBUG - Detectado texto plano, comparando directamente...');
      passwordMatch = password === user.password_hash;
      console.log('🔍 LOGIN DEBUG - Texto plano compare result:', passwordMatch);
    }

    console.log('🔍 LOGIN DEBUG - Password provided:', password);
    console.log('🔍 LOGIN DEBUG - Password in DB:', user.password_hash);
    console.log('🔍 LOGIN DEBUG - Final passwordMatch:', passwordMatch);

    if (!passwordMatch) {
      console.log('🔍 LOGIN DEBUG - Password mismatch, returning 401');
      return res.status(401).json(createErrorResponse(
        'Credenciales inválidas',
        'INVALID_CREDENTIALS',
        401
      ));
    }

    // Actualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generar token JWT
    const token = generateJWT(user);

    console.log(`✅ Login exitoso (Supabase): ${email} (ID: ${user.id})`);
    
    const responseData = {
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        lastLogin: user.last_login
      },
      token: token,
      expiresIn: JWT_EXPIRES_IN
    };
    
    console.log('🔍 DEBUG - Enviando respuesta al frontend:', {
      success: true,
      user: responseData.user,
      token: token ? token.substring(0, 20) + '...' : 'No token',
      expiresIn: JWT_EXPIRES_IN
    });

    res.json(createResponse(true, responseData));

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json(createErrorResponse(
      'Error interno del servidor',
      'INTERNAL_ERROR',
      500
    ));
  }
});

/**
 * Obtener perfil del usuario actual
 */
router.get('/profile', authenticate({ requireUser: true }), async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role, subscription_tier, api_usage_limit, monthly_api_count, storage_quota_mb, storage_used_mb, email_verified, created_at, last_login')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json(createErrorResponse(
        'Usuario no encontrado',
        'USER_NOT_FOUND',
        404
      ));
    }

    res.json(createResponse(true, {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        apiUsageLimit: user.api_usage_limit,
        monthlyApiCount: user.monthly_api_count,
        storageQuotaMb: user.storage_quota_mb,
        storageUsedMb: user.storage_used_mb,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    }));

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json(createErrorResponse(
      'Error interno del servidor',
      'INTERNAL_ERROR',
      500
    ));
  }
});

/**
 * Logout
 */
router.post('/logout', authenticate({ requireUser: true }), async (req, res) => {
  try {
    // Aquí iría la invalidación del token JWT
    // Por ahora, simplemente respondemos exitosamente
    
    res.json(createResponse(true, {
      message: 'Sesión cerrada exitosamente'
    }));

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json(createErrorResponse(
      'Error interno del servidor',
      'INTERNAL_ERROR',
      500
    ));
  }
});

/**
 * Perfil simplificado sin autenticación estricta
 */
router.get('/profile-simple', async (req, res) => {
  try {
    if (!isDatabaseAvailable()) {
      return res.json(createResponse(true, {
        user: {
          id: 2,
          email: 'camilo@alegria.com',
          username: 'camilo_alegria',
          firstName: 'Camilo',
          lastName: 'Alegria',
          role: 'user'
        },
        mode: 'fallback'
      }));
    }

    const supabase = getSupabaseClient();
    
    // Buscar usuario activo más reciente
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role')
      .eq('is_active', true)
      .order('last_login', { ascending: false })
      .limit(1)
      .single();

    if (error || !user) {
      return res.json(createResponse(true, {
        user: {
          id: 2,
          email: 'camilo@alegria.com',
          username: 'camilo_alegria',
          firstName: 'Camilo',
          lastName: 'Alegria',
          role: 'user'
        },
        mode: 'fallback'
      }));
    }

    res.json(createResponse(true, {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      mode: 'database'
    }));

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.json(createResponse(true, {
      user: {
        id: 2,
        email: 'camilo@alegria.com',
        username: 'camilo_alegria',
        firstName: 'Camilo',
        lastName: 'Alegria',
        role: 'user'
      },
      mode: 'error_fallback'
    }));
  }
});

/**
 * Endpoint de perfil para depuración (sin autenticación requerida)
 */
router.get('/profile-debug', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                 req.cookies?.authToken ||
                 req.cookies?.auth_token ||
                 req.query.token;

    console.log('🔍 DEBUG - Token recibido:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      return res.status(401).json(createErrorResponse(
        'No se proporcionó token de autenticación',
        'NO_TOKEN',
        401
      ));
    }

    // Intentar verificar el token
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'pdf-analyzer-app',
        audience: 'pdf-analyzer-users'
      });
      
      console.log('🔍 DEBUG - Token decodificado:', decoded);
      
      if (!isDatabaseAvailable()) {
        return res.json(createResponse(true, {
          user: {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            firstName: 'Usuario',
            lastName: 'Debug',
            role: decoded.role || 'user'
          },
          mode: 'token_valid_no_db',
          decoded: decoded
        }));
      }

      const supabase = getSupabaseClient();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, first_name, last_name, role')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        console.log('🔍 DEBUG - Usuario no encontrado en BD:', error);
        return res.json(createResponse(true, {
          user: {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            firstName: 'Usuario',
            lastName: 'No encontrado',
            role: decoded.role || 'user'
          },
          mode: 'token_valid_user_not_found',
          decoded: decoded,
          dbError: error?.message
        }));
      }

      console.log('🔍 DEBUG - Usuario encontrado:', user);
      
      res.json(createResponse(true, {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        mode: 'success',
        decoded: decoded
      }));

    } catch (jwtError) {
      console.log('🔍 DEBUG - Error JWT:', jwtError.message);
      return res.status(401).json(createErrorResponse(
        `Token inválido: ${jwtError.message}`,
        'INVALID_TOKEN',
        401
      ));
    }

  } catch (error) {
    console.error('🔍 DEBUG - Error general:', error);
    res.status(500).json(createErrorResponse(
      `Error interno: ${error.message}`,
      'INTERNAL_ERROR',
      500
    ));
  }
});

module.exports = router;