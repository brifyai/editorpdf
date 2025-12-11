/**
 * Cache Manager - Sistema avanzado de gestión de caché
 * Implementa múltiples estrategias de caché con invalidación inteligente y warming automático
 */

class CacheManager {
    constructor(options = {}) {
        this.options = {
            defaultTTL: 300000, // 5 minutos
            maxSize: 100 * 1024 * 1024, // 100MB
            strategy: 'lru', // lru, lfu, fifo
            compressionEnabled: true,
            encryptionEnabled: false,
            persistenceEnabled: true,
            ...options
        };
        
        this.cache = new Map();
        this.metadata = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            size: 0,
            lastCleanup: Date.now()
        };
        
        this.strategies = {
            lru: new LRUStrategy(this.cache, this.metadata),
            lfu: new LFUStrategy(this.cache, this.metadata),
            fifo: new FIFOStrategy(this.cache, this.metadata)
        };
        
        this.compression = new CompressionManager();
        this.encryption = new EncryptionManager();
        this.persistence = new PersistenceManager();
        this.warming = new CacheWarmingManager(this);
        this.invalidator = new CacheInvalidator(this);
        
        this.initializeCache();
    }

    /**
     * Inicializa el sistema de caché
     */
    async initializeCache() {
        console.log('🚀 Inicializando Cache Manager...');
        
        // Cargar datos persistentes si está habilitado
        if (this.options.persistenceEnabled) {
            await this.loadPersistedData();
        }
        
        // Iniciar limpieza automática
        this.startAutoCleanup();
        
        // Iniciar warming de caché
        this.warming.start();
        
        // Configurar invalidación automática
        this.invalidator.start();
        
        console.log('✅ Cache Manager inicializado');
    }

    /**
     * Obtiene un valor del caché
     * @param {string} key - Clave del valor
     * @returns {Promise<any>} Valor almacenado o null
     */
    async get(key) {
        const startTime = performance.now();
        
        try {
            // Verificar si existe en caché
            if (!this.cache.has(key)) {
                this.stats.misses++;
                return null;
            }
            
            const entry = this.cache.get(key);
            const metadata = this.metadata.get(key);
            
            // Verificar si ha expirado
            if (this.isExpired(metadata)) {
                this.delete(key);
                this.stats.misses++;
                return null;
            }
            
            // Actualizar estadísticas de acceso
            this.updateAccessStats(key, metadata);
            
            // Descomprimir si es necesario
            let value = entry;
            if (metadata.compressed) {
                value = await this.compression.decompress(value);
            }
            
            // Desencriptar si es necesario
            if (metadata.encrypted) {
                value = await this.encryption.decrypt(value);
            }
            
            this.stats.hits++;
            
            // Registrar métricas de rendimiento
            const duration = performance.now() - startTime;
            this.recordGetMetrics(key, duration, true);
            
            return value;
            
        } catch (error) {
            console.error(`Error obteniendo clave ${key} del caché:`, error);
            this.stats.misses++;
            
            const duration = performance.now() - startTime;
            this.recordGetMetrics(key, duration, false);
            
            return null;
        }
    }

    /**
     * Almacena un valor en el caché
     * @param {string} key - Clave del valor
     * @param {any} value - Valor a almacenar
     * @param {Object} options - Opciones de almacenamiento
     * @returns {Promise<boolean>} True si se almacenó correctamente
     */
    async set(key, value, options = {}) {
        const startTime = performance.now();
        
        try {
            const config = {
                ttl: options.ttl || this.options.defaultTTL,
                priority: options.priority || 'normal',
                tags: options.tags || [],
                compress: options.compress !== false && this.options.compressionEnabled,
                encrypt: options.encrypt && this.options.encryptionEnabled,
                persist: options.persist !== false && this.options.persistenceEnabled,
                ...options
            };
            
            // Verificar tamaño máximo
            const estimatedSize = this.estimateSize(value);
            if (estimatedSize > this.options.maxSize) {
                console.warn(`Valor demasiado grande para caché: ${key} (${estimatedSize} bytes)`);
                return false;
            }
            
            // Liberar espacio si es necesario
            await this.ensureSpace(estimatedSize);
            
            // Comprimir si es necesario
            let processedValue = value;
            let compressed = false;
            
            if (config.compress && this.shouldCompress(value)) {
                processedValue = await this.compression.compress(processedValue);
                compressed = true;
            }
            
            // Encriptar si es necesario
            let encrypted = false;
            if (config.encrypt) {
                processedValue = await this.encryption.encrypt(processedValue);
                encrypted = true;
            }
            
            // Crear metadata
            const metadata = {
                key,
                size: this.estimateSize(processedValue),
                originalSize: estimatedSize,
                createdAt: Date.now(),
                expiresAt: Date.now() + config.ttl,
                lastAccessed: Date.now(),
                accessCount: 0,
                priority: config.priority,
                tags: config.tags,
                compressed,
                encrypted,
                persist: config.persist
            };
            
            // Almacenar en caché
            this.cache.set(key, processedValue);
            this.metadata.set(key, metadata);
            
            // Actualizar estadísticas
            this.stats.sets++;
            this.stats.size += metadata.size;
            
            // Persistir si es necesario
            if (config.persist) {
                await this.persistence.save(key, processedValue, metadata);
            }
            
            // Registrar métricas de rendimiento
            const duration = performance.now() - startTime;
            this.recordSetMetrics(key, duration, true);
            
            return true;
            
        } catch (error) {
            console.error(`Error almacenando clave ${key} en caché:`, error);
            
            const duration = performance.now() - startTime;
            this.recordSetMetrics(key, duration, false);
            
            return false;
        }
    }

    /**
     * Elimina un valor del caché
     * @param {string} key - Clave a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(key) {
        try {
            if (!this.cache.has(key)) {
                return false;
            }
            
            const metadata = this.metadata.get(key);
            
            // Eliminar de caché
            this.cache.delete(key);
            this.metadata.delete(key);
            
            // Actualizar estadísticas
            this.stats.deletes++;
            this.stats.size -= metadata.size;
            
            // Eliminar de persistencia
            if (metadata.persist) {
                await this.persistence.delete(key);
            }
            
            return true;
            
        } catch (error) {
            console.error(`Error eliminando clave ${key} del caché:`, error);
            return false;
        }
    }

    /**
     * Verifica si una clave existe en caché
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si existe
     */
    has(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        
        const metadata = this.metadata.get(key);
        return !this.isExpired(metadata);
    }

    /**
     * Limpia todo el caché
     * @returns {Promise<boolean>} True si se limpió correctamente
     */
    async clear() {
        try {
            // Limpiar caché en memoria
            this.cache.clear();
            this.metadata.clear();
            
            // Resetear estadísticas
            this.stats = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                evictions: 0,
                size: 0,
                lastCleanup: Date.now()
            };
            
            // Limpiar persistencia
            if (this.options.persistenceEnabled) {
                await this.persistence.clear();
            }
            
            console.log('🗑️ Caché limpiado completamente');
            return true;
            
        } catch (error) {
            console.error('Error limpiando caché:', error);
            return false;
        }
    }

    /**
     * Obtiene múltiples valores del caché
     * @param {Array<string>} keys - Array de claves
     * @returns {Promise<Object>} Objeto con los valores encontrados
     */
    async mget(keys) {
        const results = {};
        const promises = keys.map(async (key) => {
            const value = await this.get(key);
            if (value !== null) {
                results[key] = value;
            }
        });
        
        await Promise.all(promises);
        return results;
    }

    /**
     * Almacena múltiples valores en el caché
     * @param {Object} items - Objeto con clave-valor
     * @param {Object} options - Opciones de almacenamiento
     * @returns {Promise<number>} Número de valores almacenados
     */
    async mset(items, options = {}) {
        const promises = Object.entries(items).map(([key, value]) => 
            this.set(key, value, options)
        );
        
        const results = await Promise.all(promises);
        return results.filter(success => success).length;
    }

    /**
     * Obtiene valores por etiquetas
     * @param {Array<string>} tags - Etiquetas a buscar
     * @returns {Promise<Object>} Objeto con los valores encontrados
     */
    async getByTags(tags) {
        const results = {};
        
        for (const [key, metadata] of this.metadata) {
            if (this.hasMatchingTags(metadata.tags, tags)) {
                const value = await this.get(key);
                if (value !== null) {
                    results[key] = value;
                }
            }
        }
        
        return results;
    }

    /**
     * Elimina valores por etiquetas
     * @param {Array<string>} tags - Etiquetas a eliminar
     * @returns {Promise<number>} Número de valores eliminados
     */
    async deleteByTags(tags) {
        let deletedCount = 0;
        
        for (const [key, metadata] of this.metadata) {
            if (this.hasMatchingTags(metadata.tags, tags)) {
                const deleted = await this.delete(key);
                if (deleted) {
                    deletedCount++;
                }
            }
        }
        
        return deletedCount;
    }

    /**
     * Invalida valores por patrón
     * @param {RegExp|string} pattern - Patrón de claves a invalidar
     * @returns {Promise<number>} Número de valores invalidados
     */
    async invalidateByPattern(pattern) {
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        let invalidatedCount = 0;
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                const deleted = await this.delete(key);
                if (deleted) {
                    invalidatedCount++;
                }
            }
        }
        
        return invalidatedCount;
    }

    /**
     * Precalienta el caché con datos comunes
     * @param {Array<Object>} items - Items para precalentar
     * @returns {Promise<number>} Número de items precalentados
     */
    async warmUp(items) {
        return await this.warming.warmUp(items);
    }

    /**
     * Obtiene estadísticas del caché
     * @returns {Object} Estadísticas detalladas
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? this.stats.hits / (this.stats.hits + this.stats.misses) 
            : 0;
        
        return {
            ...this.stats,
            hitRate,
            missRate: 1 - hitRate,
            itemCount: this.cache.size,
            memoryUsage: this.stats.size,
            maxMemoryUsage: this.options.maxSize,
            memoryUtilization: this.stats.size / this.options.maxSize,
            averageItemSize: this.cache.size > 0 ? this.stats.size / this.cache.size : 0,
            oldestItem: this.getOldestItem(),
            newestItem: this.getNewestItem(),
            topAccessedItems: this.getTopAccessedItems(10)
        };
    }

    /**
     * Optimiza el caché
     * @returns {Promise<Object>} Resultados de la optimización
     */
    async optimize() {
        console.log('🔧 Optimizando caché...');
        
        const results = {
            itemsRemoved: 0,
            memoryFreed: 0,
            compressionImproved: 0,
            strategiesOptimized: []
        };
        
        // Limpiar items expirados
        const expiredCleanup = await this.cleanupExpired();
        results.itemsRemoved += expiredCleanup.itemsRemoved;
        results.memoryFreed += expiredCleanup.memoryFreed;
        
        // Aplicar estrategia de evolución
        const evictionResults = await this.applyEvictionStrategy();
        results.itemsRemoved += evictionResults.itemsRemoved;
        results.memoryFreed += evictionResults.memoryFreed;
        results.strategiesOptimized.push(evictionResults.strategy);
        
        // Optimizar compresión
        if (this.options.compressionEnabled) {
            const compressionResults = await this.optimizeCompression();
            results.compressionImproved += compressionResults.improved;
        }
        
        // Compactar caché
        await this.compactCache();
        
        console.log('✅ Optimización de caché completada:', results);
        return results;
    }

    /**
     * Verifica si un item ha expirado
     * @param {Object} metadata - Metadata del item
     * @returns {boolean} True si ha expirado
     */
    isExpired(metadata) {
        return Date.now() > metadata.expiresAt;
    }

    /**
     * Actualiza estadísticas de acceso
     * @param {string} key - Clave del item
     * @param {Object} metadata - Metadata del item
     */
    updateAccessStats(key, metadata) {
        metadata.lastAccessed = Date.now();
        metadata.accessCount++;
        
        // Actualizar estrategia
        const strategy = this.strategies[this.options.strategy];
        if (strategy && strategy.updateAccess) {
            strategy.updateAccess(key);
        }
    }

    /**
     * Estima el tamaño de un valor
     * @param {*} value - Valor a medir
     * @returns {number} Tamaño estimado en bytes
     */
    estimateSize(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        
        if (typeof value === 'string') {
            return value.length * 2; // Unicode
        }
        
        if (typeof value === 'number') {
            return 8; // Double
        }
        
        if (typeof value === 'boolean') {
            return 4;
        }
        
        if (value instanceof ArrayBuffer) {
            return value.byteLength;
        }
        
        if (value instanceof Blob) {
            return value.size;
        }
        
        // Para objetos, estimar basado en JSON
        try {
            return JSON.stringify(value).length * 2;
        } catch {
            return 1024; // Estimación por defecto
        }
    }

    /**
     * Verifica si un valor debe ser comprimido
     * @param {*} value - Valor a evaluar
     * @returns {boolean} True si debe comprimirse
     */
    shouldCompress(value) {
        const size = this.estimateSize(value);
        return size > 1024; // Comprimir si es mayor a 1KB
    }

    /**
     * Asegura espacio suficiente en caché
     * @param {number} requiredSize - Espacio requerido
     */
    async ensureSpace(requiredSize) {
        const availableSpace = this.options.maxSize - this.stats.size;
        
        if (availableSpace >= requiredSize) {
            return;
        }
        
        console.log(`Espacio insuficiente en caché. Liberando ${requiredSize - availableSpace} bytes...`);
        
        const strategy = this.strategies[this.options.strategy];
        if (strategy) {
            await strategy.evict(requiredSize - availableSpace);
        } else {
            // Estrategia por defecto: eliminar items más antiguos
            await this.evictLRU(requiredSize - availableSpace);
        }
    }

    /**
     * Evict items usando LRU
     * @param {number} bytesToFree - Bytes a liberar
     */
    async evictLRU(bytesToFree) {
        const items = Array.from(this.metadata.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        let freed = 0;
        
        for (const [key, metadata] of items) {
            if (freed >= bytesToFree) {
                break;
            }
            
            await this.delete(key);
            freed += metadata.size;
            this.stats.evictions++;
        }
    }

    /**
     * Limpia items expirados
     * @returns {Promise<Object>} Resultados de la limpieza
     */
    async cleanupExpired() {
        const now = Date.now();
        let itemsRemoved = 0;
        let memoryFreed = 0;
        
        for (const [key, metadata] of this.metadata) {
            if (now > metadata.expiresAt) {
                memoryFreed += metadata.size;
                await this.delete(key);
                itemsRemoved++;
            }
        }
        
        this.stats.lastCleanup = now;
        
        return { itemsRemoved, memoryFreed };
    }

    /**
     * Aplica estrategia de evolución
     * @returns {Promise<Object>} Resultados de la evolución
     */
    async applyEvictionStrategy() {
        const strategy = this.strategies[this.options.strategy];
        
        if (!strategy) {
            return { itemsRemoved: 0, memoryFreed: 0, strategy: 'none' };
        }
        
        // Evict items si el caché está cerca del límite
        const threshold = this.options.maxSize * 0.9;
        
        if (this.stats.size > threshold) {
            const bytesToFree = this.stats.size - threshold;
            return await strategy.evict(bytesToFree);
        }
        
        return { itemsRemoved: 0, memoryFreed: 0, strategy: this.options.strategy };
    }

    /**
     * Optimiza compresión de items
     * @returns {Promise<Object>} Resultados de la optimización
     */
    async optimizeCompression() {
        let improved = 0;
        
        for (const [key, metadata] of this.metadata) {
            if (!metadata.compressed && this.shouldCompress(this.cache.get(key))) {
                const value = this.cache.get(key);
                const compressed = await this.compression.compress(value);
                
                if (this.estimateSize(compressed) < metadata.size) {
                    this.cache.set(key, compressed);
                    metadata.compressed = true;
                    metadata.size = this.estimateSize(compressed);
                    improved++;
                }
            }
        }
        
        return { improved };
    }

    /**
     * Compacta el caché
     */
    async compactCache() {
        // Forzar garbage collection si está disponible
        if (window.gc) {
            window.gc();
        }
        
        // Reorganizar estructuras internas si es necesario
        console.log('🗜️ Caché compactado');
    }

    /**
     * Inicia limpieza automática
     */
    startAutoCleanup() {
        setInterval(async () => {
            await this.cleanupExpired();
        }, 60000); // Cada minuto
    }

    /**
     * Carga datos persistentes
     */
    async loadPersistedData() {
        try {
            const persistedData = await this.persistence.loadAll();
            
            for (const { key, value, metadata } of persistedData) {
                if (!this.isExpired(metadata)) {
                    this.cache.set(key, value);
                    this.metadata.set(key, metadata);
                    this.stats.size += metadata.size;
                }
            }
            
            console.log(`📂 Cargados ${persistedData.length} items desde persistencia`);
        } catch (error) {
            console.error('Error cargando datos persistentes:', error);
        }
    }

    /**
     * Verifica si las etiquetas coinciden
     * @param {Array<string>} itemTags - Etiquetas del item
     * @param {Array<string>} searchTags - Etiquetas a buscar
     * @returns {boolean} True si coinciden
     */
    hasMatchingTags(itemTags, searchTags) {
        return searchTags.some(tag => itemTags.includes(tag));
    }

    /**
     * Obtiene el item más antiguo
     * @returns {Object|null} Metadata del item más antiguo
     */
    getOldestItem() {
        let oldest = null;
        
        for (const metadata of this.metadata.values()) {
            if (!oldest || metadata.createdAt < oldest.createdAt) {
                oldest = metadata;
            }
        }
        
        return oldest;
    }

    /**
     * Obtiene el item más nuevo
     * @returns {Object|null} Metadata del item más nuevo
     */
    getNewestItem() {
        let newest = null;
        
        for (const metadata of this.metadata.values()) {
            if (!newest || metadata.createdAt > newest.createdAt) {
                newest = metadata;
            }
        }
        
        return newest;
    }

    /**
     * Obtiene los items más accedidos
     * @param {number} limit - Límite de items
     * @returns {Array} Array de metadata
     */
    getTopAccessedItems(limit = 10) {
        return Array.from(this.metadata.values())
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, limit);
    }

    /**
     * Registra métricas de obtención
     * @param {string} key - Clave
     * @param {number} duration - Duración
     * @param {boolean} success - Si fue exitoso
     */
    recordGetMetrics(key, duration, success) {
        // Implementar registro de métricas para análisis
        console.log(`GET ${key}: ${duration.toFixed(2)}ms (${success ? 'success' : 'error'})`);
    }

    /**
     * Registra métricas de almacenamiento
     * @param {string} key - Clave
     * @param {number} duration - Duración
     * @param {boolean} success - Si fue exitoso
     */
    recordSetMetrics(key, duration, success) {
        // Implementar registro de métricas para análisis
        console.log(`SET ${key}: ${duration.toFixed(2)}ms (${success ? 'success' : 'error'})`);
    }

    /**
     * Exporta configuración del caché
     * @returns {Object} Configuración actual
     */
    exportConfig() {
        return {
            options: this.options,
            stats: this.getStats(),
            itemCount: this.cache.size,
            metadata: Array.from(this.metadata.entries())
        };
    }

    /**
     * Importa configuración del caché
     * @param {Object} config - Configuración a importar
     */
    async importConfig(config) {
        if (config.options) {
            this.options = { ...this.options, ...config.options };
        }
        
        if (config.metadata) {
            for (const [key, metadata] of config.metadata) {
                this.metadata.set(key, metadata);
            }
        }
        
        console.log('📥 Configuración de caché importada');
    }

    /**
     * Destruye el gestor de caché
     */
    async destroy() {
        console.log('💥 Destruyendo Cache Manager...');
        
        // Detener warming
        this.warming.stop();
        
        // Detener invalidador
        this.invalidator.stop();
        
        // Limpiar caché
        await this.clear();
        
        // Limpiar persistencia
        if (this.options.persistenceEnabled) {
            await this.persistence.destroy();
        }
        
        console.log('✅ Cache Manager destruido');
    }
}

// Estrategias de evolución
class LRUStrategy {
    constructor(cache, metadata) {
        this.cache = cache;
        this.metadata = metadata;
        this.accessOrder = new Map();
    }

    updateAccess(key) {
        this.accessOrder.set(key, Date.now());
    }

    async evict(bytesToFree) {
        const items = Array.from(this.accessOrder.entries())
            .sort((a, b) => a[1] - b[1]);
        
        let freed = 0;
        let itemsRemoved = 0;
        
        for (const [key] of items) {
            if (freed >= bytesToFree) {
                break;
            }
            
            const metadata = this.metadata.get(key);
            freed += metadata.size;
            this.cache.delete(key);
            this.metadata.delete(key);
            this.accessOrder.delete(key);
            itemsRemoved++;
        }
        
        return { itemsRemoved, memoryFreed: freed, strategy: 'lru' };
    }
}

class LFUStrategy {
    constructor(cache, metadata) {
        this.cache = cache;
        this.metadata = metadata;
        this.accessCount = new Map();
    }

    updateAccess(key) {
        const current = this.accessCount.get(key) || 0;
        this.accessCount.set(key, current + 1);
    }

    async evict(bytesToFree) {
        const items = Array.from(this.accessCount.entries())
            .sort((a, b) => a[1] - b[1]);
        
        let freed = 0;
        let itemsRemoved = 0;
        
        for (const [key] of items) {
            if (freed >= bytesToFree) {
                break;
            }
            
            const metadata = this.metadata.get(key);
            freed += metadata.size;
            this.cache.delete(key);
            this.metadata.delete(key);
            this.accessCount.delete(key);
            itemsRemoved++;
        }
        
        return { itemsRemoved, memoryFreed: freed, strategy: 'lfu' };
    }
}

class FIFOStrategy {
    constructor(cache, metadata) {
        this.cache = cache;
        this.metadata = metadata;
    }

    updateAccess(key) {
        // FIFO no actualiza por acceso
    }

    async evict(bytesToFree) {
        const items = Array.from(this.metadata.entries())
            .sort((a, b) => a[1].createdAt - b[1].createdAt);
        
        let freed = 0;
        let itemsRemoved = 0;
        
        for (const [key, metadata] of items) {
            if (freed >= bytesToFree) {
                break;
            }
            
            freed += metadata.size;
            this.cache.delete(key);
            this.metadata.delete(key);
            itemsRemoved++;
        }
        
        return { itemsRemoved, memoryFreed: freed, strategy: 'fifo' };
    }
}

// Gestor de compresión
class CompressionManager {
    async compress(data) {
        // Implementar compresión (usar CompressionStream API si está disponible)
        if (typeof CompressionStream !== 'undefined') {
            const stream = new CompressionStream('gzip');
            // Implementar compresión con streams
        }
        
        // Fallback simple
        return JSON.stringify(data);
    }

    async decompress(data) {
        // Implementar descompresión
        if (typeof DecompressionStream !== 'undefined') {
            const stream = new DecompressionStream('gzip');
            // Implementar descompresión con streams
        }
        
        // Fallback simple
        return JSON.parse(data);
    }
}

// Gestor de encriptación
class EncryptionManager {
    async encrypt(data) {
        // Implementar encriptación (usar Web Crypto API)
        return data; // Placeholder
    }

    async decrypt(data) {
        // Implementar desencriptación
        return data; // Placeholder
    }
}

// Gestor de persistencia
class PersistenceManager {
    constructor() {
        this.storageKey = 'cache_persistence';
    }

    async save(key, value, metadata) {
        try {
            const persisted = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            persisted[key] = { value, metadata };
            localStorage.setItem(this.storageKey, JSON.stringify(persisted));
        } catch (error) {
            console.error('Error guardando en persistencia:', error);
        }
    }

    async delete(key) {
        try {
            const persisted = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            delete persisted[key];
            localStorage.setItem(this.storageKey, JSON.stringify(persisted));
        } catch (error) {
            console.error('Error eliminando de persistencia:', error);
        }
    }

    async loadAll() {
        try {
            const persisted = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            return Object.entries(persisted).map(([key, { value, metadata }]) => ({
                key,
                value,
                metadata
            }));
        } catch (error) {
            console.error('Error cargando desde persistencia:', error);
            return [];
        }
    }

    async clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error limpiando persistencia:', error);
        }
    }

    async destroy() {
        await this.clear();
    }
}

// Gestor de warming de caché
class CacheWarmingManager {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.isRunning = false;
        this.warmingQueue = [];
        this.interval = null;
    }

    start() {
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.processWarmingQueue();
        }, 5000);
        console.log('🔥 Cache warming iniciado');
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
        console.log('🔥 Cache warming detenido');
    }

    async warmUp(items) {
        this.warmingQueue.push(...items);
        return items.length;
    }

    async processWarmingQueue() {
        if (this.warmingQueue.length === 0) {
            return;
        }

        const item = this.warmingQueue.shift();
        
        try {
            await this.cacheManager.set(item.key, item.value, item.options);
            console.log(`🔥 Item precalentado: ${item.key}`);
        } catch (error) {
            console.error(`Error precalentando item ${item.key}:`, error);
        }
    }
}

// Invalidador de caché
class CacheInvalidator {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.isRunning = false;
        this.rules = [];
        this.interval = null;
    }

    start() {
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.applyInvalidationRules();
        }, 30000);
        console.log('🗑️ Cache invalidator iniciado');
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
        console.log('🗑️ Cache invalidator detenido');
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    async applyInvalidationRules() {
        for (const rule of this.rules) {
            try {
                await rule.apply(this.cacheManager);
            } catch (error) {
                console.error('Error aplicando regla de invalidación:', error);
            }
        }
    }
}

// Exportar para uso global
window.CacheManager = CacheManager;