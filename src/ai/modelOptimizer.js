/**
 * Optimizador Inteligente de Modelos de IA para Document Analyzer
 * Utiliza la configuración centralizada para seleccionar el mejor modelo
 */

const { 
    getOptimalModelConfig, 
    getOCRConfidenceLevel,
    getModelConfig,
    getStrategyConfig 
} = require('../../config/ai-models-config');

class ModelOptimizer {
    constructor() {
        this.cache = new Map();
        this.performanceMetrics = new Map();
        this.initializeMetrics();
    }

    /**
     * Inicializa métricas de rendimiento para cada modelo
     */
    initializeMetrics() {
        const models = [
            'llama-3.3-70b-versatile',
            'mixtral-8x7b-32768',
            'llama-3.1-8b-instant',
            'specialized-ocr',
            'document-analyzer'
        ];

        models.forEach(modelId => {
            this.performanceMetrics.set(modelId, {
                totalUses: 0,
                successfulUses: 0,
                averageResponseTime: 0,
                averageAccuracy: 0,
                lastUsed: null,
                reliability: 1.0
            });
        });
    }

    /**
     * Obtiene la mejor configuración de modelo para un documento específico
     */
    async getOptimalConfiguration(options = {}) {
        const {
            documentType = 'general',
            ocrConfidence = 75,
            strategy = 'auto',
            priority = 'balanced',
            documentLength = 1500,
            useCache = true
        } = options;

        // Generar clave de caché
        const cacheKey = this.generateCacheKey(options);
        
        // Verificar caché
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutos
                return cached.config;
            }
        }

        // Obtener configuración óptima
        const config = getOptimalModelConfig(options);

        // Enriquecer configuración con métricas de rendimiento
        const enrichedConfig = await this.enrichWithMetrics(config);

        // Aplicar ajustes basados en rendimiento histórico
        const finalConfig = this.applyPerformanceAdjustments(enrichedConfig, options);

        // Guardar en caché
        this.cache.set(cacheKey, {
            config: finalConfig,
            timestamp: Date.now()
        });

        return finalConfig;
    }

    /**
     * Enriquece la configuración con métricas de rendimiento reales
     */
    async enrichWithMetrics(config) {
        const modelId = config.model.id;
        const metrics = this.performanceMetrics.get(modelId);

        if (!metrics) {
            return config;
        }

        // Calcular puntuación de rendimiento ajustada
        const performanceScore = this.calculatePerformanceScore(metrics);
        
        // Ajustar confianza basada en rendimiento histórico
        const adjustedConfidence = Math.min(
            config.ocr_confidence.min + (performanceScore * 10),
            95
        );

        return {
            ...config,
            performance_metrics: {
                ...metrics,
                performance_score: performanceScore,
                adjusted_confidence: adjustedConfidence
            },
            recommendation_strength: this.calculateRecommendationStrength(config, metrics)
        };
    }

    /**
     * Aplica ajustes basados en rendimiento histórico
     */
    applyPerformanceAdjustments(config, options) {
        const modelId = config.model.id;
        const metrics = this.performanceMetrics.get(modelId);

        if (!metrics || metrics.totalUses < 5) {
            return config;
        }

        // Si el modelo tiene baja confiabilidad, considerar alternativa
        if (metrics.reliability < 0.7) {
            const alternativeConfig = this.getAlternativeModel(config, options);
            if (alternativeConfig) {
                return {
                    ...config,
                    original_model: config.model,
                    model: alternativeConfig.model,
                    fallback_reason: `Modelo original con baja confiabilidad (${(metrics.reliability * 100).toFixed(1)}%)`,
                    parameters: alternativeConfig.parameters
                };
            }
        }

        // Ajustar parámetros basados en rendimiento
        const adjustedParameters = { ...config.parameters };

        // Si el modelo es lento, reducir tokens
        if (metrics.averageResponseTime > 5000) { // > 5 segundos
            adjustedParameters.max_tokens = Math.floor(adjustedParameters.max_tokens * 0.8);
        }

        // Si la precisión es baja, reducir temperatura
        if (metrics.averageAccuracy < 0.8) {
            adjustedParameters.temperature = Math.max(adjustedParameters.temperature * 0.7, 0.1);
        }

        return {
            ...config,
            parameters: adjustedParameters,
            performance_adjustments: {
                response_time_adjusted: metrics.averageResponseTime > 5000,
                accuracy_adjusted: metrics.averageAccuracy < 0.8,
                reliability_adjusted: metrics.reliability < 0.7
            }
        };
    }

    /**
     * Obtiene un modelo alternativo si el principal no es óptimo
     */
    getAlternativeModel(config, options) {
        const { documentType, ocrConfidence, priority } = options;
        const currentModelId = config.model.id;

        // Estrategias de fallback
        if (currentModelId === 'mixtral-8x7b-32768') {
            // Fallback de Mixtral a Llama 3.3
            return getOptimalModelConfig({
                ...options,
                strategy: 'auto'
            });
        }

        if (currentModelId === 'llama-3.3-70b-versatile' && ocrConfidence < 60) {
            // Si Llama 3.3 no es suficiente para OCR bajo, intentar Mixtral
            return getOptimalModelConfig({
                ...options,
                strategy: 'accuracy'
            });
        }

        if (currentModelId === 'llama-3.1-8b-instant' && ocrConfidence < 80) {
            // Si el modelo rápido no es suficiente, usar balanceado
            return getOptimalModelConfig({
                ...options,
                strategy: 'auto'
            });
        }

        return null;
    }

    /**
     * Calcula puntuación de rendimiento combinada
     */
    calculatePerformanceScore(metrics) {
        const weights = {
            reliability: 0.4,
            accuracy: 0.3,
            speed: 0.2,
            consistency: 0.1
        };

        const speedScore = Math.max(0, 1 - (metrics.averageResponseTime / 10000)); // Normalizar a 0-1
        const accuracyScore = metrics.averageAccuracy;
        const reliabilityScore = metrics.reliability;
        const consistencyScore = metrics.totalUses > 0 ? metrics.successfulUses / metrics.totalUses : 1;

        return (
            weights.reliability * reliabilityScore +
            weights.accuracy * accuracyScore +
            weights.speed * speedScore +
            weights.consistency * consistencyScore
        );
    }

    /**
     * Calcula la fuerza de la recomendación
     */
    calculateRecommendationStrength(config, metrics) {
        let strength = 'medium';
        let confidence = 0.7;

        // Basado en la confianza OCR
        if (config.ocr_confidence.min >= 85) {
            confidence += 0.2;
        } else if (config.ocr_confidence.min < 60) {
            confidence -= 0.2;
        }

        // Basado en métricas del modelo
        if (metrics.totalUses >= 10) {
            confidence += 0.1;
            if (metrics.reliability > 0.9) {
                confidence += 0.1;
            }
        }

        // Determinar nivel de fuerza
        if (confidence >= 0.9) {
            strength = 'very_high';
        } else if (confidence >= 0.75) {
            strength = 'high';
        } else if (confidence >= 0.5) {
            strength = 'medium';
        } else {
            strength = 'low';
        }

        return {
            level: strength,
            confidence: Math.min(confidence, 1.0),
            factors: {
                ocr_quality: config.ocr_confidence.min >= 85 ? 'high' : config.ocr_confidence.min < 60 ? 'low' : 'medium',
                model_reliability: metrics.reliability > 0.9 ? 'high' : metrics.reliability < 0.7 ? 'low' : 'medium',
                usage_confidence: metrics.totalUses >= 10 ? 'high' : 'medium'
            }
        };
    }

    /**
     * Genera clave de caché única
     */
    generateCacheKey(options) {
        const keyParts = [
            options.documentType || 'general',
            Math.floor(options.ocrConfidence / 10) * 10, // Redondear a decenas
            options.strategy || 'auto',
            options.priority || 'balanced',
            Math.floor(options.documentLength / 500) * 500 // Redondear a 500
        ];
        return keyParts.join('_');
    }

    /**
     * Registra el uso de un modelo para actualizar métricas
     */
    recordModelUsage(modelId, success, responseTime, accuracy = null) {
        const metrics = this.performanceMetrics.get(modelId);
        if (!metrics) return;

        metrics.totalUses++;
        if (success) {
            metrics.successfulUses++;
        }

        // Actualizar tiempo de respuesta promedio
        if (responseTime) {
            const totalResponseTime = metrics.averageResponseTime * (metrics.totalUses - 1) + responseTime;
            metrics.averageResponseTime = totalResponseTime / metrics.totalUses;
        }

        // Actualizar precisión promedio
        if (accuracy !== null) {
            const totalAccuracy = metrics.averageAccuracy * (metrics.successfulUses - 1) + accuracy;
            metrics.averageAccuracy = totalAccuracy / metrics.successfulUses;
        }

        // Actualizar confiabilidad
        metrics.reliability = metrics.successfulUses / metrics.totalUses;
        metrics.lastUsed = Date.now();

        // Limpiar caché si hay cambios significativos
        if (metrics.totalUses % 10 === 0) {
            this.clearCache();
        }
    }

    /**
     * Obtiene recomendaciones para múltiples documentos
     */
    async getBatchRecommendations(documents) {
        const recommendations = [];
        
        for (const doc of documents) {
            const config = await this.getOptimalConfiguration(doc);
            recommendations.push({
                document_id: doc.id || doc.filename,
                ...config
            });
        }

        // Optimizar para procesamiento por lotes
        return this.optimizeBatchRecommendations(recommendations);
    }

    /**
     * Optimiza recomendaciones para procesamiento por lotes
     */
    optimizeBatchRecommendations(recommendations) {
        // Agrupar por modelo para procesamiento eficiente
        const modelGroups = {};
        
        recommendations.forEach(rec => {
            const modelId = rec.model.id;
            if (!modelGroups[modelId]) {
                modelGroups[modelId] = [];
            }
            modelGroups[modelId].push(rec);
        });

        // Generar estrategia de procesamiento
        const processingStrategy = {
            groups: modelGroups,
            total_documents: recommendations.length,
            recommended_order: this.getOptimalProcessingOrder(modelGroups),
            estimated_time: this.estimateBatchProcessingTime(modelGroups)
        };

        return {
            recommendations,
            processing_strategy
        };
    }

    /**
     * Determina el orden óptimo de procesamiento
     */
    getOptimalProcessingOrder(modelGroups) {
        // Ordenar por velocidad del modelo (más rápido primero)
        const modelSpeedOrder = {
            'llama-3.1-8b-instant': 1,
            'llama-3.3-70b-versatile': 2,
            'mixtral-8x7b-32768': 3,
            'specialized-ocr': 4,
            'document-analyzer': 5
        };

        return Object.keys(modelGroups)
            .sort((a, b) => (modelSpeedOrder[a] || 999) - (modelSpeedOrder[b] || 999))
            .map(modelId => ({
                model: modelId,
                count: modelGroups[modelId].length,
                documents: modelGroups[modelId].map(rec => rec.document_id)
            }));
    }

    /**
     * Estima tiempo de procesamiento por lotes
     */
    estimateBatchProcessingTime(modelGroups) {
        const modelTimes = {
            'llama-3.1-8b-instant': 2000, // 2 segundos
            'llama-3.3-70b-versatile': 4000, // 4 segundos
            'mixtral-8x7b-32768': 6000, // 6 segundos
            'specialized-ocr': 3000, // 3 segundos
            'document-analyzer': 5000 // 5 segundos
        };

        let totalTime = 0;
        for (const [modelId, documents] of Object.entries(modelGroups)) {
            const avgTime = modelTimes[modelId] || 4000;
            totalTime += avgTime * documents.length;
        }

        return {
            estimated_milliseconds: totalTime,
            estimated_seconds: Math.ceil(totalTime / 1000),
            estimated_minutes: Math.ceil(totalTime / 60000)
        };
    }

    /**
     * Limpia la caché
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Obtiene estadísticas de rendimiento
     */
    getPerformanceStats() {
        const stats = {};
        
        for (const [modelId, metrics] of this.performanceMetrics.entries()) {
            stats[modelId] = {
                ...metrics,
                performance_score: this.calculatePerformanceScore(metrics)
            };
        }

        return {
            models: stats,
            cache_size: this.cache.size,
            total_models: this.performanceMetrics.size
        };
    }

    /**
     * Reinicia métricas
     */
    resetMetrics() {
        this.initializeMetrics();
        this.clearCache();
    }
}

// Singleton para uso en toda la aplicación
const modelOptimizer = new ModelOptimizer();

module.exports = {
    ModelOptimizer,
    modelOptimizer
};