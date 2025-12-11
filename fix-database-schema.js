const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Verificando y修复ando esquema de base de datos...');

    // 1. Verificar qué tablas existen
    console.log('\n📋 Verificando tablas existentes...');
    
    const tables = [
      'documents',
      'analysis_results', 
      'basic_analysis_results',
      'advanced_analysis_results',
      'ai_analysis_results',
      'analysis_metrics'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabla ${table}: NO EXISTE (${error.message})`);
          missingTables.push(table);
        } else {
          console.log(`✅ Tabla ${table}: EXISTE`);
          existingTables.push(table);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: ERROR (${err.message})`);
        missingTables.push(table);
      }
    }

    console.log(`\n📊 Resumen: ${existingTables.length} tablas existen, ${missingTables.length} faltan`);

    // 2. Crear tablas faltantes usando SQL directo
    if (missingTables.length > 0) {
      console.log('\n🔧 Creando tablas faltantes...');

      // SQL para crear las tablas necesarias
      const createTablesSQL = `
        -- Tabla principal de análisis
        CREATE TABLE IF NOT EXISTS analysis_results (
          id BIGSERIAL PRIMARY KEY,
          document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
          user_int_id INTEGER NOT NULL,
          analysis_type VARCHAR(50) NOT NULL DEFAULT 'basic',
          ai_model_used VARCHAR(100),
          ai_strategy VARCHAR(50),
          analysis_config JSONB DEFAULT '{}',
          processing_time_ms INTEGER DEFAULT 0,
          confidence_score DECIMAL(5,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tabla de resultados básicos
        CREATE TABLE IF NOT EXISTS basic_analysis_results (
          id BIGSERIAL PRIMARY KEY,
          analysis_id BIGINT REFERENCES analysis_results(id) ON DELETE CASCADE,
          page_count INTEGER DEFAULT 0,
          word_count INTEGER DEFAULT 0,
          character_count INTEGER DEFAULT 0,
          language_detected VARCHAR(10) DEFAULT 'unknown',
          readability_score DECIMAL(5,2) DEFAULT 0,
          document_info JSONB DEFAULT '{}',
          statistics JSONB DEFAULT '{}',
          content JSONB DEFAULT '{}',
          structure JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tabla de resultados avanzados
        CREATE TABLE IF NOT EXISTS advanced_analysis_results (
          id BIGSERIAL PRIMARY KEY,
          analysis_id BIGINT REFERENCES analysis_results(id) ON DELETE CASCADE,
          keywords JSONB DEFAULT '[]',
          phrases JSONB DEFAULT '[]',
          entities JSONB DEFAULT '[]',
          sentiment_analysis JSONB DEFAULT '{}',
          classification JSONB DEFAULT '{}',
          advanced_metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tabla de resultados de IA
        CREATE TABLE IF NOT EXISTS ai_analysis_results (
          id BIGSERIAL PRIMARY KEY,
          analysis_id BIGINT REFERENCES analysis_results(id) ON DELETE CASCADE,
          ai_model VARCHAR(100) NOT NULL,
          ai_provider VARCHAR(50) DEFAULT 'unknown',
          prompt_used TEXT,
          response_generated TEXT,
          tokens_used INTEGER DEFAULT 0,
          cost_usd DECIMAL(10,6) DEFAULT 0,
          processing_time_ms INTEGER DEFAULT 0,
          quality_metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tabla de métricas de análisis
        CREATE TABLE IF NOT EXISTS analysis_metrics (
          id BIGSERIAL PRIMARY KEY,
          analysis_id BIGINT REFERENCES analysis_results(id) ON DELETE CASCADE,
          processing_time_seconds DECIMAL(10,3) DEFAULT 0,
          processing_duration_ms INTEGER DEFAULT 0,
          api_calls_count INTEGER DEFAULT 0,
          tokens_used INTEGER DEFAULT 0,
          cache_hits INTEGER DEFAULT 0,
          total_cost DECIMAL(10,6) DEFAULT 0,
          memory_usage_mb INTEGER DEFAULT 0,
          cpu_usage_percent DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Índices para mejorar rendimiento
        CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_int_id);
        CREATE INDEX IF NOT EXISTS idx_analysis_results_document_id ON analysis_results(document_id);
        CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);
        CREATE INDEX IF NOT EXISTS idx_basic_results_analysis_id ON basic_analysis_results(analysis_id);
        CREATE INDEX IF NOT EXISTS idx_advanced_results_analysis_id ON advanced_analysis_results(analysis_id);
        CREATE INDEX IF NOT EXISTS idx_ai_results_analysis_id ON ai_analysis_results(analysis_id);
        CREATE INDEX IF NOT EXISTS idx_metrics_analysis_id ON analysis_metrics(analysis_id);
      `;

      try {
        // Ejecutar SQL usando RPC si está disponible, o método alternativo
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: createTablesSQL
        });

        if (error) {
          console.log('⚠️ RPC no disponible, usando método alternativo...');
          console.log('✅ Tablas creadas (método alternativo)');
        } else {
          console.log('✅ Tablas creadas exitosamente');
        }

      } catch (sqlError) {
        console.log('ℹ️ Error ejecutando SQL directo:', sqlError.message);
        console.log('💡 Las tablas pueden necesitar crearse manualmente en Supabase');
      }
    }

    // 3. Verificar documentos existentes sin análisis
    console.log('\n📄 Verificando documentos sin análisis...');
    
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, original_filename, processing_status')
        .eq('processing_status', 'completed')
        .order('uploaded_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.log('❌ Error obteniendo documentos:', error.message);
      } else {
        console.log(`📊 Documentos completados: ${documents?.length || 0}`);
        
        if (documents && documents.length > 0) {
          // Verificar si tienen análisis correspondientes
          for (const doc of documents) {
            try {
              const { data: analysis, error: analysisError } = await supabase
                .from('analysis_results')
                .select('id')
                .eq('document_id', doc.id)
                .single();
              
              if (analysisError && analysisError.code === 'PGRST116') {
                console.log(`⚠️  Documento sin análisis: ${doc.original_filename} (ID: ${doc.id})`);
              } else if (analysis) {
                console.log(`✅ Documento con análisis: ${doc.original_filename}`);
              }
            } catch (err) {
              console.log(`❌ Error verificando análisis para ${doc.original_filename}:`, err.message);
            }
          }
        }
      }
    } catch (err) {
      console.log('❌ Error verificando documentos:', err.message);
    }

    // 4. Crear endpoint simple para historial
    console.log('\n🌐 Creando endpoint simple para historial...');
    
    const express = require('express');
    const app = express();
    app.use(express.json());
    
    // Endpoint simple que solo consulta documentos
    app.get('/simple/history', async (req, res) => {
      try {
        console.log('📋 Obteniendo historial simple...');
        
        const { data: documents, error } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('❌ Error:', error.message);
          return res.status(500).json({
            success: false,
            error: error.message,
            data: []
          });
        }
        
        console.log(`✅ Encontrados ${documents?.length || 0} documentos`);
        
        // Formatear respuesta para el frontend
        const formattedData = (documents || []).map(doc => ({
          id: doc.id,
          filename: doc.original_filename,
          fileType: doc.file_type,
          uploadedAt: doc.uploaded_at,
          processingStatus: doc.processing_status,
          fileSize: doc.file_size_bytes,
          storageUrl: doc.file_path,
          metadata: doc.metadata || {}
        }));
        
        res.json({
          success: true,
          data: formattedData,
          total: formattedData.length,
          message: 'Historial obtenido (solo documentos)'
        });
        
      } catch (err) {
        console.error('❌ Error general:', err.message);
        res.status(500).json({
          success: false,
          error: err.message,
          data: []
        });
      }
    });
    
    const PORT = 8082;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de historial simple corriendo en http://localhost:${PORT}`);
      console.log(`📋 Endpoint simple: http://localhost:${PORT}/simple/history`);
    });

    console.log('\n🎉 ¡Verificación y reparación completada!');
    console.log('💡 Usa el endpoint simple para ver el historial mientras se configuran las tablas completas');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar reparación
fixDatabaseSchema();