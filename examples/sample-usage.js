// Ejemplo de uso de la API de Document Analyzer
// Este archivo muestra cómo utilizar los analizadores programáticamente

const pdfAnalyzer = require('../src/parsers/pdfAnalyzer');
const pptxAnalyzer = require('../src/parsers/pptxAnalyzer');
const advancedAnalyzer = require('../src/advanced/advancedAnalyzer');
const fs = require('fs-extra');
const path = require('path');

async function demonstrateAnalysis() {
    console.log('🚀 Iniciando demostración de Document Analyzer\n');

    try {
        // Ejemplo 1: Análisis de PDF
        console.log('📄 Ejemplo 1: Análisis de PDF');
        console.log('=' .repeat(50));
        
        // Nota: Necesitas tener un archivo PDF de prueba en examples/sample.pdf
        const pdfPath = path.join(__dirname, 'sample.pdf');
        
        if (await fs.pathExists(pdfPath)) {
            const pdfAnalysis = await pdfAnalyzer.analyzePDF(pdfPath);
            
            console.log('📊 Estadísticas del PDF:');
            console.log(`   - Páginas: ${pdfAnalysis.statistics.totalPages}`);
            console.log(`   - Palabras: ${pdfAnalysis.statistics.totalWords.toLocaleString()}`);
            console.log(`   - Caracteres: ${pdfAnalysis.statistics.totalCharacters.toLocaleString()}`);
            console.log(`   - Tamaño: ${pdfAnalysis.statistics.fileSize.mb} MB`);
            
            console.log('\n🧠 Análisis Avanzado:');
            console.log(`   - Puntaje de legibilidad: ${pdfAnalysis.advanced.readabilityScore}/100`);
            console.log(`   - Idioma detectado: ${pdfAnalysis.advanced.language}`);
            console.log(`   - Tipo de documento: ${pdfAnalysis.advanced.classification.type}`);
            console.log(`   - Confianza: ${pdfAnalysis.advanced.classification.confidence}%`);
            
            console.log('\n💭 Análisis de Sentimiento:');
            const sentiment = pdfAnalysis.advanced.sentiment;
            console.log(`   - Dominante: ${sentiment.dominant}`);
            console.log(`   - Positivo: ${sentiment.positive}%`);
            console.log(`   - Negativo: ${sentiment.negative}%`);
            console.log(`   - Neutral: ${sentiment.neutral}%`);
            
        } else {
            console.log('⚠️  No se encontró sample.pdf. Agrega un archivo PDF para probar.');
        }

        console.log('\n');

        // Ejemplo 2: Análisis de PPTX
        console.log('📊 Ejemplo 2: Análisis de Presentación PPTX');
        console.log('=' .repeat(50));
        
        const pptxPath = path.join(__dirname, 'sample.pptx');
        
        if (await fs.pathExists(pptxPath)) {
            const pptxAnalysis = await pptxAnalyzer.analyzePPTX(pptxPath);
            
            console.log('📊 Estadísticas de la Presentación:');
            console.log(`   - Diapositivas: ${pptxAnalysis.statistics.totalSlides}`);
            console.log(`   - Palabras: ${pptxAnalysis.statistics.totalWords.toLocaleString()}`);
            console.log(`   - Promedio por diapositiva: ${pptxAnalysis.statistics.averageWordsPerSlide}`);
            
            console.log('\n🎯 Estructura de la Presentación:');
            console.log(`   - Tiene diapositivas de título: ${pptxAnalysis.structure.hasTitleSlides ? 'Sí' : 'No'}`);
            console.log(`   - Tiene viñetas: ${pptxAnalysis.structure.hasBulletPoints ? 'Sí' : 'No'}`);
            console.log(`   - Tiene tablas: ${pptxAnalysis.structure.hasTables ? 'Sí' : 'No'}`);
            
            console.log('\n📝 Títulos de Diapositivas:');
            pptxAnalysis.presentation.slideTitles.slice(0, 5).forEach((title, index) => {
                console.log(`   ${index + 1}. ${title}`);
            });
            
        } else {
            console.log('⚠️  No se encontró sample.pptx. Agrega un archivo PPTX para probar.');
        }

        console.log('\n');

        // Ejemplo 3: Análisis de texto directo
        console.log('🔍 Ejemplo 3: Análisis Directo de Texto');
        console.log('=' .repeat(50));
        
        const sampleText = `
            Este es un informe de análisis de mercado sobre las tendencias tecnológicas 
            en el sector financiero. Los resultados muestran un crecimiento significativo 
            en la adopción de tecnologías blockchain y inteligencia artificial. 
            
            El análisis revela que las empresas están invirtiendo un 45% más en 
            transformación digital comparado con el año anterior. Sin embargo, 
            los desafíos en ciberseguridad siguen siendo una preocupación principal.
            
            Para más información, contacte a juan.perez@empresa.com o visite 
            https://www.empresa.com/analisis. La fecha límite para comentarios es 
            15/12/2023.
        `;
        
        console.log('📝 Texto de ejemplo:');
        console.log(sampleText.trim());
        
        console.log('\n🧠 Análisis Avanzado del Texto:');
        const textAnalysis = advancedAnalyzer.performCompleteAnalysis(sampleText, 'text');
        
        console.log(`   - Sentimiento dominante: ${textAnalysis.sentiment.dominant}`);
        console.log(`   - Complejidad: ${textAnalysis.complexity.difficulty}`);
        console.log(`   - Nivel educativo: ${textAnalysis.complexity.educationLevel}`);
        console.log(`   - Tipo de documento: ${textAnalysis.classification.type}`);
        
        console.log('\n📋 Entidades Encontradas:');
        console.log(`   - Emails: ${textAnalysis.entities.emails.join(', ')}`);
        console.log(`   - URLs: ${textAnalysis.entities.urls.join(', ')}`);
        console.log(`   - Fechas: ${textAnalysis.entities.dates.join(', ')}`);
        
        console.log('\n📄 Resumen Automático:');
        console.log(`   ${textAnalysis.summary.summary}`);
        
        console.log('\n🎯 Originalidad:');
        console.log(`   - Puntaje: ${textAnalysis.originality.originalityScore}%`);
        console.log(`   - Nivel de riesgo: ${textAnalysis.originality.riskLevel}`);

        console.log('\n');

        // Ejemplo 4: Guardar resultados
        console.log('💾 Ejemplo 4: Guardar Resultados');
        console.log('=' .repeat(50));
        
        const results = {
            timestamp: new Date().toISOString(),
            textAnalysis: textAnalysis,
            sampleInfo: {
                textLength: sampleText.length,
                wordCount: sampleText.split(/\s+/).length,
                characterCount: sampleText.length
            }
        };
        
        const outputPath = path.join(__dirname, 'analysis-results.json');
        await fs.writeJson(outputPath, results, { spaces: 2 });
        
        console.log(`✅ Resultados guardados en: ${outputPath}`);
        console.log(`📊 Tamaño del archivo: ${(await fs.stat(outputPath)).size} bytes`);

    } catch (error) {
        console.error('❌ Error en la demostración:', error.message);
    }
}

// Función para crear archivos de ejemplo
async function createSampleFiles() {
    console.log('📁 Creando archivos de ejemplo...');
    
    // Crear directorio examples si no existe
    await fs.ensureDir(__dirname);
    
    // Crear un archivo de texto de ejemplo
    const sampleTextContent = `
INFORME DE ANÁLISIS DE MERCADO
==============================

Resumen Ejecutivo
-----------------
El presente informe analiza las tendencias del mercado tecnológico durante el período 2023-2024. 
Los resultados indican un crecimiento sostenido en la adopción de soluciones digitales.

Análisis Detallado
------------------
1. Tendencias de Mercado
   - Crecimiento del 45% en IA
   - Adopción de blockchain: +30%
   - Ciberseguridad: Prioridad máxima

2. Inversiones
   - Total invertido: $2.5M
   - ROI proyectado: 25%
   - Período de recuperación: 18 meses

Conclusiones
------------
El mercado muestra señales positivas para la inversión tecnológica. 
Se recomienda continuar con la estrategia actual de digitalización.

Contacto
--------
Email: contacto@empresa.com
Web: https://www.empresa.com
Tel: +1-555-0123
Fecha: 07/12/2023
    `;
    
    await fs.writeFile(path.join(__dirname, 'sample-text.txt'), sampleTextContent);
    console.log('✅ Archivo sample-text.txt creado');
    
    console.log('\n📝 Nota: Para pruebas completas, agrega archivos PDF y PPTX reales:');
    console.log('   - sample.pdf (cualquier documento PDF)');
    console.log('   - sample.pptx (cualquier presentación PowerPoint)');
}

// Ejecutar demostración
if (require.main === module) {
    (async () => {
        await createSampleFiles();
        console.log('\n');
        await demonstrateAnalysis();
        console.log('\n🎉 Demostración completada!');
    })();
}

module.exports = {
    demonstrateAnalysis,
    createSampleFiles
};