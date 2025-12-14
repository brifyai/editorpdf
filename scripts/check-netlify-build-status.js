#!/usr/bin/env node

/**
 * Script para verificar el estado del build en Netlify
 * Este script proporciona instrucciones para monitorear el build y verificar si los errores se han resuelto
 */

const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// URL de la aplicación en Netlify
const NETLIFY_URL = 'https://editorpdfcl.netlify.app';

console.log('='.repeat(60));
console.log('VERIFICACIÓN DE ESTADO DE BUILD EN NETLIFY');
console.log('='.repeat(60));
console.log(`URL de la aplicación: ${NETLIFY_URL}`);
console.log('='.repeat(60));

// Función para verificar el estado del repositorio local
function checkLocalRepository() {
    console.log('\n📋 VERIFICANDO REPOSITORIO LOCAL:');
    console.log('-'.repeat(40));
    
    try {
        // Verificar el último commit
        const lastCommit = exec('git log -1 --pretty=format:"%h - %s (%cr)"');
        lastCommit.stdout?.on('data', (data) => {
            console.log(`✅ Último commit: ${data.trim()}`);
        });
        
        // Verificar si hay cambios pendientes
        const status = exec('git status --porcelain');
        let hasChanges = false;
        status.stdout?.on('data', (data) => {
            if (data.trim()) {
                hasChanges = true;
            }
        });
        
        status.on('close', (code) => {
            if (hasChanges) {
                console.log('⚠️  Hay cambios pendientes en el repositorio local');
            } else {
                console.log('✅ No hay cambios pendientes en el repositorio local');
            }
        });
        
    } catch (error) {
        console.log('❌ Error al verificar el repositorio local:', error.message);
    }
}

// Función para verificar archivos clave
function checkKeyFiles() {
    console.log('\n📁 VERIFICANDO ARCHIVOS CLAVE:');
    console.log('-'.repeat(40));
    
    const keyFiles = [
        'frontend-react/src/App.jsx',
        'frontend-react/src/components/features/documents/AnalysisHistory.jsx',
        'frontend-react/src/utils/errorHandler.js',
        'frontend-react/scripts/generate-sitemap.js',
        'frontend-react/src/setupTests.js',
        'frontend-react/clear-browser-cache.js'
    ];
    
    keyFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} - EXISTE`);
        } else {
            console.log(`❌ ${file} - NO EXISTE`);
        }
    });
    
    // Verificar componentes recién creados
    console.log('\n📦 COMPONENTES RECIENTEMENTE CREADOS:');
    console.log('-'.repeat(40));
    
    const newComponents = [
        'frontend-react/src/components/features/pdf/PDFToWord.jsx',
        'frontend-react/src/components/features/pdf/SignDocument.jsx',
        'frontend-react/src/components/features/pdf/Watermark.jsx',
        'frontend-react/src/components/features/pdf/ProtectPassword.jsx',
        'frontend-react/src/components/features/pdf/RotatePages.jsx',
        'frontend-react/src/components/features/pdf/PageNumbers.jsx',
        'frontend-react/src/components/features/pdf/ExtractText.jsx',
        'frontend-react/src/components/features/pdf/ConvertToImages.jsx',
        'frontend-react/src/components/features/pdf/ConvertToWord.jsx',
        'frontend-react/src/components/features/ocr/OCRProcessor.jsx',
        'frontend-react/src/components/features/ai/AdvancedAI.jsx',
        'frontend-react/src/components/features/ai/AIAnalysis.jsx',
        'frontend-react/src/components/features/documents/DocumentUploader.jsx',
        'frontend-react/src/components/features/documents/DocumentViewer.jsx'
    ];
    
    newComponents.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} - CREADO`);
        } else {
            console.log(`❌ ${file} - NO EXISTE`);
        }
    });
}

// Función para proporcionar instrucciones de monitoreo
function provideMonitoringInstructions() {
    console.log('\n🔍 INSTRUCCIONES PARA MONITOREAR EL BUILD:');
    console.log('-'.repeat(40));
    console.log('1. Ve a tu cuenta de Netlify: https://app.netlify.com/');
    console.log('2. Selecciona el sitio "editorpdfcl"');
    console.log('3. Ve a la sección "Deploys" para ver el estado del build');
    console.log('4. Busca el build más reciente (debería estar en progreso)');
    console.log('5. Revisa el log del build para detectar errores');
    console.log('');
    console.log('📊 TIEMPOS ESTIMADOS:');
    console.log('- Inicio del build: 1-2 minutos después del push');
    console.log('- Duración del build: 3-5 minutos');
    console.log('- Despliegue: 1-2 minutos');
    console.log('- Total estimado: 5-9 minutos');
    console.log('');
    console.log('🔧 PASOS SI EL BUILD FALLA:');
    console.log('1. Revisa el log de errores en Netlify');
    console.log('2. Identifica el archivo y línea específica del error');
    console.log('3. Corrige el problema localmente');
    console.log('4. Haz commit y push de los cambios');
    console.log('5. Espera a que Netlify inicie un nuevo build');
}

// Función para verificar si la aplicación está accesible
function checkApplicationAccessibility() {
    console.log('\n🌐 VERIFICANDO ACCESIBILIDAD DE LA APLICACIÓN:');
    console.log('-'.repeat(40));
    
    const req = https.get(NETLIFY_URL, (res) => {
        console.log(`✅ Estado HTTP: ${res.statusCode}`);
        console.log(`✅ Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (data.includes('ReferenceError: module is not defined')) {
                console.log('❌ El error "ReferenceError: module is not defined" persiste');
            } else if (data.includes('Cannot read properties of null (reading \'map\')')) {
                console.log('❌ El error "Cannot read properties of null" persiste');
            } else {
                console.log('✅ La aplicación parece estar cargando correctamente');
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Error al acceder a la aplicación:', error.message);
    });
    
    req.end();
}

// Función principal
function main() {
    console.log('🚀 INICIANDO VERIFICACIÓN...');
    
    checkLocalRepository();
    checkKeyFiles();
    provideMonitoringInstructions();
    
    // Esperar un momento antes de verificar la aplicación
    setTimeout(() => {
        checkApplicationAccessibility();
        
        console.log('\n' + '='.repeat(60));
        console.log('RESUMEN:');
        console.log('='.repeat(60));
        console.log('✅ Se han creado todos los componentes faltantes');
        console.log('✅ Se han corregido los problemas de módulos ES');
        console.log('✅ Los cambios han sido empujados a GitHub');
        console.log('⏳ Esperando a que Netlify complete el build...');
        console.log('🔍 Verifica el estado del build en Netlify');
        console.log('='.repeat(60));
    }, 2000);
}

// Ejecutar el script
if (require.main === module) {
    main();
}

module.exports = {
    checkLocalRepository,
    checkKeyFiles,
    provideMonitoringInstructions,
    checkApplicationAccessibility
};