/**
 * Performance Demo - Demostración completa del sistema de optimización de rendimiento
 * Muestra todas las capacidades del sistema con ejemplos prácticos
 */

// Importar componentes necesarios
import { PerformanceOptimizer } from '../src/performance/performanceOptimizer.js';
import { PerformanceMonitor } from '../src/performance/performanceMonitor.js';
import { CacheManager } from '../src/performance/cacheManager.js';
import { PerformanceIntegration } from '../public/js/performance-integration.js';

class PerformanceDemo {
    constructor() {
        this.optimizer = null;
        this.monitor = null;
        this.cache = null;
        this.integration = null;
        this.demoResults = [];
        
        this.initializeDemo();
    }

    /**
     * Inicializa la demostración
     */
    async initializeDemo() {
        console.log('🚀 Iniciando Demo de Optimización de Rendimiento...');
        
        try {
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar demo
            this.setupDemo();
            
            // Iniciar demo
            await this.runDemo();
            
        } catch (error) {
            console.error('❌ Error en demo:', error);
        }
    }

    /**
     * Inicializa los componentes de rendimiento
     */
    async initializeComponents() {
        console.log('📦 Inicializando componentes...');
        
        // Inicializar Performance Optimizer
        this.optimizer = new PerformanceOptimizer();
        
        // Inicializar Performance Monitor
        this.monitor = new PerformanceMonitor();
        this.monitor.startMonitoring();
        
        // Inicializar Cache Manager
        this.cache = new CacheManager({
            defaultTTL: 300000,
            maxSize: 50 * 1024 * 1024,
            strategy: 'lru',
            compressionEnabled: true,
            persistenceEnabled: true
        });
        
        // Inicializar Performance Integration
        this.integration = new PerformanceIntegration({
            autoOptimize: false, // Desactivar para demo manual
            showMetrics: true,
            enableAlerts: true
        });
        
        console.log('✅ Componentes inicializados');
    }

    /**
     * Configura la demostración
     */
    setupDemo() {
        console.log('⚙️ Configurando demo...');
        
        // Configurar event listeners para demo
        this.setupEventListeners();
        
        // Crear UI de demo
        this.createDemoUI();
        
        console.log('✅ Demo configurada');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Event listener para optimización
        this.optimizer.on('optimization-complete', (results) => {
            this.handleOptimizationResults(results);
        });
        
        // Event listener para alertas
        this.monitor.on('alert', (alert) => {
            this.handleAlert(alert);
        });
        
        // Event listener para métricas
        this.monitor.on('metrics-updated', (metrics) => {
            this.updateMetricsDisplay(metrics);
        });
    }

    /**
     * Crea la UI de demostración
     */
    createDemoUI() {
        const demoHTML = `
            <div id="performance-demo" class="performance-demo">
                <div class="demo-header">
                    <h2>🚀 Demo de Optimización de Rendimiento</h2>
                    <p>Explora todas las capacidades del sistema de optimización</p>
                </div>
                
                <div class="demo-controls">
                    <div class="control-section">
                        <h3>🎯 Optimización</h3>
                        <button id="demo-full-optimization" class="demo-btn primary">
                            Optimización Completa
                        </button>
                        <button id="demo-frontend-optimization" class="demo-btn">
                            Optimizar Frontend
                        </button>
                        <button id="demo-backend-optimization" class="demo-btn">
                            Optimizar Backend
                        </button>
                        <button id="demo-cache-optimization" class="demo-btn">
                            Optimizar Caché
                        </button>
                    </div>
                    
                    <div class="control-section">
                        <h3>📊 Monitoreo</h3>
                        <button id="demo-start-monitoring" class="demo-btn">
                            Iniciar Monitoreo
                        </button>
                        <button id="demo-stop-monitoring" class="demo-btn">
                            Detener Monitoreo
                        </button>
                        <button id="demo-generate-report" class="demo-btn">
                            Generar Reporte
                        </button>
                        <button id="demo-export-metrics" class="demo-btn">
                            Exportar Métricas
                        </button>
                    </div>
                    
                    <div class="control-section">
                        <h3>💾 Caché</h3>
                        <button id="demo-cache-operations" class="demo-btn">
                            Operaciones de Caché
                        </button>
                        <button id="demo-cache-warming" class="demo-btn">
                            Cache Warming
                        </button>
                        <button id="demo-cache-invalidation" class="demo-btn">
                            Invalidación de Caché
                        </button>
                        <button id="demo-cache-stats" class="demo-btn">
                            Estadísticas de Caché
                        </button>
                    </div>
                    
                    <div class="control-section">
                        <h3>🎨 UI/UX</h3>
                        <button id="demo-show-dashboard" class="demo-btn">
                            Mostrar Dashboard
                        </button>
                        <button id="demo-show-metrics" class="demo-btn">
                            Mostrar Métricas
                        </button>
                        <button id="demo-show-alerts" class="demo-btn">
                            Mostrar Alertas
                        </button>
                        <button id="demo-theme-toggle" class="demo-btn">
                            Cambiar Tema
                        </button>
                    </div>
                </div>
                
                <div class="demo-results">
                    <h3>📈 Resultados de la Demo</h3>
                    <div id="demo-output" class="demo-output">
                        <div class="demo-welcome">
                            <p>👋 Bienvenido a la demo de optimización de rendimiento.</p>
                            <p>Selecciona una opción arriba para comenzar.</p>
                        </div>
                    </div>
                </div>
                
                <div class="demo-status">
                    <div class="status-item">
                        <span class="status-label">Estado:</span>
                        <span id="demo-status" class="status-value">Listo</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Métricas:</span>
                        <span id="demo-metrics-count" class="status-value">0</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Alertas:</span>
                        <span id="demo-alerts-count" class="status-value">0</span>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', demoHTML);
        
        // Configurar event listeners de botones
        this.setupDemoButtons();
        
        // Agregar estilos
        this.addDemoStyles();
    }

    /**
     * Configura los botones de demo
     */
    setupDemoButtons() {
        // Botones de optimización
        document.getElementById('demo-full-optimization').addEventListener('click', () => {
            this.demoFullOptimization();
        });
        
        document.getElementById('demo-frontend-optimization').addEventListener('click', () => {
            this.demoFrontendOptimization();
        });
        
        document.getElementById('demo-backend-optimization').addEventListener('click', () => {
            this.demoBackendOptimization();
        });
        
        document.getElementById('demo-cache-optimization').addEventListener('click', () => {
            this.demoCacheOptimization();
        });
        
        // Botones de monitoreo
        document.getElementById('demo-start-monitoring').addEventListener('click', () => {
            this.demoStartMonitoring();
        });
        
        document.getElementById('demo-stop-monitoring').addEventListener('click', () => {
            this.demoStopMonitoring();
        });
        
        document.getElementById('demo-generate-report').addEventListener('click', () => {
            this.demoGenerateReport();
        });
        
        document.getElementById('demo-export-metrics').addEventListener('click', () => {
            this.demoExportMetrics();
        });
        
        // Botones de caché
        document.getElementById('demo-cache-operations').addEventListener('click', () => {
            this.demoCacheOperations();
        });
        
        document.getElementById('demo-cache-warming').addEventListener('click', () => {
            this.demoCacheWarming();
        });
        
        document.getElementById('demo-cache-invalidation').addEventListener('click', () => {
            this.demoCacheInvalidation();
        });
        
        document.getElementById('demo-cache-stats').addEventListener('click', () => {
            this.demoCacheStats();
        });
        
        // Botones de UI/UX
        document.getElementById('demo-show-dashboard').addEventListener('click', () => {
            this.integration.showDashboard();
        });
        
        document.getElementById('demo-show-metrics').addEventListener('click', () => {
            this.integration.showMetrics();
        });
        
        document.getElementById('demo-show-alerts').addEventListener('click', () => {
            this.integration.showAlerts();
        });
        
        document.getElementById('demo-theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    /**
     * Agrega estilos para la demo
     */
    addDemoStyles() {
        const styles = `
            <style id="demo-styles">
                .performance-demo {
                    max-width: 1200px;
                    margin: 20px auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .demo-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .demo-header h2 {
                    color: #1f2937;
                    margin-bottom: 10px;
                }
                
                .demo-header p {
                    color: #6b7280;
                    font-size: 16px;
                }
                
                .demo-controls {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .control-section {
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e5e7eb;
                }
                
                .control-section h3 {
                    margin: 0 0 15px 0;
                    color: #374151;
                    font-size: 16px;
                }
                
                .demo-btn {
                    display: block;
                    width: 100%;
                    padding: 10px 15px;
                    margin-bottom: 8px;
                    border: none;
                    border-radius: 6px;
                    background: #3b82f6;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                
                .demo-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }
                
                .demo-btn.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .demo-btn.primary:hover {
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                }
                
                .demo-results {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 20px;
                }
                
                .demo-results h3 {
                    margin: 0 0 15px 0;
                    color: #374151;
                }
                
                .demo-output {
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 15px;
                    min-height: 200px;
                    max-height: 400px;
                    overflow-y: auto;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                }
                
                .demo-welcome {
                    text-align: center;
                    color: #6b7280;
                    font-style: italic;
                }
                
                .demo-status {
                    display: flex;
                    justify-content: space-around;
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 15px;
                    border: 1px solid #e5e7eb;
                }
                
                .status-item {
                    text-align: center;
                }
                
                .status-label {
                    color: #6b7280;
                    font-size: 14px;
                }
                
                .status-value {
                    color: #1f2937;
                    font-weight: 600;
                    margin-left: 5px;
                }
                
                .demo-log {
                    margin-bottom: 10px;
                    padding: 8px;
                    border-radius: 4px;
                }
                
                .demo-log.info {
                    background: #eff6ff;
                    border-left: 3px solid #3b82f6;
                }
                
                .demo-log.success {
                    background: #f0fdf4;
                    border-left: 3px solid #10b981;
                }
                
                .demo-log.warning {
                    background: #fffbeb;
                    border-left: 3px solid #f59e0b;
                }
                
                .demo-log.error {
                    background: #fef2f2;
                    border-left: 3px solid #ef4444;
                }
                
                .demo-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .metric-card {
                    background: white;
                    padding: 10px;
                    border-radius: 6px;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                }
                
                .metric-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #1f2937;
                }
                
                .metric-label {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }
                
                @media (max-width: 768px) {
                    .demo-controls {
                        grid-template-columns: 1fr;
                    }
                    
                    .demo-status {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Ejecuta la demostración completa
     */
    async runDemo() {
        console.log('🎬 Ejecutando demo...');
        
        this.updateStatus('Demo en ejecución');
        this.log('info', '🚀 Iniciando demostración de optimización de rendimiento');
        
        // Esperar un momento para que todo se inicialice
        await this.sleep(1000);
        
        // Mostrar mensaje de bienvenida
        this.log('info', '👋 Bienvenido a la demo del sistema de optimización');
        this.log('info', '📋 Los componentes principales se han inicializado:');
        this.log('info', '   • Performance Optimizer - Optimización automática');
        this.log('info', '   • Performance Monitor - Monitoreo en tiempo real');
        this.log('info', '   • Cache Manager - Gestión avanzada de caché');
        this.log('info', '   • Performance Integration - Integración con UI');
        
        this.updateStatus('Demo completa');
    }

    /**
     * Demo de optimización completa
     */
    async demoFullOptimization() {
        this.updateStatus('Ejecutando optimización completa...');
        this.log('info', '🎯 Iniciando optimización completa del sistema...');
        
        try {
            const startTime = performance.now();
            
            // Ejecutar optimización
            const results = await this.optimizer.optimizeSystem();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Mostrar resultados
            this.log('success', `✅ Optimización completada en ${duration.toFixed(2)}ms`);
            this.displayOptimizationResults(results);
            
            this.updateStatus('Optimización completada');
            
        } catch (error) {
            this.log('error', `❌ Error en optimización: ${error.message}`);
            this.updateStatus('Error en optimización');
        }
    }

    /**
     * Demo de optimización de frontend
     */
    async demoFrontendOptimization() {
        this.updateStatus('Optimizando frontend...');
        this.log('info', '🎨 Iniciando optimización de frontend...');
        
        try {
            const results = await this.optimizer.optimizeFrontend();
            
            this.log('success', '✅ Optimización de frontend completada');
            this.log('info', `📈 Mejora de rendimiento: ${(results.overall.performanceGain * 100).toFixed(1)}%`);
            this.log('info', `💾 Reducción de memoria: ${(results.overall.memoryReduction * 100).toFixed(1)}%`);
            
            this.updateStatus('Frontend optimizado');
            
        } catch (error) {
            this.log('error', `❌ Error optimizando frontend: ${error.message}`);
        }
    }

    /**
     * Demo de optimización de backend
     */
    async demoBackendOptimization() {
        this.updateStatus('Optimizando backend...');
        this.log('info', '⚙️ Iniciando optimización de backend...');
        
        try {
            const results = await this.optimizer.optimizeBackend();
            
            this.log('success', '✅ Optimización de backend completada');
            this.log('info', `⚡ Reducción de tiempo de respuesta: ${(results.overall.responseTimeReduction * 100).toFixed(1)}%`);
            this.log('info', `📈 Aumento de throughput: ${(results.overall.throughputIncrease * 100).toFixed(1)}%`);
            
            this.updateStatus('Backend optimizado');
            
        } catch (error) {
            this.log('error', `❌ Error optimizando backend: ${error.message}`);
        }
    }

    /**
     * Demo de optimización de caché
     */
    async demoCacheOptimization() {
        this.updateStatus('Optimizando caché...');
        this.log('info', '💾 Iniciando optimización de caché...');
        
        try {
            const results = await this.optimizer.optimizeCache();
            
            this.log('success', '✅ Optimización de caché completada');
            this.log('info', `🎯 Mejora de hit rate: ${(results.overall.hitRateImprovement * 100).toFixed(1)}%`);
            this.log('info', `📦 Eficiencia de almacenamiento: ${(results.overall.storageEfficiency * 100).toFixed(1)}%`);
            
            this.updateStatus('Caché optimizado');
            
        } catch (error) {
            this.log('error', `❌ Error optimizando caché: ${error.message}`);
        }
    }

    /**
     * Demo de inicio de monitoreo
     */
    demoStartMonitoring() {
        this.updateStatus('Iniciando monitoreo...');
        this.log('info', '📊 Iniciando monitoreo de rendimiento...');
        
        try {
            this.monitor.startMonitoring();
            this.log('success', '✅ Monitoreo iniciado');
            this.log('info', '📈 Recopilando métricas cada 5 segundos');
            this.log('info', '🚨 Alertas configuradas para umbrales críticos');
            
            this.updateStatus('Monitoreo activo');
            
        } catch (error) {
            this.log('error', `❌ Error iniciando monitoreo: ${error.message}`);
        }
    }

    /**
     * Demo de detención de monitoreo
     */
    demoStopMonitoring() {
        this.updateStatus('Deteniendo monitoreo...');
        this.log('info', '⏹️ Deteniendo monitoreo de rendimiento...');
        
        try {
            this.monitor.stopMonitoring();
            this.log('success', '✅ Monitoreo detenido');
            this.log('info', '📊 Métricas guardadas para análisis');
            
            this.updateStatus('Monitoreo detenido');
            
        } catch (error) {
            this.log('error', `❌ Error deteniendo monitoreo: ${error.message}`);
        }
    }

    /**
     * Demo de generación de reporte
     */
    async demoGenerateReport() {
        this.updateStatus('Generando reporte...');
        this.log('info', '📄 Generando reporte de rendimiento...');
        
        try {
            const report = await this.monitor.generatePerformanceReport();
            
            this.log('success', '✅ Reporte generado exitosamente');
            this.log('info', `📊 Puntuación general: ${(report.summary.overallScore * 100).toFixed(1)}%`);
            this.log('info', `⏱️ Tiempo de actividad: ${Math.floor(report.summary.uptime / 1000)}s`);
            this.log('info', `🚨 Total de alertas: ${report.summary.alertsCount}`);
            
            this.displayReport(report);
            this.updateStatus('Reporte generado');
            
        } catch (error) {
            this.log('error', `❌ Error generando reporte: ${error.message}`);
        }
    }

    /**
     * Demo de exportación de métricas
     */
    async demoExportMetrics() {
        this.updateStatus('Exportando métricas...');
        this.log('info', '📤 Exportando métricas de rendimiento...');
        
        try {
            const metrics = await this.monitor.getCurrentMetrics();
            const dataStr = JSON.stringify(metrics, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-metrics-${Date.now()}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.log('success', '✅ Métricas exportadas exitosamente');
            this.updateStatus('Métricas exportadas');
            
        } catch (error) {
            this.log('error', `❌ Error exportando métricas: ${error.message}`);
        }
    }

    /**
     * Demo de operaciones de caché
     */
    async demoCacheOperations() {
        this.updateStatus('Demo operaciones de caché...');
        this.log('info', '💾 Demostrando operaciones de caché...');
        
        try {
            // Demo de set/get
            await this.cache.set('demo-key', { data: 'valor de prueba', timestamp: Date.now() });
            this.log('info', '✅ Datos almacenados en caché');
            
            const value = await this.cache.get('demo-key');
            this.log('info', `✅ Datos recuperados: ${JSON.stringify(value)}`);
            
            // Demo de múltiples operaciones
            const batchData = {
                'user:1': { name: 'Usuario 1', email: 'user1@example.com' },
                'user:2': { name: 'Usuario 2', email: 'user2@example.com' },
                'config:app': { version: '1.0.0', debug: false }
            };
            
            const setCount = await this.cache.mset(batchData);
            this.log('info', `✅ ${setCount} items almacenados en batch`);
            
            const batchResults = await this.cache.mget(Object.keys(batchData));
            this.log('info', `✅ ${Object.keys(batchResults).length} items recuperados en batch`);
            
            this.updateStatus('Operaciones de caché completadas');
            
        } catch (error) {
            this.log('error', `❌ Error en operaciones de caché: ${error.message}`);
        }
    }

    /**
     * Demo de cache warming
     */
    async demoCacheWarming() {
        this.updateStatus('Cache warming...');
        this.log('info', '🔥 Demostrando cache warming...');
        
        try {
            const warmupData = [
                { key: 'analysis:template:1', value: { type: 'pdf', template: 'standard' } },
                { key: 'analysis:template:2', value: { type: 'pptx', template: 'advanced' } },
                { key: 'config:models', value: { groq: 'llama-3.1-70b', openai: 'gpt-4' } },
                { key: 'user:preferences', value: { theme: 'dark', language: 'es' } }
            ];
            
            const warmedCount = await this.cache.warmUp(warmupData);
            this.log('success', `✅ ${warmedCount} items precalentados en caché`);
            
            this.updateStatus('Cache warming completado');
            
        } catch (error) {
            this.log('error', `❌ Error en cache warming: ${error.message}`);
        }
    }

    /**
     * Demo de invalidación de caché
     */
    async demoCacheInvalidation() {
        this.updateStatus('Invalidación de caché...');
        this.log('info', '🗑️ Demostrando invalidación de caché...');
        
        try {
            // Invalidar por patrón
            const invalidatedPattern = await this.cache.invalidateByPattern('user:*');
            this.log('info', `✅ ${invalidatedPattern} items eliminados por patrón`);
            
            // Invalidar por etiquetas
            const invalidatedTags = await this.cache.deleteByTags(['temp', 'cache']);
            this.log('info', `✅ ${invalidatedTags} items eliminados por etiquetas`);
            
            this.updateStatus('Invalidación completada');
            
        } catch (error) {
            this.log('error', `❌ Error en invalidación: ${error.message}`);
        }
    }

    /**
     * Demo de estadísticas de caché
     */
    async demoCacheStats() {
        this.updateStatus('Estadísticas de caché...');
        this.log('info', '📊 Obteniendo estadísticas de caché...');
        
        try {
            const stats = this.cache.getStats();
            
            this.log('success', '✅ Estadísticas de caché:');
            this.log('info', `📈 Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
            this.log('info', `📦 Items en caché: ${stats.itemCount}`);
            this.log('info', `💾 Uso de memoria: ${(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
            this.log('info', `🎯 Tasa de aciertos: ${(stats.hitRate * 100).toFixed(1)}%`);
            this.log('info', `❌ Tasa de fallos: ${(stats.missRate * 100).toFixed(1)}%`);
            
            this.displayCacheStats(stats);
            this.updateStatus('Estadísticas obtenidas');
            
        } catch (error) {
            this.log('error', `❌ Error obteniendo estadísticas: ${error.message}`);
        }
    }

    /**
     * Cambia el tema de la aplicación
     */
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        this.log('info', `🎨 Tema cambiado a: ${newTheme}`);
    }

    /**
     * Maneja resultados de optimización
     */
    handleOptimizationResults(results) {
        this.log('success', '🎯 Optimización completada con éxito');
        
        if (results.summary) {
            this.log('info', `📊 Puntuación general: ${(results.summary.overallScore * 100).toFixed(1)}%`);
            this.log('info', `⚡ Mejoras totales: ${results.summary.totalImprovements}`);
        }
    }

    /**
     * Maneja alertas del monitor
     */
    handleAlert(alert) {
        this.log('warning', `🚨 Alerta: ${alert.message}`);
        this.updateAlertsCount();
    }

    /**
     * Actualiza display de métricas
     */
    updateMetricsDisplay(metrics) {
        this.updateMetricsCount();
        
        // Actualizar display cada cierto tiempo
        if (Math.random() < 0.1) { // 10% de probabilidad
            this.displayCurrentMetrics(metrics);
        }
    }

    /**
     * Muestra resultados de optimización
     */
    displayOptimizationResults(results) {
        const resultsHTML = `
            <div class="demo-log success">
                <strong>📊 Resultados de Optimización</strong><br>
                Frontend: ${results.frontend?.overall?.score ? (results.frontend.overall.score * 100).toFixed(1) + '%' : 'N/A'}<br>
                Backend: ${results.backend?.overall?.score ? (results.backend.overall.score * 100).toFixed(1) + '%' : 'N/A'}<br>
                Base de Datos: ${results.database?.overall?.score ? (results.database.overall.score * 100).toFixed(1) + '%' : 'N/A'}<br>
                Caché: ${results.cache?.overall?.score ? (results.cache.overall.score * 100).toFixed(1) + '%' : 'N/A'}
            </div>
        `;
        
        this.addToOutput(resultsHTML);
    }

    /**
     * Muestra reporte
     */
    displayReport(report) {
        const reportHTML = `
            <div class="demo-log info">
                <strong>📄 Reporte de Rendimiento</strong><br>
                Período: ${report.period}<br>
                Puntuación: ${(report.summary.overallScore * 100).toFixed(1)}%<br>
                Uptime: ${Math.floor(report.summary.uptime / 1000)}s<br>
                Alertas: ${report.summary.alertsCount}
            </div>
        `;
        
        this.addToOutput(reportHTML);
    }

    /**
     * Muestra estadísticas de caché
     */
    displayCacheStats(stats) {
        const statsHTML = `
            <div class="demo-log info">
                <strong>💾 Estadísticas de Caché</strong><br>
                Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%<br>
                Items: ${stats.itemCount}<br>
                Memoria: ${(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB<br>
                Evicciones: ${stats.evictions}
            </div>
        `;
        
        this.addToOutput(statsHTML);
    }

    /**
     * Muestra métricas actuales
     */
    displayCurrentMetrics(metrics) {
        const metricsHTML = `
            <div class="demo-metrics">
                <div class="metric-card">
                    <div class="metric-value">${metrics.system?.memory ? (metrics.system.memory.usage * 100).toFixed(0) : '--'}%</div>
                    <div class="metric-label">Memoria</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.system?.cpu ? metrics.system.cpu.usage.toFixed(0) : '--'}%</div>
                    <div class="metric-label">CPU</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.application?.responseTime ? metrics.application.responseTime.toFixed(0) : '--'}ms</div>
                    <div class="metric-label">Respuesta</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.cache?.hitRate ? (metrics.cache.hitRate * 100).toFixed(0) : '--'}%</div>
                    <div class="metric-label">Cache Hit</div>
                </div>
            </div>
        `;
        
        this.addToOutput(metricsHTML);
    }

    /**
     * Agrega contenido al output
     */
    addToOutput(content) {
        const output = document.getElementById('demo-output');
        output.insertAdjacentHTML('beforeend', content);
        output.scrollTop = output.scrollHeight;
    }

    /**
     * Registra un mensaje en el log
     */
    log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logHTML = `
            <div class="demo-log ${level}">
                <strong>[${timestamp}]</strong> ${message}
            </div>
        `;
        
        this.addToOutput(logHTML);
        console.log(`[${level.toUpperCase()}] ${message}`);
    }

    /**
     * Actualiza el estado
     */
    updateStatus(status) {
        document.getElementById('demo-status').textContent = status;
    }

    /**
     * Actualiza contador de métricas
     */
    updateMetricsCount() {
        const count = this.monitor.metrics.size || 0;
        document.getElementById('demo-metrics-count').textContent = count;
    }

    /**
     * Actualiza contador de alertas
     */
    updateAlertsCount() {
        const count = this.monitor.alerts.length || 0;
        document.getElementById('demo-alerts-count').textContent = count;
    }

    /**
     * Función utilidad para esperar
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destruye la demo
     */
    destroy() {
        console.log('💥 Destruyendo demo...');
        
        // Limpiar componentes
        if (this.monitor) {
            this.monitor.stopMonitoring();
        }
        
        if (this.integration) {
            this.integration.destroy();
        }
        
        if (this.cache) {
            this.cache.destroy();
        }
        
        // Remover UI
        const demoElement = document.getElementById('performance-demo');
        if (demoElement) {
            demoElement.remove();
        }
        
        // Remover estilos
        const styles = document.getElementById('demo-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('✅ Demo destruida');
    }
}

// Iniciar demo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de la demo
    window.performanceDemo = new PerformanceDemo();
    
    // Agregar botón para reiniciar demo
    const restartBtn = document.createElement('button');
    restartBtn.textContent = '🔄 Reiniciar Demo';
    restartBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        z-index: 10000;
    `;
    
    restartBtn.addEventListener('click', () => {
        if (window.performanceDemo) {
            window.performanceDemo.destroy();
        }
        window.performanceDemo = new PerformanceDemo();
    });
    
    document.body.appendChild(restartBtn);
});

// Exportar para uso en otros módulos
export default PerformanceDemo;