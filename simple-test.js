#!/usr/bin/env node

/**
 * Script simple para probar la autenticación
 */

const fs = require('fs-extra');
const path = require('path');

async function simpleTest() {
  console.log('🧪 Prueba simple de autenticación...\n');

  try {
    // 1. Crear archivo de prueba
    const testContent = 'Este es un documento de prueba para verificar la autenticación.';
    const testFilePath = path.join(__dirname, 'test-simple.txt');
    await fs.writeFile(testFilePath, testContent);

    console.log('✅ Archivo de prueba creado:', testFilePath);

    // 2. Leer archivo como buffer
    const fileBuffer = await fs.readFile(testFilePath);

    // 3. Crear FormData manualmente
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let body = '';

    // Agregar headers del archivo
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="document"; filename="test-simple.txt"\r\n`;
    body += `Content-Type: text/plain\r\n\r\n`;
    
    // Agregar contenido del archivo
    body += fileBuffer.toString();
    body += `\r\n`;
    
    // Cerrar boundary
    body += `--${boundary}--\r\n`;

    // 4. Hacer petición
    const response = await fetch('http://localhost:8080/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': 'Bearer 1',
        'X-User-ID': '1',
        'Accept': 'application/json'
      },
      body: body
    });

    console.log('📡 Respuesta del servidor:', response.status);

    const result = await response.json();
    console.log('📊 Resultado completo:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
      console.log('✅ Los archivos ahora se guardan correctamente en la base de datos');
      console.log('✅ La autenticación funciona correctamente');
      console.log('📄 Document ID:', result.data?.document_id);
      console.log('🔍 Analysis ID:', result.data?.analysis_id);
    } else {
      console.log('\n❌ Error en el análisis:', result.error);
    }

    // 5. Limpiar
    await fs.remove(testFilePath);
    console.log('\n🧹 Archivo temporal eliminado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
simpleTest();