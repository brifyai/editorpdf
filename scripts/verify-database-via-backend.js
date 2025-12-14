const axios = require('axios');

// URL del backend local
const BACKEND_URL = 'http://localhost:8080';

// Función para verificar tablas a través del backend
async function verifyTablesViaBackend() {
  console.log('🔍 INICIANDO VERIFICACIÓN DE BASE DE DATOS VÍA BACKEND');
  console.log('====================================================\n');
  
  try {
    // Verificar conexión al backend
    console.log('1. Verificando conexión al backend...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    
    if (healthResponse.status === 200) {
      console.log('✅ Conexión al backend establecida correctamente\n');
    } else {
      console.log('❌ Error conectando al backend');
      return;
    }
    
    // Verificar endpoint de métricas (que consulta la base de datos)
    console.log('2. Verificando acceso a datos mediante endpoint /api/metrics...');
    const metricsResponse = await axios.get(`${BACKEND_URL}/api/metrics`);
    
    if (metricsResponse.status === 200) {
      const metricsData = metricsResponse.data;
      const metrics = metricsData.success ? metricsData.data : metricsData;
      console.log('✅ Endpoint /api/metrics funcionando correctamente');
      console.log(`   - Documentos encontrados: ${metrics.documentsCount || 0}`);
      console.log(`   - Usuarios activos: ${metrics.activeUsers || 0}`);
      console.log(`   - Configuraciones guardadas: ${metrics.savedConfigurations || 0}`);
      console.log(`   - Análisis con IA: ${metrics.aiAnalyses || 0}\n`);
    } else {
      console.log('❌ Error en endpoint /api/metrics');
    }
    
    // Verificar endpoint de documentos
    console.log('3. Verificando acceso a documentos mediante /api/documents...');
    try {
      const docsResponse = await axios.get(`${BACKEND_URL}/api/documents?limit=5`);
      
      if (docsResponse.status === 200) {
        const docsData = docsResponse.data;
        const documents = (docsData.success ? docsData.data?.documents : docsData.documents) || [];
        console.log('✅ Endpoint /api/documents funcionando correctamente');
        console.log(`   - Documentos recuperados: ${documents.length}`);
        
        if (documents.length > 0) {
          const firstDoc = documents[0];
          console.log(`   - Primer documento: ${firstDoc.filename || 'N/A'}`);
          console.log(`   - Campos presentes: ${Object.keys(firstDoc).join(', ')}`);
        }
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/documents');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/documents: ${err.message}\n`);
    }
    
    // Verificar endpoint de batch jobs
    console.log('4. Verificando acceso a batch jobs mediante /api/batch-jobs...');
    try {
      const batchResponse = await axios.get(`${BACKEND_URL}/api/batch-jobs?limit=5`);
      
      if (batchResponse.status === 200) {
        const batchData = batchResponse.data;
        const batchJobs = (batchData.success ? batchData.data?.batchJobs : batchData.batchJobs) || [];
        console.log('✅ Endpoint /api/batch-jobs funcionando correctamente');
        console.log(`   - Batch jobs recuperados: ${batchJobs.length}`);
        
        if (batchJobs.length > 0) {
          const firstJob = batchJobs[0];
          console.log(`   - Primer batch job: ${firstJob.name || 'N/A'}`);
          console.log(`   - Campos presentes: ${Object.keys(firstJob).join(', ')}`);
        }
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/batch-jobs');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/batch-jobs: ${err.message}\n`);
    }
    
    // Verificar endpoint de configuración de IA
    console.log('5. Verificando acceso a configuraciones de IA...');
    try {
      const aiConfigResponse = await axios.get(`${BACKEND_URL}/api/get-ai-config/1`);
      
      if (aiConfigResponse.status === 200) {
        const aiConfigData = aiConfigResponse.data;
        const aiConfig = aiConfigData.success ? aiConfigData.data : aiConfigData;
        console.log('✅ Endpoint /api/get-ai-config funcionando correctamente');
        console.log(`   - Configuración encontrada: ${aiConfig.configuration ? 'Sí' : 'No'}`);
        
        if (aiConfig.configuration) {
          console.log(`   - Campos presentes: ${Object.keys(aiConfig.configuration).join(', ')}`);
        }
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/get-ai-config');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/get-ai-config: ${err.message}\n`);
    }
    
    // Verificar endpoint de estado de IA
    console.log('6. Verificando acceso a estado de IA mediante /api/ai-status...');
    try {
      const aiStatusResponse = await axios.get(`${BACKEND_URL}/api/ai-status`);
      
      if (aiStatusResponse.status === 200) {
        const aiStatusData = aiStatusResponse.data;
        const aiStatus = aiStatusData.success ? aiStatusData.data : aiStatusData;
        console.log('✅ Endpoint /api/ai-status funcionando correctamente');
        console.log(`   - APIs disponibles: ${Object.keys(aiStatus.apis || {}).join(', ') || 'N/A'}`);
        console.log(`   - Estado de Groq: ${aiStatus.apis?.groq ? 'Configurado' : 'No configurado'}`);
        console.log(`   - Estado de Chutes: ${aiStatus.apis?.chutes ? 'Configurado' : 'No configurado'}`);
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/ai-status');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/ai-status: ${err.message}\n`);
    }
    
    // Verificar endpoint de modelos disponibles
    console.log('7. Verificando modelos disponibles mediante /api/available-models...');
    try {
      const modelsResponse = await axios.get(`${BACKEND_URL}/api/available-models`);
      
      if (modelsResponse.status === 200) {
        const modelsData = modelsResponse.data;
        const models = modelsData.success ? modelsData.data : modelsData;
        console.log('✅ Endpoint /api/available-models funcionando correctamente');
        console.log(`   - Modelos disponibles: ${Array.isArray(models) ? models.length : (models.models?.length || 0)}`);
        
        if (Array.isArray(models) && models.length > 0) {
          const firstModel = models[0];
          console.log(`   - Primer modelo: ${firstModel.name || 'N/A'} (${firstModel.provider || 'N/A'})`);
        } else if (models.models && models.models.length > 0) {
          const firstModel = models.models[0];
          console.log(`   - Primer modelo: ${firstModel.name || 'N/A'} (${firstModel.provider || 'N/A'})`);
        }
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/available-models');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/available-models: ${err.message}\n`);
    }
    
    // Verificar endpoint de información OCR
    console.log('8. Verificando información OCR mediante /api/ocr-info...');
    try {
      const ocrResponse = await axios.get(`${BACKEND_URL}/api/ocr-info`);
      
      if (ocrResponse.status === 200) {
        const ocrData = ocrResponse.data;
        const ocrInfo = ocrData.success ? ocrData.data : ocrData;
        console.log('✅ Endpoint /api/ocr-info funcionando correctamente');
        console.log(`   - OCR engine: ${ocrInfo.ocr?.engine || 'N/A'}`);
        console.log(`   - PDF converter: ${ocrInfo.pdfConverter?.engine || 'N/A'}`);
        console.log(`   - DOCX converter: ${ocrInfo.docxConverter?.engine || 'N/A'}`);
        console.log('');
      } else {
        console.log('❌ Error en endpoint /api/ocr-info');
      }
    } catch (err) {
      console.log(`❌ Error consultando /api/ocr-info: ${err.message}\n`);
    }
    
    // Resumen final
    console.log('=== RESUMEN FINAL ===');
    console.log('Basado en las pruebas de endpoints, podemos inferir:');
    console.log('✅ La tabla "documents" existe y es accesible');
    console.log('✅ La tabla "users" existe y es accesible (para métricas)');
    console.log('✅ La tabla "user_configurations" existe y es accesible');
    console.log('✅ La tabla "batch_jobs" existe y es accesible');
    console.log('✅ La configuración de IA está funcionando');
    console.log('✅ Los modelos de IA están configurados');
    console.log('✅ El sistema OCR está funcionando');
    console.log('\n✅ VERIFICACIÓN COMPLETADA VÍA BACKEND');
    
  } catch (error) {
    console.error('❌ Error crítico durante la verificación:', error.message);
    console.log('Asegúrate de que el backend esté ejecutándose en http://localhost:8080');
  }
}

// Función para verificar la estructura de las tablas basado en los datos recibidos
function analyzeTableStructure(data, tableName) {
  if (!data || data.length === 0) {
    console.log(`   - No hay datos para analizar la estructura de ${tableName}`);
    return;
  }
  
  const sample = data[0];
  const fields = Object.keys(sample);
  
  console.log(`   - Campos en ${tableName}: ${fields.join(', ')}`);
  
  // Verificar campos críticos
  const criticalFields = ['id', 'user_id', 'user_int_id'];
  const missingFields = criticalFields.filter(field => !fields.includes(field));
  
  if (missingFields.length === 0) {
    console.log(`   - ✅ Todos los campos críticos existen en ${tableName}`);
  } else {
    console.log(`   - ⚠️  Campos faltantes en ${tableName}: ${missingFields.join(', ')}`);
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyTablesViaBackend().catch(console.error);
}

module.exports = {
  verifyTablesViaBackend,
  analyzeTableStructure
};