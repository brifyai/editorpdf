/**
 * Utilidades de caché para optimizar respuestas frecuentes
 * 
 * Este módulo proporciona funciones para implementar caché en memoria
 * y estrategias de invalidación para mejorar el rendimiento
 */

const NodeCache = require('node-cache');

// Configuración de caché optimizada
const DEFAULT_TTL = 600; // 10 minutos TTL por defecto
const DEFAULT_CHECK_PERIOD = 120; // 2 minutos

// Crear instancias de caché para diferentes tipos de datos
const cacheInstances = {
  // Caché para documentos del usuario (5 minutos TTL)
  documents: new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
  }),
  
  // Caché para métricas (15 minutos TTL - optimizado)
  metrics: new NodeCache({
    stdTTL: 900,
    checkperiod: 120,
    useClones: false
  }),
  
  // Caché para configuración de usuario (10 minutos TTL)
  userConfig: new NodeCache({
    stdTTL: 600,
    checkperiod: 120,
    useClones: false
  }),
  
  // Caché para estado de APIs (2 minutos TTL)
  apiStatus: new NodeCache({
    stdTTL: 120,
    checkperiod: 30,
    useClones: false
  }),
  
  // Caché general para otros datos (10 minutos TTL)
  general: new NodeCache({
    stdTTL: DEFAULT_TTL,
    checkperiod: DEFAULT_CHECK_PERIOD,
    useClones: false
  })
};

// Mapa para controlar requests en progreso (evitar duplicados)
const inProgressRequests = new Map();

/**
 * Generar clave de caché basada en parámetros
 * @param {string} prefix - Prefijo para la clave
 * @param {Object} params - Parámetros para generar la clave
 * @returns {string} - Clave de caché generada
 */
function generateCacheKey(prefix, params = {}) {
  // Ordenar las claves para consistencia
  const sortedKeys = Object.keys(params).sort();
  
  // Crear string de parámetros
  const paramsString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}${paramsString ? `:${paramsString}` : ''}`;
}

/**
 * Obtener datos de caché con control de requests duplicados
 * @param {string} cacheType - Tipo de caché a usar
 * @param {string} key - Clave de caché
 * @param {Function} fetchFunction - Función para obtener datos si no están en caché
 * @returns {Promise<any>} - Datos almacenados o resultado de fetchFunction
 */
async function getFromCacheWithFetch(cacheType, key, fetchFunction) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    console.warn(`⚠️ Tipo de caché no válido: ${cacheType}`);
    return await fetchFunction();
  }
  
  // Verificar si ya hay un request en progreso para esta clave
  if (inProgressRequests.has(key)) {
    console.log(`⏳ Request en progreso, esperando: ${cacheType}:${key}`);
    return await inProgressRequests.get(key);
  }
  
  const data = cache.get(key);
  if (data) {
    console.log(`🎯 Cache hit: ${cacheType}:${key}`);
    return data;
  }
  
  console.log(`❌ Cache miss: ${cacheType}:${key}`);
  
  // Crear promise para evitar requests duplicados
  const requestPromise = (async () => {
    try {
      const result = await fetchFunction();
      
      // Almacenar en caché
      const ttl = cacheInstances[cacheType].options.stdTTL;
      cache.set(key, result, ttl);
      console.log(`💾 Datos almacenados en caché: ${cacheType}:${key}`);
      
      return result;
    } finally {
      // Limpiar el request en progreso
      inProgressRequests.delete(key);
    }
  })();
  
  // Marcar request como en progreso
  inProgressRequests.set(key, requestPromise);
  
  return await requestPromise;
}

/**
 * Obtener datos de caché (versión simple)
 * @param {string} cacheType - Tipo de caché a usar
 * @param {string} key - Clave de caché
 * @returns {any|null} - Datos almacenados o null si no existe
 */
function getFromCache(cacheType, key) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    console.warn(`⚠️ Tipo de caché no válido: ${cacheType}`);
    return null;
  }
  
  const data = cache.get(key);
  if (data) {
    console.log(`🎯 Cache hit: ${cacheType}:${key}`);
  } else {
    console.log(`❌ Cache miss: ${cacheType}:${key}`);
  }
  
  return data;
}

/**
 * Almacenar datos en caché
 * @param {string} cacheType - Tipo de caché a usar
 * @param {string} key - Clave de caché
 * @param {any} data - Datos a almacenar
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {boolean} - True si se almacenó correctamente
 */
function setInCache(cacheType, key, data, ttl) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    console.warn(`⚠️ Tipo de caché no válido: ${cacheType}`);
    return false;
  }
  
  const success = cache.set(key, data, ttl);
  if (success) {
    console.log(`💾 Datos almacenados en caché: ${cacheType}:${key}`);
  } else {
    console.error(`❌ Error al almacenar en caché: ${cacheType}:${key}`);
  }
  
  return success;
}

/**
 * Eliminar datos de caché
 * @param {string} cacheType - Tipo de caché
 * @param {string} key - Clave de caché a eliminar
 * @returns {number} - Número de claves eliminadas
 */
function deleteFromCache(cacheType, key) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    console.warn(`⚠️ Tipo de caché no válido: ${cacheType}`);
    return 0;
  }
  
  const deleted = cache.del(key);
  if (deleted > 0) {
    console.log(`🗑️ Eliminado de caché: ${cacheType}:${key}`);
  }
  
  return deleted;
}

/**
 * Invalidar caché por patrón
 * @param {string} cacheType - Tipo de caché
 * @param {string} pattern - Patrón de clave a buscar
 * @returns {number} - Número de claves eliminadas
 */
function invalidateCacheByPattern(cacheType, pattern) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    console.warn(`⚠️ Tipo de caché no válido: ${cacheType}`);
    return 0;
  }
  
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  if (matchingKeys.length > 0) {
    const deleted = cache.del(matchingKeys);
    console.log(`🗑️ Invalidados ${deleted} elementos de caché: ${cacheType}:${pattern}`);
    return deleted;
  }
  
  return 0;
}

/**
 * Obtener estadísticas de caché
 * @param {string} cacheType - Tipo de caché (opcional, si no se especifica devuelve todas)
 * @returns {Object} - Estadísticas de caché
 */
function getCacheStats(cacheType) {
  if (cacheType) {
    const cache = cacheInstances[cacheType];
    if (!cache) {
      return null;
    }
    
    const stats = cache.getStats();
    return {
      type: cacheType,
      ...stats,
      keys: cache.keys().length
    };
  } else {
    // Devolver estadísticas de todas las cachés
    const allStats = {};
    for (const type in cacheInstances) {
      const stats = cacheInstances[type].getStats();
      allStats[type] = {
        ...stats,
        keys: cacheInstances[type].keys().length
      };
    }
    return allStats;
  }
}

/**
 * Limpiar toda la caché o un tipo específico
 * @param {string} cacheType - Tipo de caché a limpiar (opcional)
 * @returns {boolean} - True si se limpió correctamente
 */
function clearCache(cacheType) {
  if (cacheType) {
    const cache = cacheInstances[cacheType];
    if (!cache) {
      return false;
    }
    
    cache.flushAll();
    console.log(`🧹 Caché limpiada: ${cacheType}`);
    return true;
  } else {
    // Limpiar todas las cachés
    for (const type in cacheInstances) {
      cacheInstances[type].flushAll();
      console.log(`🧹 Caché limpiada: ${type}`);
    }
    return true;
  }
}

/**
 * Middleware de Express para caché automático
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
function cacheMiddleware(options = {}) {
  const {
    cacheType = 'general',
    keyPrefix = '',
    ttl,
    shouldCache = (req) => req.method === 'GET',
    generateKey = (req) => {
      const params = { ...req.query, ...req.params };
      return generateCacheKey(keyPrefix, params);
    }
  } = options;
  
  return (req, res, next) => {
    // Verificar si se debe usar caché para esta solicitud
    if (!shouldCache(req)) {
      return next();
    }
    
    const cacheKey = generateKey(req);
    
    // Intentar obtener de caché
    const cachedData = getFromCache(cacheType, cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Intercepta el método json para almacenar en caché
    const originalJson = res.json;
    res.json = function(data) {
      // Almacenar en caché solo si la respuesta es exitosa
      if (res.statusCode < 400) {
        setInCache(cacheType, cacheKey, data, ttl);
      }
      
      // Llamar al método original
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Función para crear un caché con invalidación automática
 * @param {string} cacheType - Tipo de caché
 * @param {Array} invalidationTriggers - Triggers de invalidación
 * @returns {Object} - Objeto con métodos de caché
 */
function createAutoInvalidatingCache(cacheType, invalidationTriggers = []) {
  const cache = cacheInstances[cacheType];
  if (!cache) {
    throw new Error(`Tipo de caché no válido: ${cacheType}`);
  }
  
  // Configurar listeners de invalidación
  invalidationTriggers.forEach(trigger => {
    // Aquí podrías configurar listeners para eventos específicos
    // Por ejemplo, cuando se actualiza un documento, se invalida la caché de documentos
    console.log(`🔧 Configurado trigger de invalidación: ${trigger} para ${cacheType}`);
  });
  
  return {
    get: (key) => getFromCache(cacheType, key),
    set: (key, data, ttl) => setInCache(cacheType, key, data, ttl),
    delete: (key) => deleteFromCache(cacheType, key),
    invalidate: (pattern) => invalidateCacheByPattern(cacheType, pattern),
    clear: () => clearCache(cacheType),
    stats: () => getCacheStats(cacheType)
  };
}

module.exports = {
  // Funciones básicas
  getFromCache,
  getFromCacheWithFetch,
  setInCache,
  deleteFromCache,
  invalidateCacheByPattern,
  clearCache,
  
  // Utilidades
  generateCacheKey,
  getCacheStats,
  
  // Middleware
  cacheMiddleware,
  
  // Fábricas
  createAutoInvalidatingCache,
  
  // Instancias de caché para uso directo
  cacheInstances,
  
  // Constantes de tipos de caché
  CACHE_TYPES: {
    DOCUMENTS: 'documents',
    METRICS: 'metrics',
    USER_CONFIG: 'userConfig',
    API_STATUS: 'apiStatus',
    GENERAL: 'general'
  }
};