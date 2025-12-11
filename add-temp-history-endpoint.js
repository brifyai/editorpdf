const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTempHistoryEndpoint() {
  try {
    console.log('🔧 Agregando endpoint temporal de historial...');

    // Crear endpoint temporal en el servidor principal
    const endpointCode = `
      // ENDPOINT TEMPORAL PARA HISTORIAL SIN AUTENTICACIÓN
      app.get('/api/temp/history', async (req, res) => {
        try {
          console.log('📋 Obteniendo historial temporal...');
          
          const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .order('uploaded_at', { ascending: false })
            .limit(50);
          
          if (error) {
            console.error('❌ Error:', error.message);
            return res.status(500).json({
              success: false,
              error: error.message,
              analyses: []
            });
          }
          
          console.log(\`✅ Encontrados \${documents?.length || 0} documentos\`);
          
          // Formatear respuesta para el frontend
          const analyses = (documents || []).map(doc => ({
            id: doc.id,
            filename: doc.original_filename,
            fileType: doc.file_type,
            uploadedAt: doc.uploaded_at,
            processingStatus: doc.processing_status,
            fileSize: doc.file_size_bytes,
            storageUrl: doc.file_path,
            metadata: doc.metadata || {},
            // Campos adicionales para compatibilidad con el frontend
            analysis: {
              statistics: doc.metadata?.analysis_results || {},
              advanced: doc.metadata?.advanced_results || {},
              aiAnalysis: doc.metadata?.ai_results || {}
            },
            processingTime: doc.metadata?.processing_time_ms || 0,
            confidenceScore: doc.metadata?.confidence_score || 0
          }));
          
          res.json({
            success: true,
            analyses: analyses,
            total: analyses.length,
            user_id: 'temp',
            message: 'Historial temporal (sin autenticación)'
          });
          
        } catch (err) {
          console.error('❌ Error general:', err.message);
          res.status(500).json({
            success: false,
            error: err.message,
            analyses: []
          });
        }
      });
    `;

    // Leer el archivo server.js actual
    const fs = require('fs');
    const serverPath = './server.js';
    
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Verificar si el endpoint ya existe
    if (serverContent.includes('/api/temp/history')) {
      console.log('ℹ️  El endpoint temporal ya existe');
      return;
    }
    
    // Agregar el endpoint antes del manejo de errores
    const insertPoint = serverContent.indexOf('// =====================================================');
    if (insertPoint !== -1) {
      serverContent = serverContent.substring(0, insertPoint) + 
                     endpointCode + '\n\n' + 
                     serverContent.substring(insertPoint);
      
      // Escribir el archivo actualizado
      fs.writeFileSync(serverPath, serverContent);
      console.log('✅ Endpoint temporal agregado a server.js');
    } else {
      console.log('⚠️  No se pudo encontrar el punto de inserción');
    }

    console.log('🎉 ¡Endpoint temporal agregado exitosamente!');
    console.log('💡 Reinicia el servidor para usar el nuevo endpoint');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
addTempHistoryEndpoint();