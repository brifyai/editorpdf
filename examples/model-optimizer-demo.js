/**
 * Demostración del Optimizador Inteligente de Modelos de IA
 * Document Analyzer - Sistema de Selección Automática de Modelos
 */

const { modelOptimizer } = require('../src/ai/modelOptimizer');

async function demonstrateModelOptimizer() {
    console.log('🤖 Demostración del Optimizador Inteligente de Modelos\n');
    console.log('=' .repeat(60));

    // 1. Demostración de configuración óptima para diferentes escenarios
    console.log('\n📋 ESCENARIO 1: Documento Empresarial con OCR de Alta Calidad');
    console.log('-'.repeat(50));
    
    const businessConfig = await modelOptimizer.getOptimalConfiguration({
        documentType: 'business',
        ocrConfidence: 85,
        strategy: 'auto',
        priority: 'balanced',
        documentLength: 2000
    });

    console.log('📄 Tipo de Documento:', businessConfig.document_type.name);
    console.log('🎯 Modelo Recomendado:', businessConfig.model.name);
    console.log('📊 Precisión:', `${(businessConfig.model.performance.accuracy * 100).toFixed(1)}%`);
    console.log('⚡ Velocidad:', `${(businessConfig.model.performance.speed * 100).toFixed(1)}%`);
    console.log('💡 Razón:', businessConfig.reasoning);
    console.log('🔧 Parámetros:', JSON.stringify(businessConfig.parameters, null, 2));
    console.log('📈 Nivel de Confianza OCR:', businessConfig.ocr_confidence.label);

    console.log('\n📋 ESCENARIO 2: Documento Legal con OCR de Baja Calidad');
    console.log('-'.repeat(50));

    const legalConfig = await modelOptimizer.getOptimalConfiguration({
        documentType: 'legal',
        ocrConfidence: 65,
        strategy: 'auto',
        priority: 'accuracy',
        documentLength: 3500
    });

    console.log('📄 Tipo de Documento:', legalConfig.document_type.name);
    console.log('⚖️ Modelo Recomendado:', legalConfig.model.name);
    console.log('📊 Precisión:', `${(legalConfig.model.performance.accuracy * 100).toFixed(1)}%`);
    console.log('⚡ Velocidad:', `${(legalConfig.model.performance.speed * 100).toFixed(1)}%`);
    console.log('💡 Razón:', legalConfig.reasoning);
    console.log('🔧 Parámetros:', JSON.stringify(legalConfig.parameters, null, 2));
    console.log('📈 Nivel de Confianza OCR:', legalConfig.ocr_confidence.label);

    console.log('\n📋 ESCENARIO 3: Documento Médico Crítico');
    console.log('-'.repeat(50));

    const medicalConfig = await modelOptimizer.getOptimalConfiguration({
        documentType: 'medical',
        ocrConfidence: 70,
        strategy: 'accuracy',
        priority: 'accuracy',
        documentLength: 2800
    });

    console.log('🏥 Tipo de Documento:', medicalConfig.document_type.name);
    console.log('🧠 Modelo Recomendado:', medicalConfig.model.name);
    console.log('📊 Precisión:', `${(medicalConfig.model.performance.accuracy * 100).toFixed(1)}%`);
    console.log('⚡ Velocidad:', `${(medicalConfig.model.performance.speed * 100).toFixed(1)}%`);
    console.log('💡 Razón:', medicalConfig.reasoning);
    console.log('🔧 Parámetros:', JSON.stringify(medicalConfig.parameters, null, 2));
    console.log('📈 Nivel de Confianza OCR:', medicalConfig.ocr_confidence.label);

    console.log('\n📋 ESCENARIO 4: Procesamiento Rápido por Lotes');
    console.log('-'.repeat(50));

    const batchConfig = await modelOptimizer.getOptimalConfiguration({
        documentType: 'general',
        ocrConfidence: 90,
        strategy: 'speed',
        priority: 'speed',
        documentLength: 1000
    });

    console.log('📄 Tipo de Documento:', batchConfig.document_type.name);
    console.log('🚀 Modelo Recomendado:', batchConfig.model.name);
    console.log('📊 Precisión:', `${(batchConfig.model.performance.accuracy * 100).toFixed(1)}%`);
    console.log('⚡ Velocidad:', `${(batchConfig.model.performance.speed * 100).toFixed(1)}%`);
    console.log('💡 Razón:', batchConfig.reasoning);
    console.log('🔧 Parámetros:', JSON.stringify(batchConfig.parameters, null, 2));
    console.log('📈 Nivel de Confianza OCR:', batchConfig.ocr_confidence.label);

    // 2. Demostración de procesamiento por lotes
    console.log('\n\n🔄 DEMOSTRACIÓN 2: Procesamiento Inteligente por Lotes');
    console.log('=' .repeat(60));

    const batchDocuments = [
        { id: 'doc1', filename: 'contrato_legal.pdf', type: 'legal', ocr_confidence: 75 },
        { id: 'doc2', filename: 'factura_empresa.jpg', type: 'financial', ocr_confidence: 60 },
        { id: 'doc3', filename: 'informe_medico.pdf', type: 'medical', ocr_confidence: 80 },
        { id: 'doc4', filename: 'presentacion_negocio.pptx', type: 'business', ocr_confidence: 95 },
        { id: 'doc5', filename: 'articulo_cientifico.pdf', type: 'academic', ocr_confidence: 85 }
    ];

    const batchRecommendations = await modelOptimizer.getBatchRecommendations(batchDocuments);

    console.log('\n📊 Análisis del Lote:');
    console.log(`📁 Total de documentos: ${batchRecommendations.recommendations.length}`);
    console.log(`🎯 Estrategia utilizada: Automática Inteligente`);
    console.log(`⏱️ Tiempo estimado: ${batchRecommendations.processing_strategy.estimated_time.estimated_seconds} segundos`);

    console.log('\n📋 Recomendaciones por Documento:');
    batchRecommendations.recommendations.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.document_id}`);
        console.log(`   📄 Tipo: ${rec.document_type.name}`);
        console.log(`   🎯 Modelo: ${rec.model.name}`);
        console.log(`   📊 Precisión: ${(rec.model.performance.accuracy * 100).toFixed(1)}%`);
        console.log(`   ⚡ Velocidad: ${(rec.model.performance.speed * 100).toFixed(1)}%`);
        console.log(`   💡 Razón: ${rec.reasoning}`);
    });

    console.log('\n🔄 Orden Óptimo de Procesamiento:');
    batchRecommendations.processing_strategy.recommended_order.forEach((group, index) => {
        console.log(`${index + 1}. ${group.model} (${group.count} documentos)`);
        console.log(`   📁 Documentos: ${group.documents.join(', ')}`);
    });

    // 3. Demostración de diferentes estrategias
    console.log('\n\n🎛️ DEMOSTRACIÓN 3: Comparación de Estrategias');
    console.log('=' .repeat(60));

    const testDocument = {
        documentType: 'business',
        ocrConfidence: 75,
        documentLength: 2000
    };

    const strategies = ['auto', 'speed', 'accuracy', 'ocr_optimized'];
    
    for (const strategy of strategies) {
        console.log(`\n📋 Estrategia: ${strategy.toUpperCase()}`);
        console.log('-'.repeat(30));
        
        const config = await modelOptimizer.getOptimalConfiguration({
            ...testDocument,
            strategy
        });

        console.log(`🎯 Modelo: ${config.model.name}`);
        console.log(`📊 Precisión: ${(config.model.performance.accuracy * 100).toFixed(1)}%`);
        console.log(`⚡ Velocidad: ${(config.model.performance.speed * 100).toFixed(1)}%`);
        console.log(`💡 Razón: ${config.reasoning}`);
    }

    // 4. Demostración de ajuste de parámetros
    console.log('\n\n⚙️ DEMOSTRACIÓN 4: Ajuste Dinámico de Parámetros');
    console.log('=' .repeat(60));

    const parameterTests = [
        { ocr_confidence: 95, expected: 'modelo rápido' },
        { ocr_confidence: 80, expected: 'modelo balanceado' },
        { ocr_confidence: 60, expected: 'modelo preciso' },
        { ocr_confidence: 40, expected: 'modelo máximo + especialista' }
    ];

    for (const test of parameterTests) {
        console.log(`\n📊 Confianza OCR: ${test.ocr_confidence}% (${test.expected})`);
        console.log('-'.repeat(40));
        
        const config = await modelOptimizer.getOptimalConfiguration({
            documentType: 'general',
            ocrConfidence: test.ocr_confidence,
            strategy: 'auto'
        });

        console.log(`🎯 Modelo seleccionado: ${config.model.name}`);
        console.log(`🌡️ Temperatura: ${config.parameters.temperature}`);
        console.log(`📝 Max Tokens: ${config.parameters.max_tokens}`);
        console.log(`💡 Justificación: ${config.reasoning}`);
    }

    // 5. Demostración de métricas de rendimiento
    console.log('\n\n📈 DEMOSTRACIÓN 5: Métricas de Rendimiento');
    console.log('=' .repeat(60));

    // Simular algunos usos para generar métricas
    console.log('🔄 Simulando usos de modelos...');
    
    // Simular uso exitoso de Llama 3.3
    modelOptimizer.recordModelUsage('llama-3.3-70b-versatile', true, 3200, 0.92);
    modelOptimizer.recordModelUsage('llama-3.3-70b-versatile', true, 2800, 0.89);
    modelOptimizer.recordModelUsage('llama-3.3-70b-versatile', true, 3500, 0.94);

    // Simular uso de Mixtral
    modelOptimizer.recordModelUsage('mixtral-8x7b-32768', true, 5800, 0.95);
    modelOptimizer.recordModelUsage('mixtral-8x7b-32768', true, 6200, 0.93);

    // Simular uso de Llama 3.1
    modelOptimizer.recordModelUsage('llama-3.1-8b-instant', true, 1200, 0.82);
    modelOptimizer.recordModelUsage('llama-3.1-8b-instant', true, 1000, 0.80);
    modelOptimizer.recordModelUsage('llama-3.1-8b-instant', false, 1500, 0); // Error

    const performanceStats = modelOptimizer.getPerformanceStats();

    console.log('\n📊 Estadísticas de Rendimiento:');
    console.log(`📁 Tamaño de caché: ${performanceStats.cache_size}`);
    console.log(`🤖 Total de modelos: ${performanceStats.total_models}`);

    console.log('\n📈 Rendimiento por Modelo:');
    Object.entries(performanceStats.models).forEach(([modelId, stats]) => {
        console.log(`\n${modelId}:`);
        console.log(`   📊 Usos totales: ${stats.totalUses}`);
        console.log(`   ✅ Usos exitosos: ${stats.successfulUses}`);
        console.log(`   📈 Confiabilidad: ${(stats.reliability * 100).toFixed(1)}%`);
        console.log(`   ⏱️ Tiempo promedio: ${stats.averageResponseTime.toFixed(0)}ms`);
        console.log(`   🎯 Precisión promedio: ${(stats.averageAccuracy * 100).toFixed(1)}%`);
        console.log(`   🏆 Puntuación rendimiento: ${(stats.performance_score * 100).toFixed(1)}%`);
    });

    // 6. Demostración de fallback y recuperación
    console.log('\n\n🔄 DEMOSTRACIÓN 6: Sistema de Fallback y Recuperación');
    console.log('=' .repeat(60));

    // Simular un escenario donde el modelo principal tiene baja confiabilidad
    console.log('📊 Simulando baja confiabilidad en modelo Mixtral...');
    
    // Simular varios usos fallidos
    for (let i = 0; i < 8; i++) {
        modelOptimizer.recordModelUsage('mixtral-8x7b-32768', false, 8000, 0);
    }

    // Simular algunos usos exitosos pero bajos
    for (let i = 0; i < 2; i++) {
        modelOptimizer.recordModelUsage('mixtral-8x7b-32768', true, 7500, 0.70);
    }

    const fallbackConfig = await modelOptimizer.getOptimalConfiguration({
        documentType: 'legal',
        ocrConfidence: 70,
        strategy: 'auto'
    });

    console.log('\n🔄 Configuración con Fallback:');
    if (fallbackConfig.fallback_reason) {
        console.log(`⚠️ Fallback activado: ${fallbackConfig.fallback_reason}`);
        console.log(`🎯 Modelo original: ${fallbackConfig.original_model.name}`);
        console.log(`🔄 Modelo alternativo: ${fallbackConfig.model.name}`);
    } else {
        console.log(`✅ Modelo principal estable: ${fallbackConfig.model.name}`);
    }

    // 7. Resumen y recomendaciones finales
    console.log('\n\n🎯 RESUMEN DE LA DEMOSTRACIÓN');
    console.log('=' .repeat(60));

    console.log('\n✅ Características Demostradas:');
    console.log('   🎯 Selección automática inteligente de modelos');
    console.log('   📊 Optimización basada en calidad OCR');
    console.log('   🔄 Procesamiento eficiente por lotes');
    console.log('   ⚙️ Ajuste dinámico de parámetros');
    console.log('   📈 Monitoreo de rendimiento en tiempo real');
    console.log('   🔄 Sistema de fallback automático');
    console.log('   🎛️ Múltiples estrategias de selección');

    console.log('\n🏆 Modelos Recomendados por Caso de Uso:');
    console.log('   📊 Empresarial: Llama 3.3 70B Versatile');
    console.log('   ⚖️ Legal/Médico: Mixtral 8x7B + Chutes OCR');
    console.log('   🚀 Alta Velocidad: Llama 3.1 8B Instant');
    console.log('   🔍 OCR Mejorado: Llama 3.3 70B + Chutes Specialist');

    console.log('\n🎯 Mejores Prácticas:');
    console.log('   ✅ Usar estrategia automática para la mayoría de casos');
    console.log('   ✅ Monitorear métricas de rendimiento regularmente');
    console.log('   ✅ Ajustar parámetros según tipo de documento');
    console.log('   ✅ Utilizar procesamiento por lotes para múltiples archivos');
    console.log('   ✅ Configurar umbrales de confianza OCR apropiados');

    console.log('\n🚀 El optimizador está listo para producción!');
    console.log('=' .repeat(60));
}

// Función para demostrar integración con API
async function demonstrateAPIIntegration() {
    console.log('\n\n🌐 DEMOSTRACIÓN DE INTEGRACIÓN CON API');
    console.log('=' .repeat(60));

    const axios = require('axios');
    const BASE_URL = 'http://localhost:3000';

    try {
        // Verificar estado de APIs
        console.log('🔍 Verificando estado de APIs...');
        const aiStatus = await axios.get(`${BASE_URL}/api/ai-status`);
        console.log('✅ APIs disponibles:', Object.keys(aiStatus.data.apis).filter(key => aiStatus.data.apis[key]));

        // Obtener recomendación de modelo
        console.log('\n🎯 Obteniendo recomendación de modelo...');
        const modelRecommendation = await axios.get(`${BASE_URL}/api/best-ocr-model`, {
            params: {
                documentType: 'business',
                ocrConfidence: 75,
                strategy: 'auto'
            }
        });

        console.log('📊 Modelo recomendado:', modelRecommendation.data.optimal_model.name);
        console.log('💡 Razón:', modelRecommendation.data.reasoning);

        // Comparar modelos
        console.log('\n🔄 Comparando modelos...');
        const comparison = await axios.get(`${BASE_URL}/api/model-comparison`, {
            params: {
                documentType: 'legal',
                ocrConfidence: 70
            }
        });

        console.log('📈 Estrategias comparadas:');
        Object.entries(comparison.data.strategies).forEach(([strategy, info]) => {
            console.log(`   ${strategy}: ${info.model} (${info.reasoning})`);
        });

        console.log('\n✅ Integración API exitosa');

    } catch (error) {
        console.log('⚠️ Error en integración API (asegúrate que el servidor esté corriendo)');
        console.log('   Inicia el servidor con: npm start');
    }
}

// Ejecutar demostración
if (require.main === module) {
    demonstrateModelOptimizer()
        .then(() => demonstrateAPIIntegration())
        .catch(console.error);
}

module.exports = {
    demonstrateModelOptimizer,
    demonstrateAPIIntegration
};