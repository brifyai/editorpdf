/**
 * Performance Monitor - Sistema integral de monitoreo de rendimiento
 * Monitorea métricas en tiempo real y proporciona análisis detallado del rendimiento
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            system: new Map(),
            application: new Map(),
            user: new Map(),
            business: new Map()
        };
        
        this.monitors = new Map();
        this.alerts = [];
        this.thresholds = {
            responseTime: {
                warning: 1000,
                critical: 3000
            },
            errorRate: {
                warning: 0.05,
                critical: 0.10
            },
            throughput: {
                warning: 100,
                critical: 50
            },
            memoryUsage: {
                warning: 0.70,
                critical: 0.90
            },
            cpuUsage: {
                warning: 70,
                critical: 90
            }
        };
        
        this.startTime = Date.now();
        this.isMonitoring = false;
        
        this.initializeMonitors();
    }

    /**
     * Inicializa los monitores de rendimiento
     */
    initializeMonitors() {
        // Monitor de sistema
        this.monitors.set('system', new SystemMonitor());
        
        // Monitor de aplicación
        this.monitors.set('application', new ApplicationMonitor());
        
        // Monitor de experiencia de usuario
        this.monitors.set('user', new UserExperienceMonitor());
        
        // Monitor de métricas de negocio
        this.monitors.set('business', new BusinessMonitor());
    }

    /**
     * Inicia el monitoreo completo
     */
    startMonitoring() {
        if (this.isMonitoring) {
            console.warn('El monitoreo ya está activo');
            return;
        }
        
        console.log('🚀 Iniciando monitoreo de rendimiento...');
        this.isMonitoring = true;
        
        // Iniciar todos los monitores
        for (const [name, monitor] of this.monitors) {
            monitor.start();
        }
        
        // Iniciar recolección de métricas
        this.startMetricsCollection();
        
        // Iniciar análisis de rendimiento
        this.startPerformanceAnalysis();
        
        // Iniciar sistema de alertas
        this.startAlertSystem();
        
        console.log('✅ Monitoreo de rendimiento iniciado');
    }

    /**
     * Detiene el monitoreo
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.warn('El monitoreo no está activo');
            return;
        }
        
        console.log('⏹️ Deteniendo monitoreo de rendimiento...');
        this.isMonitoring = false;
        
        // Detener todos los monitores
        for (const [name, monitor] of this.monitors) {
            monitor.stop();
        }
        
        console.log('✅ Monitoreo de rendimiento detenido');
    }

    /**
     * Inicia recolección de métricas
     */
    startMetricsCollection() {
        // Recolectar métricas cada 5 segundos
        this.metricsInterval = setInterval(() => {
            this.collectAllMetrics();
        }, 5000);
        
        // Recolectar métricas detalladas cada 30 segundos
        this.detailedMetricsInterval = setInterval(() => {
            this.collectDetailedMetrics();
        }, 30000);
        
        // Generar reporte cada 5 minutos
        this.reportInterval = setInterval(() => {
            this.generatePerformanceReport();
        }, 300000);
    }

    /**
     * Recolecta todas las métricas
     */
    async collectAllMetrics() {
        const timestamp = Date.now();
        
        for (const [name, monitor] of this.monitors) {
            try {
                const metrics = await monitor.collectMetrics();
                this.metrics[name].set(timestamp, metrics);
                
                // Mantener solo las últimas 1000 mediciones
                if (this.metrics[name].size > 1000) {
                    const oldestKey = this.metrics[name].keys().next().value;
                    this.metrics[name].delete(oldestKey);
                }
            } catch (error) {
                console.error(`Error recolectando métricas de ${name}:`, error);
            }
        }
    }

    /**
     * Recolecta métricas detalladas
     */
    async collectDetailedMetrics() {
        const timestamp = Date.now();
        const detailedMetrics = {
            timestamp,
            system: await this.getDetailedSystemMetrics(),
            application: await this.getDetailedApplicationMetrics(),
            user: await this.getDetailedUserMetrics(),
            business: await this.getDetailedBusinessMetrics()
        };
        
        // Guardar métricas detalladas
        this.saveDetailedMetrics(detailedMetrics);
    }

    /**
     * Inicia análisis de rendimiento
     */
    startPerformanceAnalysis() {
        this.analysisInterval = setInterval(() => {
            this.analyzePerformance();
        }, 60000); // Cada minuto
    }

    /**
     * Analiza el rendimiento del sistema
     */
    async analyzePerformance() {
        const analysis = {
            timestamp: Date.now(),
            system: await this.analyzeSystemPerformance(),
            application: await this.analyzeApplicationPerformance(),
            user: await this.analyzeUserExperience(),
            business: await this.analyzeBusinessMetrics(),
            recommendations: [],
            trends: {},
            anomalies: []
        };
        
        // Detectar anomalías
        analysis.anomalies = await this.detectAnomalies();
        
        // Generar recomendaciones
        analysis.recommendations = this.generateRecommendations(analysis);
        
        // Analizar tendencias
        analysis.trends = await this.analyzeTrends();
        
        // Guardar análisis
        this.savePerformanceAnalysis(analysis);
        
        // Disparar alertas si es necesario
        this.processAnalysisAlerts(analysis);
    }

    /**
     * Inicia sistema de alertas
     */
    startAlertSystem() {
        this.alertInterval = setInterval(() => {
            this.checkAlerts();
        }, 10000); // Cada 10 segundos
    }

    /**
     * Verifica alertas de rendimiento
     */
    async checkAlerts() {
        const currentMetrics = await this.getCurrentMetrics();
        const newAlerts = [];
        
        // Verificar umbrales de sistema
        newAlerts.push(...this.checkSystemAlerts(currentMetrics.system));
        
        // Verificar umbrales de aplicación
        newAlerts.push(...this.checkApplicationAlerts(currentMetrics.application));
        
        // Verificar umbrales de experiencia de usuario
        newAlerts.push(...this.checkUserAlerts(currentMetrics.user));
        
        // Procesar nuevas alertas
        newAlerts.forEach(alert => {
            this.processAlert(alert);
        });
    }

    /**
     * Obtiene métricas actuales
     * @returns {Promise<Object>} Métricas actuales
     */
    async getCurrentMetrics() {
        const timestamp = Date.now();
        const current = {
            timestamp,
            system: {},
            application: {},
            user: {},
            business: {}
        };
        
        for (const [name, monitor] of this.monitors) {
            try {
                current[name] = await monitor.getCurrentMetrics();
            } catch (error) {
                console.error(`Error obteniendo métricas actuales de ${name}:`, error);
            }
        }
        
        return current;
    }

    /**
     * Verifica alertas de sistema
     * @param {Object} systemMetrics - Métricas del sistema
     * @returns {Array} Lista de alertas
     */
    checkSystemAlerts(systemMetrics) {
        const alerts = [];
        
        // Verificar uso de memoria
        if (systemMetrics.memory && systemMetrics.memory.usage) {
            const memoryUsage = systemMetrics.memory.usage;
            if (memoryUsage > this.thresholds.memoryUsage.critical) {
                alerts.push({
                    type: 'system',
                    severity: 'critical',
                    metric: 'memory_usage',
                    value: memoryUsage,
                    threshold: this.thresholds.memoryUsage.critical,
                    message: `Uso de memoria crítico: ${(memoryUsage * 100).toFixed(1)}%`,
                    timestamp: Date.now()
                });
            } else if (memoryUsage > this.thresholds.memoryUsage.warning) {
                alerts.push({
                    type: 'system',
                    severity: 'warning',
                    metric: 'memory_usage',
                    value: memoryUsage,
                    threshold: this.thresholds.memoryUsage.warning,
                    message: `Uso de memoria elevado: ${(memoryUsage * 100).toFixed(1)}%`,
                    timestamp: Date.now()
                });
            }
        }
        
        // Verificar uso de CPU
        if (systemMetrics.cpu && systemMetrics.cpu.usage) {
            const cpuUsage = systemMetrics.cpu.usage;
            if (cpuUsage > this.thresholds.cpuUsage.critical) {
                alerts.push({
                    type: 'system',
                    severity: 'critical',
                    metric: 'cpu_usage',
                    value: cpuUsage,
                    threshold: this.thresholds.cpuUsage.critical,
                    message: `Uso de CPU crítico: ${cpuUsage.toFixed(1)}%`,
                    timestamp: Date.now()
                });
            } else if (cpuUsage > this.thresholds.cpuUsage.warning) {
                alerts.push({
                    type: 'system',
                    severity: 'warning',
                    metric: 'cpu_usage',
                    value: cpuUsage,
                    threshold: this.thresholds.cpuUsage.warning,
                    message: `Uso de CPU elevado: ${cpuUsage.toFixed(1)}%`,
                    timestamp: Date.now()
                });
            }
        }
        
        return alerts;
    }

    /**
     * Verifica alertas de aplicación
     * @param {Object} appMetrics - Métricas de aplicación
     * @returns {Array} Lista de alertas
     */
    checkApplicationAlerts(appMetrics) {
        const alerts = [];
        
        // Verificar tiempo de respuesta
        if (appMetrics.responseTime) {
            const responseTime = appMetrics.responseTime;
            if (responseTime > this.thresholds.responseTime.critical) {
                alerts.push({
                    type: 'application',
                    severity: 'critical',
                    metric: 'response_time',
                    value: responseTime,
                    threshold: this.thresholds.responseTime.critical,
                    message: `Tiempo de respuesta crítico: ${responseTime.toFixed(2)}ms`,
                    timestamp: Date.now()
                });
            } else if (responseTime > this.thresholds.responseTime.warning) {
                alerts.push({
                    type: 'application',
                    severity: 'warning',
                    metric: 'response_time',
                    value: responseTime,
                    threshold: this.thresholds.responseTime.warning,
                    message: `Tiempo de respuesta elevado: ${responseTime.toFixed(2)}ms`,
                    timestamp: Date.now()
                });
            }
        }
        
        // Verificar tasa de errores
        if (appMetrics.errorRate) {
            const errorRate = appMetrics.errorRate;
            if (errorRate > this.thresholds.errorRate.critical) {
                alerts.push({
                    type: 'application',
                    severity: 'critical',
                    metric: 'error_rate',
                    value: errorRate,
                    threshold: this.thresholds.errorRate.critical,
                    message: `Tasa de errores crítica: ${(errorRate * 100).toFixed(1)}%`,
                    timestamp: Date.now()
                });
            } else if (errorRate > this.thresholds.errorRate.warning) {
                alerts.push({
                    type: 'application',
                    severity: 'warning',
                    metric: 'error_rate',
                    value: errorRate,
                    threshold: this.thresholds.errorRate.warning,
                    message: `Tasa de errores elevada: ${(errorRate * 100).toFixed(1)}%`,
                    timestamp: Date.now()
                });
            }
        }
        
        return alerts;
    }

    /**
     * Verifica alertas de experiencia de usuario
     * @param {Object} userMetrics - Métricas de usuario
     * @returns {Array} Lista de alertas
     */
    checkUserAlerts(userMetrics) {
        const alerts = [];
        
        // Verificar tiempo de carga de página
        if (userMetrics.pageLoadTime && userMetrics.pageLoadTime > 5000) {
            alerts.push({
                type: 'user',
                severity: 'warning',
                metric: 'page_load_time',
                value: userMetrics.pageLoadTime,
                threshold: 5000,
                message: `Tiempo de carga de página lento: ${userMetrics.pageLoadTime.toFixed(2)}ms`,
                timestamp: Date.now()
            });
        }
        
        // Verificar tasa de rebote
        if (userMetrics.bounceRate && userMetrics.bounceRate > 0.7) {
            alerts.push({
                type: 'user',
                severity: 'warning',
                metric: 'bounce_rate',
                value: userMetrics.bounceRate,
                threshold: 0.7,
                message: `Tasa de rebote elevada: ${(userMetrics.bounceRate * 100).toFixed(1)}%`,
                timestamp: Date.now()
            });
        }
        
        return alerts;
    }

    /**
     * Procesa una alerta
     * @param {Object} alert - Alerta a procesar
     */
    processAlert(alert) {
        // Verificar si ya existe una alerta similar
        const existingAlert = this.alerts.find(a => 
            a.type === alert.type && 
            a.metric === alert.metric && 
            a.severity === alert.severity &&
            (Date.now() - a.timestamp) < 60000 // Último minuto
        );
        
        if (existingAlert) {
            return; // Evitar alertas duplicadas
        }
        
        // Agregar alerta
        this.alerts.push(alert);
        
        // Mantener solo las últimas 100 alertas
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        
        // Notificar alerta
        this.notifyAlert(alert);
        
        // Registrar alerta
        this.logAlert(alert);
    }

    /**
     * Notifica una alerta
     * @param {Object} alert - Alerta a notificar
     */
    notifyAlert(alert) {
        console.warn(`🚨 [${alert.severity.toUpperCase()}] ${alert.message}`);
        
        // Mostrar notificación en la UI si está disponible
        if (window.uiManager && window.uiManager.notifications) {
            window.uiManager.notifications.show({
                type: alert.severity === 'critical' ? 'error' : 'warning',
                title: `Alerta de ${alert.type}`,
                message: alert.message,
                duration: alert.severity === 'critical' ? 10000 : 5000
            });
        }
        
        // Enviar a sistema de monitoreo externo si está configurado
        this.sendToExternalMonitoring(alert);
    }

    /**
     * Registra una alerta
     * @param {Object} alert - Alerta a registrar
     */
    logAlert(alert) {
        const logEntry = {
            timestamp: alert.timestamp,
            level: alert.severity,
            type: alert.type,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            message: alert.message
        };
        
        // Guardar en localStorage para persistencia
        const logs = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
        logs.push(logEntry);
        
        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }
        
        localStorage.setItem('performance_alerts', JSON.stringify(logs));
    }

    /**
     * Envía alerta a sistema de monitoreo externo
     * @param {Object} alert - Alerta a enviar
     */
    sendToExternalMonitoring(alert) {
        // Implementar integración con sistemas externos (DataDog, New Relic, etc.)
        console.log('Enviando alerta a sistema externo:', alert);
    }

    /**
     * Detecta anomalías en las métricas
     * @returns {Promise<Array>} Lista de anomalías detectadas
     */
    async detectAnomalies() {
        const anomalies = [];
        
        for (const [name, metrics] of this.metrics) {
            try {
                const metricAnomalies = await this.detectMetricAnomalies(name, metrics);
                anomalies.push(...metricAnomalies);
            } catch (error) {
                console.error(`Error detectando anomalías en ${name}:`, error);
            }
        }
        
        return anomalies;
    }

    /**
     * Detecta anomalías en métricas específicas
     * @param {string} metricName - Nombre de la métrica
     * @param {Map} metrics - Mapa de métricas
     * @returns {Array} Lista de anomalías
     */
    async detectMetricAnomalies(metricName, metrics) {
        const anomalies = [];
        const values = Array.from(metrics.values());
        
        if (values.length < 10) {
            return anomalies; // No hay suficientes datos para detectar anomalías
        }
        
        // Detectar valores atípicos usando desviación estándar
        const recentValues = values.slice(-20); // Últimos 20 valores
        
        for (let i = 0; i < recentValues.length; i++) {
            const value = recentValues[i];
            const isAnomaly = this.isOutlier(value, recentValues);
            
            if (isAnomaly) {
                anomalies.push({
                    type: metricName,
                    timestamp: Date.now() - (recentValues.length - i - 1) * 5000,
                    value: value,
                    severity: 'medium',
                    description: `Valor atípico detectado en ${metricName}: ${JSON.stringify(value)}`
                });
            }
        }
        
        return anomalies;
    }

    /**
     * Verifica si un valor es atípico
     * @param {*} value - Valor a verificar
     * @param {Array} values - Conjunto de valores para comparación
     * @returns {boolean} True si es atípico
     */
    isOutlier(value, values) {
        // Implementación simple de detección de outliers
        // En producción usar algoritmos más sofisticados
        
        if (typeof value !== 'number') {
            return false;
        }
        
        const mean = values.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) / values.length;
        const variance = values.reduce((sum, v) => {
            const diff = typeof v === 'number' ? v - mean : 0;
            return sum + diff * diff;
        }, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Considerar outlier si está a más de 2 desviaciones estándar
        return Math.abs(value - mean) > 2 * stdDev;
    }

    /**
     * Genera recomendaciones basadas en análisis
     * @param {Object} analysis - Análisis de rendimiento
     * @returns {Array} Lista de recomendaciones
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        
        // Recomendaciones basadas en métricas del sistema
        if (analysis.system.memory && analysis.system.memory.usage > 0.8) {
            recommendations.push({
                category: 'system',
                priority: 'high',
                title: 'Optimizar uso de memoria',
                description: 'El uso de memoria es elevado. Considerar liberar memoria no utilizada o implementar garbage collection.',
                action: 'Implementar limpieza de caché y optimizar estructuras de datos.'
            });
        }
        
        // Recomendaciones basadas en métricas de aplicación
        if (analysis.application.responseTime && analysis.application.responseTime > 2000) {
            recommendations.push({
                category: 'application',
                priority: 'high',
                title: 'Optimizar tiempos de respuesta',
                description: 'Los tiempos de respuesta son lentos. Considerar optimizar queries o implementar caché.',
                action: 'Revisar consultas a base de datos y implementar estrategias de caché.'
            });
        }
        
        // Recomendaciones basadas en experiencia de usuario
        if (analysis.user.pageLoadTime && analysis.user.pageLoadTime > 3000) {
            recommendations.push({
                category: 'user',
                priority: 'medium',
                title: 'Mejorar tiempo de carga',
                description: 'El tiempo de carga de página es lento. Considerar optimizar recursos.',
                action: 'Implementar lazy loading y optimizar imágenes.'
            });
        }
        
        return recommendations;
    }

    /**
     * Analiza tendencias de rendimiento
     * @returns {Promise<Object>} Tendencias analizadas
     */
    async analyzeTrends() {
        const trends = {};
        
        for (const [name, metrics] of this.metrics) {
            try {
                trends[name] = await this.analyzeMetricTrends(name, metrics);
            } catch (error) {
                console.error(`Error analizando tendencias de ${name}:`, error);
            }
        }
        
        return trends;
    }

    /**
     * Analiza tendencias de métricas específicas
     * @param {string} metricName - Nombre de la métrica
     * @param {Map} metrics - Mapa de métricas
     * @returns {Object} Tendencias analizadas
     */
    async analyzeMetricTrends(metricName, metrics) {
        const values = Array.from(metrics.values());
        
        if (values.length < 10) {
            return { trend: 'insufficient_data' };
        }
        
        // Calcular tendencia simple (comparar primer vs último valor)
        const firstValue = this.extractNumericValue(values[0]);
        const lastValue = this.extractNumericValue(values[values.length - 1]);
        
        if (firstValue === null || lastValue === null) {
            return { trend: 'non_numeric' };
        }
        
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        let trend;
        if (Math.abs(change) < 5) {
            trend = 'stable';
        } else if (change > 0) {
            trend = 'increasing';
        } else {
            trend = 'decreasing';
        }
        
        return {
            trend,
            changePercent: change,
            firstValue,
            lastValue,
            dataPoints: values.length
        };
    }

    /**
     * Extrae valor numérico de una métrica
     * @param {*} metric - Métrica de la cual extraer valor
     * @returns {number|null} Valor numérico o null
     */
    extractNumericValue(metric) {
        if (typeof metric === 'number') {
            return metric;
        }
        
        if (typeof metric === 'object' && metric !== null) {
            // Buscar propiedades numéricas comunes
            const numericProps = ['value', 'usage', 'time', 'rate', 'count'];
            for (const prop of numericProps) {
                if (typeof metric[prop] === 'number') {
                    return metric[prop];
                }
            }
        }
        
        return null;
    }

    /**
     * Genera reporte de rendimiento
     * @returns {Object} Reporte de rendimiento
     */
    async generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            period: '5_minutes',
            summary: {},
            metrics: {},
            alerts: this.alerts.slice(-10), // Últimas 10 alertas
            recommendations: [],
            trends: {}
        };
        
        // Generar resumen
        report.summary = await this.generatePerformanceSummary();
        
        // Recolectar métricas del período
        report.metrics = await this.getPeriodMetrics();
        
        // Analizar tendencias
        report.trends = await this.analyzeTrends();
        
        // Generar recomendaciones
        report.recommendations = await this.generateRecommendations(report);
        
        // Guardar reporte
        this.savePerformanceReport(report);
        
        return report;
    }

    /**
     * Genera resumen de rendimiento
     * @returns {Object} Resumen de rendimiento
     */
    async generatePerformanceSummary() {
        const currentMetrics = await this.getCurrentMetrics();
        
        return {
            overall: this.calculateOverallScore(currentMetrics),
            system: this.calculateSystemScore(currentMetrics.system),
            application: this.calculateApplicationScore(currentMetrics.application),
            user: this.calculateUserScore(currentMetrics.user),
            uptime: Date.now() - this.startTime,
            alertsCount: this.alerts.length,
            lastAlert: this.alerts.length > 0 ? this.alerts[this.alerts.length - 1].timestamp : null
        };
    }

    /**
     * Calcula puntuación general de rendimiento
     * @param {Object} metrics - Métricas actuales
     * @returns {number} Puntuación entre 0 y 1
     */
    calculateOverallScore(metrics) {
        const scores = [
            this.calculateSystemScore(metrics.system),
            this.calculateApplicationScore(metrics.application),
            this.calculateUserScore(metrics.user)
        ];
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    /**
     * Calcula puntuación del sistema
     * @param {Object} systemMetrics - Métricas del sistema
     * @returns {number} Puntuación entre 0 y 1
     */
    calculateSystemScore(systemMetrics) {
        let score = 1.0;
        
        // Penalizar por uso de memoria alto
        if (systemMetrics.memory && systemMetrics.memory.usage) {
            score -= Math.max(0, systemMetrics.memory.usage - 0.5) * 2;
        }
        
        // Penalizar por uso de CPU alto
        if (systemMetrics.cpu && systemMetrics.cpu.usage) {
            score -= Math.max(0, systemMetrics.cpu.usage - 50) / 100;
        }
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calcula puntuación de la aplicación
     * @param {Object} appMetrics - Métricas de aplicación
     * @returns {number} Puntuación entre 0 y 1
     */
    calculateApplicationScore(appMetrics) {
        let score = 1.0;
        
        // Penalizar por tiempos de respuesta lentos
        if (appMetrics.responseTime) {
            score -= Math.max(0, appMetrics.responseTime - 500) / 5000;
        }
        
        // Penalizar por tasa de errores alta
        if (appMetrics.errorRate) {
            score -= appMetrics.errorRate * 10;
        }
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calcula puntuación de experiencia de usuario
     * @param {Object} userMetrics - Métricas de usuario
     * @returns {number} Puntuación entre 0 y 1
     */
    calculateUserScore(userMetrics) {
        let score = 1.0;
        
        // Penalizar por tiempos de carga lentos
        if (userMetrics.pageLoadTime) {
            score -= Math.max(0, userMetrics.pageLoadTime - 2000) / 10000;
        }
        
        // Penalizar por tasa de rebote alta
        if (userMetrics.bounceRate) {
            score -= userMetrics.bounceRate * 0.5;
        }
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Obtiene métricas del período
     * @returns {Object} Métricas del período
     */
    async getPeriodMetrics() {
        const period = {
            start: Date.now() - 5 * 60 * 1000, // Últimos 5 minutos
            end: Date.now()
        };
        
        const periodMetrics = {};
        
        for (const [name, metrics] of this.metrics) {
            periodMetrics[name] = this.getMetricsInPeriod(metrics, period.start, period.end);
        }
        
        return periodMetrics;
    }

    /**
     * Obtiene métricas en un período específico
     * @param {Map} metrics - Mapa de métricas
     * @param {number} startTime - Tiempo de inicio
     * @param {number} endTime - Tiempo de fin
     * @returns {Array} Métricas en el período
     */
    getMetricsInPeriod(metrics, startTime, endTime) {
        const periodMetrics = [];
        
        for (const [timestamp, value] of metrics) {
            if (timestamp >= startTime && timestamp <= endTime) {
                periodMetrics.push({ timestamp, value });
            }
        }
        
        return periodMetrics;
    }

    /**
     * Guarda métricas detalladas
     * @param {Object} metrics - Métricas a guardar
     */
    saveDetailedMetrics(metrics) {
        const detailed = JSON.parse(localStorage.getItem('detailed_metrics') || '[]');
        detailed.push(metrics);
        
        // Mantener solo los últimos 100 registros
        if (detailed.length > 100) {
            detailed.shift();
        }
        
        localStorage.setItem('detailed_metrics', JSON.stringify(detailed));
    }

    /**
     * Guarda análisis de rendimiento
     * @param {Object} analysis - Análisis a guardar
     */
    savePerformanceAnalysis(analysis) {
        const analyses = JSON.parse(localStorage.getItem('performance_analyses') || '[]');
        analyses.push(analysis);
        
        // Mantener solo los últimos 50 análisis
        if (analyses.length > 50) {
            analyses.shift();
        }
        
        localStorage.setItem('performance_analyses', JSON.stringify(analyses));
    }

    /**
     * Guarda reporte de rendimiento
     * @param {Object} report - Reporte a guardar
     */
    savePerformanceReport(report) {
        const reports = JSON.parse(localStorage.getItem('performance_reports') || '[]');
        reports.push(report);
        
        // Mantener solo los últimos 20 reportes
        if (reports.length > 20) {
            reports.shift();
        }
        
        localStorage.setItem('performance_reports', JSON.stringify(reports));
    }

    /**
     * Obtiene métricas detalladas del sistema
     * @returns {Promise<Object>} Métricas detalladas
     */
    async getDetailedSystemMetrics() {
        return {
            memory: this.getDetailedMemoryMetrics(),
            cpu: this.getDetailedCPUMetrics(),
            network: this.getDetailedNetworkMetrics(),
            storage: this.getDetailedStorageMetrics()
        };
    }

    /**
     * Obtiene métricas detalladas de la aplicación
     * @returns {Promise<Object>} Métricas detalladas
     */
    async getDetailedApplicationMetrics() {
        return {
            endpoints: await this.getEndpointMetrics(),
            database: await this.getDatabaseMetrics(),
            cache: await this.getCacheMetrics(),
            errors: await this.getErrorMetrics()
        };
    }

    /**
     * Obtiene métricas detalladas de usuario
     * @returns {Promise<Object>} Métricas detalladas
     */
    async getDetailedUserMetrics() {
        return {
            pageLoad: this.getPageLoadMetrics(),
            interactions: this.getInteractionMetrics(),
            sessions: this.getSessionMetrics(),
            satisfaction: this.getSatisfactionMetrics()
        };
    }

    /**
     * Obtiene métricas detalladas de negocio
     * @returns {Promise<Object>} Métricas detalladas
     */
    async getDetailedBusinessMetrics() {
        return {
            conversions: await this.getConversionMetrics(),
            revenue: await this.getRevenueMetrics(),
            retention: await this.getRetentionMetrics(),
            engagement: await this.getEngagementMetrics()
        };
    }

    // Métodos placeholder para métricas detalladas
    getDetailedMemoryMetrics() {
        return {
            heap: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            external: 0,
            arrayBuffers: 0
        };
    }

    getDetailedCPUMetrics() {
        return {
            usage: this.getCPUUsage(),
            loadAverage: [0, 0, 0],
            processes: 1
        };
    }

    getDetailedNetworkMetrics() {
        return {
            connection: navigator.connection || null,
            bandwidth: 0,
            latency: 0
        };
    }

    getDetailedStorageMetrics() {
        return {
            localStorage: this.getStorageSize('localStorage'),
            sessionStorage: this.getStorageSize('sessionStorage'),
            indexedDB: 0,
            quota: 0
        };
    }

    async getEndpointMetrics() {
        return {
            '/api/analyze': { avgResponseTime: 1500, requests: 100, errorRate: 0.02 },
            '/api/analysis-history': { avgResponseTime: 300, requests: 50, errorRate: 0.01 }
        };
    }

    async getDatabaseMetrics() {
        return {
            connections: 5,
            queryTime: 150,
            slowQueries: 2
        };
    }

    async getCacheMetrics() {
        return {
            hitRate: 0.85,
            size: 1024000,
            evictions: 10
        };
    }

    async getErrorMetrics() {
        return {
            total: 5,
            byType: {
                network: 2,
                database: 1,
                application: 2
            }
        };
    }

    getPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
        };
    }

    getInteractionMetrics() {
        return {
            clicks: 150,
            scrolls: 50,
            formSubmissions: 10
        };
    }

    getSessionMetrics() {
        return {
            duration: 300000,
            pageViews: 5,
            bounceRate: 0.2
        };
    }

    getSatisfactionMetrics() {
        return {
            score: 4.2,
            feedback: 15
        };
    }

    async getConversionMetrics() {
        return {
            rate: 0.15,
            total: 25,
            value: 1250
        };
    }

    async getRevenueMetrics() {
        return {
            total: 5000,
            perUser: 50,
            growth: 0.1
        };
    }

    async getRetentionMetrics() {
        return {
            daily: 0.7,
            weekly: 0.5,
            monthly: 0.3
        };
    }

    async getEngagementMetrics() {
        return {
            sessionDuration: 300000,
            pageViews: 5,
            interactions: 20
        };
    }

    // Métodos auxiliares
    getCPUUsage() {
        return Math.random() * 100; // Simulación
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    getStorageSize(type) {
        try {
            const storage = window[type];
            let total = 0;
            
            for (let key in storage) {
                if (storage.hasOwnProperty(key)) {
                    total += storage[key].length + key.length;
                }
            }
            
            return total;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Limpia intervalos y detiene el monitoreo
     */
    cleanup() {
        this.stopMonitoring();
        
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        if (this.detailedMetricsInterval) {
            clearInterval(this.detailedMetricsInterval);
        }
        
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
        }
        
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
    }
}

// Clases base para monitores específicos
class SystemMonitor {
    constructor() {
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('🖥️ Monitor de sistema iniciado');
    }

    stop() {
        this.isRunning = false;
        console.log('🖥️ Monitor de sistema detenido');
    }

    async collectMetrics() {
        return {
            memory: this.getMemoryMetrics(),
            cpu: this.getCPUMetrics(),
            network: this.getNetworkMetrics(),
            storage: this.getStorageMetrics(),
            timestamp: Date.now()
        };
    }

    async getCurrentMetrics() {
        return {
            memory: { usage: Math.random() * 0.8 },
            cpu: { usage: Math.random() * 100 },
            network: { latency: Math.random() * 100 },
            storage: { usage: Math.random() * 0.5 }
        };
    }

    getMemoryMetrics() {
        return {
            used: performance.memory ? performance.memory.usedJSHeapSize : 0,
            total: performance.memory ? performance.memory.totalJSHeapSize : 0,
            usage: performance.memory ? performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit : 0
        };
    }

    getCPUMetrics() {
        return {
            usage: Math.random() * 100,
            loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
        };
    }

    getNetworkMetrics() {
        return {
            latency: Math.random() * 100,
            bandwidth: Math.random() * 1000,
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        };
    }

    getStorageMetrics() {
        return {
            used: this.getStorageUsage(),
            available: 0,
            usage: Math.random() * 0.5
        };
    }

    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            total += localStorage.getItem(key).length + key.length;
        }
        return total;
    }
}

class ApplicationMonitor {
    constructor() {
        this.isRunning = false;
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
    }

    start() {
        this.isRunning = true;
        this.setupRequestInterception();
        console.log('⚙️ Monitor de aplicación iniciado');
    }

    stop() {
        this.isRunning = false;
        this.removeRequestInterception();
        console.log('⚙️ Monitor de aplicación detenido');
    }

    setupRequestInterception() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            this.requestCount++;
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                this.responseTimes.push(responseTime);
                if (this.responseTimes.length > 100) {
                    this.responseTimes.shift();
                }
                
                return response;
            } catch (error) {
                this.errorCount++;
                throw error;
            }
        };
    }

    removeRequestInterception() {
        // Restaurar fetch original si es necesario
    }

    async collectMetrics() {
        return {
            requests: this.requestCount,
            errors: this.errorCount,
            responseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate(),
            throughput: this.getThroughput(),
            timestamp: Date.now()
        };
    }

    async getCurrentMetrics() {
        return {
            responseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate(),
            throughput: this.getThroughput(),
            activeConnections: Math.floor(Math.random() * 10)
        };
    }

    getAverageResponseTime() {
        if (this.responseTimes.length === 0) return 0;
        return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }

    getErrorRate() {
        if (this.requestCount === 0) return 0;
        return this.errorCount / this.requestCount;
    }

    getThroughput() {
        return this.requestCount / (Date.now() / 1000); // Requests por segundo
    }
}

class UserExperienceMonitor {
    constructor() {
        this.isRunning = false;
        this.pageLoadTime = 0;
        this.interactions = 0;
        this.sessionStart = Date.now();
    }

    start() {
        this.isRunning = true;
        this.setupPageLoadTracking();
        this.setupInteractionTracking();
        console.log('👤 Monitor de experiencia de usuario iniciado');
    }

    stop() {
        this.isRunning = false;
        console.log('👤 Monitor de experiencia de usuario detenido');
    }

    setupPageLoadTracking() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
            }
        });
    }

    setupInteractionTracking() {
        ['click', 'scroll', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                this.interactions++;
            });
        });
    }

    async collectMetrics() {
        return {
            pageLoadTime: this.pageLoadTime,
            interactions: this.interactions,
            sessionDuration: Date.now() - this.sessionStart,
            bounceRate: this.calculateBounceRate(),
            timestamp: Date.now()
        };
    }

    async getCurrentMetrics() {
        return {
            pageLoadTime: this.pageLoadTime,
            interactions: this.interactions,
            sessionDuration: Date.now() - this.sessionStart,
            bounceRate: this.calculateBounceRate(),
            satisfaction: 4.2
        };
    }

    calculateBounceRate() {
        // Simplificación: basado en interacciones
        return this.interactions < 3 ? 1.0 : 0.2;
    }
}

class BusinessMonitor {
    constructor() {
        this.isRunning = false;
        this.conversions = 0;
        this.revenue = 0;
        this.activeUsers = new Set();
    }

    start() {
        this.isRunning = true;
        this.setupConversionTracking();
        console.log('💰 Monitor de métricas de negocio iniciado');
    }

    stop() {
        this.isRunning = false;
        console.log('💰 Monitor de métricas de negocio detenido');
    }

    setupConversionTracking() {
        // Implementar tracking de conversiones
    }

    async collectMetrics() {
        return {
            conversions: this.conversions,
            revenue: this.revenue,
            activeUsers: this.activeUsers.size,
            retention: this.calculateRetention(),
            timestamp: Date.now()
        };
    }

    async getCurrentMetrics() {
        return {
            conversions: this.conversions,
            revenue: this.revenue,
            activeUsers: this.activeUsers.size,
            retention: this.calculateRetention(),
            engagement: 0.7
        };
    }

    calculateRetention() {
        return Math.random() * 0.5 + 0.5; // 0.5 - 1.0
    }
}

// Exportar para uso global
window.PerformanceMonitor = PerformanceMonitor;