#!/usr/bin/env node

/**
 * Script de prueba para verificar que la autenticación funciona correctamente
 * y que los archivos se guardan en la base de datos
 */

const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');

async function testAuthenticationFix() {
  console.log('🧪 Probando corrección de autenticación...\n');

  try {
    // 1. Crear archivo de prueba
    const testContent = 'Este es un documento de prueba para verificar la autenticación.';
    const testFilePath = path.join(__dirname, 'test-document.txt');
    await fs.writeFile(testFilePath, testContent);

    console.log('✅ Archivo de prueba creado:', testFilePath);

    // 2. Crear FormData para la petición
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath), {
      filename: 'test-document.txt',
      contentType: 'text/plain'
    });

    // 3. Hacer petición con autenticación
    const response = await fetch('http://localhost:8080/api/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer 1',
        'X-User-ID': '1',
        'Accept': 'application/json'
      }
    });

    console.log('📡 Respuesta del servidor:', response.status);

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Análisis exitoso');
      console.log('📊 Datos guardados en base de datos:', result.data?.database_saved);
      console.log('📄 Document ID:', result.data?.document_id);
      console.log('🔍 Analysis ID:', result.data?.analysis_id);
      
      if (result.data?.database_saved) {
        console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
        console.log('✅ Los archivos ahora se guardan correctamente en la base de datos');
        console.log('✅ La autenticación funciona correctamente');
      } else {
        console.log('\n❌ PROBLEMA: El análisis fue exitoso pero no se guardó en la base de datos');
        console.log('🔍 Error de base de datos:', result.data?.database_error);
      }
    } else {
      console.log('❌ Error en el análisis:', result.error);
    }

    // 4. Limpiar archivo temporal
    await fs.remove(testFilePath);
    console.log('\n🧹 Archivo temporal eliminado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testAuthenticationFix();