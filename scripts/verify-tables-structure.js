/**
 * Script para verificar la estructura completa de tablas en la base de datos
 */

// Cargar variables de entorno
require('dotenv').config();

const { getSupabaseClient } = require('../src/utils/database');

// Lista de tablas esperadas en la base de datos
const expectedTables = [
  'users',
  'documents',
  'document_analyses',
  'analysis_results_basic',
  'analysis_results_advanced',
  'analysis_results_ai',
  'analysis_metrics',
  'batch_jobs',
  'batch_job_files',
  'user_configurations',
  'user_profiles',
  'ai_model_metrics',
  'ocr_processes',
  'ocr_results',
  'system_settings',
  'audit_logs',
  'error_logs'
];

async function verifyTablesStructure() {
  try {
    console.log('🔍 Verificando estructura de tablas en la base de datos...\n');
    
    const supabase = getSupabaseClient();
    
    // Verificar cada tabla
    for (const tableName of expectedTables) {
      try {
        console.log(`📋 Verificando tabla: ${tableName}`);
        
        // Intentar obtener el conteo de registros
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.log(`   ❌ Tabla '${tableName}' no existe`);
          } else if (error.code === 'PGRST301') {
            console.log(`   ⚠️ Tabla '${tableName}' existe pero no tiene permisos de lectura`);
          } else {
            console.log(`   ⚠️ Error verificando tabla '${tableName}': ${error.message}`);
          }
        } else {
          console.log(`   ✅ Tabla '${tableName}' existe con ${count || 0} registros`);
        }
      } catch (tableError) {
        console.log(`   ❌ Error al verificar tabla '${tableName}': ${tableError.message}`);
      }
    }
    
    console.log('\n🔍 Verificando relaciones entre tablas...\n');
    
    // Verificar algunas relaciones específicas
    const relations = [
      {
        name: 'documents -> document_analyses',
        query: async () => {
          const { data, error } = await supabase
            .from('documents')
            .select('id, document_analyses(id)')
            .limit(1);
          return { data, error };
        }
      },
      {
        name: 'batch_jobs -> batch_job_files',
        query: async () => {
          const { data, error } = await supabase
            .from('batch_jobs')
            .select('id, batch_job_files(id)')
            .limit(1);
          return { data, error };
        }
      },
      {
        name: 'document_analyses -> analysis_results_ai',
        query: async () => {
          const { data, error } = await supabase
            .from('document_analyses')
            .select('id, analysis_results_ai(id)')
            .limit(1);
          return { data, error };
        }
      }
    ];
    
    for (const relation of relations) {
      try {
        console.log(`📋 Verificando relación: ${relation.name}`);
        const { data, error } = await relation.query();
        
        if (error) {
          console.log(`   ❌ Error en relación '${relation.name}': ${error.message}`);
        } else {
          console.log(`   ✅ Relación '${relation.name}' funciona correctamente`);
        }
      } catch (relationError) {
        console.log(`   ❌ Error al verificar relación '${relation.name}': ${relationError.message}`);
      }
    }
    
    console.log('\n📊 Resumen de verificación completada');
    
  } catch (error) {
    console.error('❌ Error en verificación de estructura:', error);
  }
}

// Ejecutar verificación
verifyTablesStructure()
  .then(() => {
    console.log('\n✅ Verificación finalizada');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });