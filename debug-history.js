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

async function debugHistory() {
  try {
    console.log('🔍 Diagnosticando historial de análisis...');

    // 1. Verificar tablas existentes
    console.log('\n📋 Verificando tablas en la base de datos...');
    
    const tables = ['documents', 'analysis_results', 'basic_analysis_results', 'advanced_analysis_results'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(5);
        
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: ${data?.length || 0} registros`);
        }
      } catch (err) {
        console.log(`❌ Error verificando tabla ${table}:`, err.message);
      }
    }

    // 2. Verificar documentos con y sin user_int_id
    console.log('\n📄 Verificando documentos...');
    
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.log('❌ Error obteniendo documentos:', error.message);
      } else {
        console.log(`📊 Total de documentos: ${documents?.length || 0}`);
        
        if (documents && documents.length > 0) {
          console.log('\n📋 Últimos documentos:');
          documents.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.original_filename} (user_int_id: ${doc.user_int_id}, status: ${doc.processing_status})`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error verificando documentos:', err.message);
    }

    // 3. Verificar análisis
    console.log('\n🔬 Verificando análisis...');
    
    try {
      const { data: analyses, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          documents (
            original_filename,
            user_int_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.log('❌ Error obteniendo análisis:', error.message);
      } else {
        console.log(`📊 Total de análisis: ${analyses?.length || 0}`);
        
        if (analyses && analyses.length > 0) {
          console.log('\n📋 Últimos análisis:');
          analyses.forEach((analysis, index) => {
            console.log(`${index + 1}. ${analysis.documents?.original_filename} (tipo: ${analysis.analysis_type}, usuario: ${analysis.user_int_id})`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error verificando análisis:', err.message);
    }

    // 4. Crear endpoint temporal para ver historial sin autenticación
    console.log('\n🌐 Creando endpoint temporal...');
    
    const app = express();
    app.use(express.json());
    
    // Endpoint temporal para ver historial sin autenticación
    app.get('/debug/history', async (req, res) => {
      try {
        console.log('🔍 Obteniendo historial sin autenticación...');
        
        const { data: documents, error } = await supabase
          .from('documents')
          .select(`
            *,
            analysis_results (
              id,
              analysis_type,
              status,
              created_at,
              processing_time_ms
            )
          `)
          .order('uploaded_at', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('❌ Error:', error.message);
          return res.status(500).json({
            success: false,
            error: error.message,
            data: null
          });
        }
        
        console.log(`✅ Encontrados ${documents?.length || 0} documentos`);
        
        res.json({
          success: true,
          data: documents || [],
          total: documents?.length || 0,
          message: 'Historial obtenido sin autenticación (solo para debugging)'
        });
        
      } catch (err) {
        console.error('❌ Error general:', err.message);
        res.status(500).json({
          success: false,
          error: err.message,
          data: null
        });
      }
    });
    
    const PORT = 8081;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de debug corriendo en http://localhost:${PORT}`);
      console.log(`📋 Endpoint de historial: http://localhost:${PORT}/debug/history`);
      console.log(`💡 Usa este endpoint para ver el historial sin autenticación`);
    });

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar debug
debugHistory();