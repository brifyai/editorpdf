// Demostración de capacidades de IA de Document Analyzer
// Este archivo muestra cómo usar las APIs de IA para análisis avanzado

const aiAnalyzer = require('../src/ai/aiAnalyzer');

async function demonstrateAICapabilities() {
    console.log('🤖 Demostración de Análisis con IA\n');
    
    try {
        // Verificar disponibilidad de APIs
        console.log('📡 Verificando APIs de IA...');
        const apiStatus = await aiAnalyzer.checkAPIsAvailability();
        console.log('Estado de APIs:', apiStatus);
        
        if (!apiStatus.groq && !apiStatus.chutes) {
            console.log('⚠️  Las APIs de IA no están configuradas. Usando análisis de respaldo.\n');
            console.log('📚 Para configurar las APIs, consulta: docs/ai-setup-guide.md\n');
        }
        
        // Texto de ejemplo para análisis
        const sampleText = `
        INFORME EJECUTIVO - ANÁLISIS DE MERCADO TECNOLÓGICO 2024
        
        Resumen General:
        El mercado tecnológico global experimentó un crecimiento sin precedentes durante 2024, 
        impulsado principalmente por la adopción masiva de inteligencia artificial y 
        tecnologías de nube. Las empresas que invirtieron en transformación digital 
        reportaron un aumento promedio del 45% en productividad.
        
        Análisis Detallado:
        1. Inteligencia Artificial: El sector de IA creció un 78% interanual, con 
           inversiones superando los $150 mil millones a nivel global.
        
        2. Computación en la Nube: La adopción de servicios cloud aumentó 32%, 
           con AWS, Azure y Google Cloud dominando el mercado.
        
        3. Ciberseguridad: Las inversiones en seguridad crecieron 25% debido al 
           aumento de amenazas digitales.
        
        Recomendaciones Estratégicas:
        - Las empresas deben priorizar la inversión en IA generativa
        - Es fundamental fortalecer las capacidades de ciberseguridad
        - La formación del talento técnico es crucial para el éxito
        
        Conclusiones:
        El panorama tecnológico presenta oportunidades sin precedentes para las 
        organizaciones que se adapten rápidamente a los cambios. La innovación 
        continua y la agilidad organizacional serán factores determinantes para 
        el éxito en el próximo quinquenio.
        
        Contacto:
        Email: analyst@techreport.com
        Web: https://www.techanalysis.com/2024-report
        Fecha: 15 de diciembre de 2024
        `;
        
        console.log('📄 Texto de ejemplo preparado para análisis...');
        console.log(`📊 Longitud: ${sampleText.length} caracteres\n`);
        
        // Realizar análisis con IA
        console.log('🧠 Iniciando análisis avanzado con IA...\n');
        
        const startTime = Date.now();
        const aiAnalysis = await aiAnalyzer.performCombinedAnalysis(
            sampleText, 
            'pdf', 
            { analysisType: 'balanced' }
        );
        const processingTime = Date.now() - startTime;
        
        console.log('⏱️  Tiempo de procesamiento:', processingTime, 'ms\n');
        
        // Mostrar resultados del análisis
        console.log('🎯 RESULTADOS DEL ANÁLISIS CON IA');
        console.log('=' .repeat(50));
        
        if (aiAnalysis.aiAnalysis) {
            const ai = aiAnalysis.aiAnalysis;
            
            console.log('\n📊 Análisis de Sentimiento:');
            console.log(`   Sentimiento: ${ai.sentiment.sentiment}`);
            console.log(`   Confianza: ${Math.round(ai.sentiment.confidence * 100)}%`);
            console.log(`   Tono: ${ai.sentiment.tone}`);
            console.log(`   Intensidad: ${Math.round(ai.sentiment.emotionalIntensity * 100)}%`);
            
            console.log('\n📋 Clasificación del Documento:');
            console.log(`   Categoría: ${ai.classification.primaryCategory}`);
            console.log(`   Audiencia: ${ai.classification.audience}`);
            console.log(`   Propósito: ${ai.classification.purpose}`);
            console.log(`   Complejidad: ${ai.classification.complexity}`);
            console.log(`   Industria: ${ai.classification.industry}`);
            
            console.log('\n📝 Resumen Generado por IA:');
            console.log(`   "${ai.summary.summary}"`);
            console.log(`   Palabras: ${ai.summary.wordCount} | Compresión: ${Math.round(ai.summary.compressionRatio)}x`);
            
            console.log('\n💡 Insights Clave:');
            ai.insights.mainPoints.forEach((point, index) => {
                console.log(`   ${index + 1}. ${point}`);
            });
            
            console.log('\n🎯 Hallazgos Importantes:');
            ai.insights.keyFindings.forEach((finding, index) => {
                console.log(`   • ${finding}`);
            });
            
            console.log('\n⚠️  Riesgos Identificados:');
            ai.insights.risks.forEach((risk, index) => {
                console.log(`   ${index + 1}. ${risk}`);
            });
            
            console.log('\n🚀 Oportunidades:');
            ai.insights.opportunities.forEach((opportunity, index) => {
                console.log(`   ${index + 1}. ${opportunity}`);
            });
            
            console.log('\n📈 Calidad del Documento:');
            console.log(`   Puntuación: ${ai.quality.overallScore}/10`);
            console.log(`   Claridad: ${ai.quality.clarity}/10`);
            console.log(`   Coherencia: ${ai.quality.coherence}/10`);
            console.log(`   Completitud: ${ai.quality.completeness}/10`);
            console.log(`   Calificación: ${ai.quality.grade}`);
            
            console.log('\n🔧 Recomendaciones:');
            ai.recommendations.improvements.forEach((improvement, index) => {
                console.log(`   ${index + 1}. ${improvement}`);
            });
            
            console.log('\n📚 Próximos Pasos:');
            ai.recommendations.nextSteps.forEach((step, index) => {
                console.log(`   ${index + 1}. ${step}`);
            });
        }
        
        // Mostrar información de procesamiento
        console.log('\n🔍 Información de Procesamiento:');
        console.log(`   Modelo utilizado: ${aiAnalysis.aiAnalysis?.model || 'N/A'}`);
        console.log(`   Tipo de análisis: ${aiAnalysis.aiAnalysis?.analysisType || 'N/A'}`);
        console.log(`   Longitud original: ${aiAnalysis.processingInfo?.textLength || 0} caracteres`);
        console.log(`   Longitud procesada: ${aiAnalysis.processingInfo?.truncatedLength || 0} caracteres`);
        console.log(`   APIs utilizadas: ${aiAnalysis.apisUsed?.join(', ') || 'Ninguna'}`);
        
        // Mostrar consenso si hay múltiples APIs
        if (aiAnalysis.combinedInsights) {
            console.log('\n🤝 Análisis Combinado:');
            console.log(`   Acuerdo de APIs: ${Math.round((aiAnalysis.combinedInsights.consensus?.agreement || 0) * 100)}%`);
        }
        
        console.log('\n✅ Análisis completado exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la demostración:', error.message);
        
        if (error.message.includes('API')) {
            console.log('\n💡 Para usar las APIs de IA:');
            console.log('   1. Obtén una API key en https://console.groq.com/');
            console.log('   2. Configura la variable GROQ_API_KEY');
            console.log('   3. Revisa la guía en docs/ai-setup-guide.md');
        }
    }
}

// Demostración de análisis sin IA (fallback)
async function demonstrateFallbackAnalysis() {
    console.log('\n🔄 Demostración de Análisis sin IA (Modo Respaldo)\n');
    
    const advancedAnalyzer = require('../src/advanced/advancedAnalyzer');
    
    const sampleText = `
    Este es un documento de prueba que demuestra las capacidades de análisis
    sin necesidad de APIs externas. El sistema puede realizar análisis básico
    de sentimiento, extracción de entidades y clasificación simple.
    
    Para más información, contacte a test@example.com o visite https://example.com.
    La fecha límite es 31/12/2024.
    `;
    
    const fallbackAnalysis = advancedAnalyzer.performCompleteAnalysis(sampleText, 'text');
    
    console.log('📊 Análisis de Respaldo Disponible:');
    console.log(`   Sentimiento: ${fallbackAnalysis.sentiment.dominant}`);
    console.log(`   Complejidad: ${fallbackAnalysis.complexity.difficulty}`);
    console.log(`   Tipo: ${fallbackAnalysis.classification.type}`);
    console.log(`   Emails: ${fallbackAnalysis.entities.emails.join(', ')}`);
    console.log(`   URLs: ${fallbackAnalysis.entities.urls.join(', ')}`);
    console.log(`   Fechas: ${fallbackAnalysis.entities.dates.join(', ')}`);
    console.log(`   Originalidad: ${fallbackAnalysis.originality.originalityScore}%`);
}

// Ejecutar demostración
if (require.main === module) {
    (async () => {
        await demonstrateAICapabilities();
        await demonstrateFallbackAnalysis();
        console.log('\n🎉 Demostración completada!');
    })();
}

module.exports = {
    demonstrateAICapabilities,
    demonstrateFallbackAnalysis
};