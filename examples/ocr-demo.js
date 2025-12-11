// Demostración de funcionalidades OCR de Document Analyzer
const OCRProcessor = require('../src/ocr/ocrProcessor');
const ImageToPDFConverter = require('../src/ocr/imageToPDFConverter');
const ImageToDocxConverter = require('../src/ocr/imageToDocxConverter');
const path = require('path');
const fs = require('fs');

async function runOCRDemo() {
    console.log('🚀 Iniciando Demo de Funcionalidades OCR\n');

    // Inicializar procesadores
    const ocrProcessor = new OCRProcessor();
    const pdfConverter = new ImageToPDFConverter();
    const docxConverter = new ImageToDocxConverter();

    try {
        // 1. Mostrar información de capacidades
        console.log('📋 Capacidades OCR:');
        console.log(JSON.stringify(ocrProcessor.getInfo(), null, 2));
        console.log('\n');

        // 2. Demo de OCR básico
        await demoBasicOCR(ocrProcessor);
        
        // 3. Demo de conversión a PDF
        await demoPDFConversion(pdfConverter);
        
        // 4. Demo de conversión a DOCX
        await demoDocxConversion(docxConverter);
        
        // 5. Demo de OCR estructurado
        await demoStructuredOCR(ocrProcessor);

    } catch (error) {
        console.error('❌ Error en demo:', error);
    } finally {
        // Limpiar recursos
        await ocrProcessor.cleanup();
        await pdfConverter.cleanup();
        await docxConverter.cleanup();
    }
}

async function demoBasicOCR(ocrProcessor) {
    console.log('🔍 Demo 1: OCR Básico');
    console.log('=====================');

    // Ruta de imagen de ejemplo (deberías tener una imagen de prueba)
    const imagePath = path.join(__dirname, '../test-images/sample-text.png');
    
    if (!fs.existsSync(imagePath)) {
        console.log('⚠️  No se encontró imagen de prueba. Creando una imagen de demo...');
        // Aquí podrías crear una imagen de prueba programáticamente
        console.log('💡 Para probar esta funcionalidad, agrega una imagen con texto en:');
        console.log('   test-images/sample-text.png');
        return;
    }

    try {
        console.log('📄 Procesando imagen:', imagePath);
        
        const result = await ocrProcessor.performOCR(imagePath, {
            language: 'spa+eng',
            preprocess: true,
            confidence: 60
        });

        console.log('✅ OCR completado exitosamente');
        console.log('📊 Estadísticas:');
        console.log(`   - Confianza: ${result.confidence.toFixed(2)}%`);
        console.log(`   - Palabras: ${result.pageStats.words}`);
        console.log(`   - Líneas: ${result.pageStats.lines}`);
        console.log(`   - Párrafos: ${result.pageStats.paragraphs}`);
        console.log('\n📝 Texto extraído (primeros 200 caracteres):');
        console.log(`   "${result.text.substring(0, 200)}..."`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error en OCR básico:', error.message);
    }
}

async function demoPDFConversion(pdfConverter) {
    console.log('📄 Demo 2: Conversión a PDF Editable');
    console.log('===================================');

    const imagePath = path.join(__dirname, '../test-images/sample-document.jpg');
    
    if (!fs.existsSync(imagePath)) {
        console.log('⚠️  No se encontró imagen para conversión PDF');
        console.log('💡 Agrega una imagen en: test-images/sample-document.jpg');
        return;
    }

    try {
        console.log('🔄 Convirtiendo imagen a PDF editable...');
        
        const result = await pdfConverter.convertToEditablePDF(imagePath, {
            includeOriginalImage: true,
            ocrLanguage: 'spa+eng',
            ocrOptions: {
                preprocess: true,
                confidence: 70
            }
        });

        console.log('✅ PDF generado exitosamente');
        console.log('📁 Archivo guardado en:', result.outputPath);
        console.log('📊 Estadísticas del PDF:');
        console.log(`   - Páginas: ${result.pdfStats.pages}`);
        console.log(`   - Tiene texto: ${result.pdfStats.hasText ? 'Sí' : 'No'}`);
        console.log(`   - Tiene imágenes: ${result.pdfStats.hasImages ? 'Sí' : 'No'}`);
        console.log(`   - Confianza OCR: ${result.pdfStats.confidence.toFixed(2)}%`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error en conversión PDF:', error.message);
    }
}

async function demoDocxConversion(docxConverter) {
    console.log('📝 Demo 3: Conversión a DOCX Editable');
    console.log('====================================');

    const imagePath = path.join(__dirname, '../test-images/sample-form.png');
    
    if (!fs.existsSync(imagePath)) {
        console.log('⚠️  No se encontró imagen para conversión DOCX');
        console.log('💡 Agrega una imagen en: test-images/sample-form.png');
        return;
    }

    try {
        console.log('🔄 Convirtiendo imagen a DOCX editable...');
        
        const result = await docxConverter.convertToEditableDocx(imagePath, {
            includeOriginalImage: true,
            formatting: 'professional',
            ocrLanguage: 'spa+eng',
            ocrOptions: {
                preprocess: true,
                confidence: 65
            }
        });

        console.log('✅ DOCX generado exitosamente');
        console.log('📁 Archivo guardado en:', result.outputPath);
        console.log('📊 Estadísticas del DOCX:');
        console.log(`   - Párrafos: ${result.docxStats.paragraphs}`);
        console.log(`   - Palabras: ${result.docxStats.words}`);
        console.log(`   - Líneas: ${result.docxStats.lines}`);
        console.log(`   - Formato: ${result.docxStats.formatting}`);
        console.log(`   - Confianza OCR: ${result.docxStats.confidence.toFixed(2)}%`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error en conversión DOCX:', error.message);
    }
}

async function demoStructuredOCR(ocrProcessor) {
    console.log('🏗️  Demo 4: OCR Estructurado');
    console.log('==========================');

    const imagePath = path.join(__dirname, '../test-images/sample-invoice.jpg');
    
    if (!fs.existsSync(imagePath)) {
        console.log('⚠️  No se encontró imagen para OCR estructurado');
        console.log('💡 Agrega una imagen de factura en: test-images/sample-invoice.jpg');
        return;
    }

    try {
        console.log('🔍 Realizando OCR estructurado para factura...');
        
        const result = await ocrProcessor.structuredOCR(imagePath, 'invoice');

        console.log('✅ OCR estructurado completado');
        console.log('📊 Datos extraídos:');
        
        if (result.structuredData.keyValues && Object.keys(result.structuredData.keyValues).length > 0) {
            console.log('   📋 Datos clave-valor:');
            for (const [key, value] of Object.entries(result.structuredData.keyValues)) {
                console.log(`      - ${key}: ${value}`);
            }
        }

        if (result.structuredData.dates && result.structuredData.dates.length > 0) {
            console.log('   📅 Fechas encontradas:');
            result.structuredData.dates.forEach(date => {
                console.log(`      - ${date}`);
            });
        }

        if (result.structuredData.emails && result.structuredData.emails.length > 0) {
            console.log('   📧 Emails encontrados:');
            result.structuredData.emails.forEach(email => {
                console.log(`      - ${email}`);
            });
        }

        if (result.structuredData.phones && result.structuredData.phones.length > 0) {
            console.log('   📞 Teléfonos encontrados:');
            result.structuredData.phones.forEach(phone => {
                console.log(`      - ${phone}`);
            });
        }

        console.log('\n');

    } catch (error) {
        console.error('❌ Error en OCR estructurado:', error.message);
    }
}

async function demoMultiLanguageOCR(ocrProcessor) {
    console.log('🌍 Demo 5: OCR Multi-idioma');
    console.log('=============================');

    const imagePath = path.join(__dirname, '../test-images/sample-multilang.png');
    
    if (!fs.existsSync(imagePath)) {
        console.log('⚠️  No se encontró imagen multi-idioma');
        console.log('💡 Agrega una imagen con texto en múltiples idiomas en: test-images/sample-multilang.png');
        return;
    }

    try {
        console.log('🔍 Detectando idioma automáticamente...');
        
        const result = await ocrProcessor.autoDetectOCR(imagePath);

        console.log('✅ Detección automática completada');
        console.log('🌍 Idioma detectado:', result.detectedLanguage);
        console.log('📊 Resultados por idioma:');
        
        for (const [lang, langResult] of Object.entries(result.allResults)) {
            if (langResult.error) {
                console.log(`   ❌ ${lang}: Error - ${langResult.error}`);
            } else {
                console.log(`   ✅ ${lang}: Confianza ${langResult.confidence.toFixed(2)}%`);
                console.log(`      Palabras: ${langResult.pageStats.words}`);
            }
        }

        console.log('🏆 Mejor resultado:');
        console.log(`   Idioma: ${result.bestResult.detectedLanguage}`);
        console.log(`   Confianza: ${result.bestResult.confidence.toFixed(2)}%`);
        console.log(`   Texto: "${result.bestResult.text.substring(0, 100)}..."`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error en OCR multi-idioma:', error.message);
    }
}

async function demoBatchConversion() {
    console.log('📦 Demo 6: Conversión por Lotes');
    console.log('===============================');

    const imageDir = path.join(__dirname, '../test-images');
    const imageFiles = fs.readdirSync(imageDir).filter(file => 
        ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'].includes(path.extname(file).toLowerCase())
    );

    if (imageFiles.length === 0) {
        console.log('⚠️  No se encontraron imágenes para procesar por lotes');
        console.log('💡 Agrega imágenes en el directorio: test-images/');
        return;
    }

    const imagePaths = imageFiles.map(file => path.join(imageDir, file));
    const pdfConverter = new ImageToPDFConverter();

    try {
        console.log(`🔄 Procesando ${imagePaths.length} imágenes...`);
        
        const result = await pdfConverter.convertMultipleToPDF(imagePaths, {
            combineIntoSingle: true,
            ocrLanguage: 'spa+eng'
        });

        console.log('✅ Conversión por lotes completada');
        console.log('📁 PDF combinado guardado en:', result.outputPath);
        console.log('📊 Estadísticas:');
        console.log(`   - Total imágenes: ${result.totalImages}`);
        console.log(`   - Tipo: ${result.type}`);
        
        if (result.results) {
            console.log('   - Resultados individuales:');
            result.results.forEach((item, index) => {
                console.log(`     ${index + 1}. ${item.imagePath}: ${item.ocrResult.confidence.toFixed(2)}% confianza`);
            });
        }
        console.log('\n');

    } catch (error) {
        console.error('❌ Error en conversión por lotes:', error.message);
    } finally {
        await pdfConverter.cleanup();
    }
}

// Función para crear directorio de pruebas si no existe
function setupTestEnvironment() {
    const testDir = path.join(__dirname, '../test-images');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
        console.log('📁 Directorio de pruebas creado:', testDir);
    }
}

// Ejecutar demo si se llama directamente
if (require.main === module) {
    setupTestEnvironment();
    runOCRDemo()
        .then(() => console.log('🎉 Demo completado exitosamente'))
        .catch(error => console.error('💥 Error fatal en demo:', error));
}

module.exports = {
    runOCRDemo,
    demoBasicOCR,
    demoPDFConversion,
    demoDocxConversion,
    demoStructuredOCR,
    demoMultiLanguageOCR,
    demoBatchConversion
};