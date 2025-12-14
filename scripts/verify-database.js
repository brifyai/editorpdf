const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para ejecutar consulta SQL
async function executeSQL(sql) {
  try {
    // Nota: Esta es una aproximación. En realidad, necesitarías usar RPC o una función personalizada
    // para ejecutar SQL arbitrario en Supabase desde el cliente.
    // Por ahora, vamos a verificar las tablas usando el cliente de Supabase directamente.
    console.log('Ejecutando consulta SQL:', sql.substring(0, 100) + '...');
    
    // Para este ejemplo, vamos a usar el método select para verificar tablas
    const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1);
    
    if (error) {
      console.error('Error ejecutando SQL:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error en executeSQL:', err);
    return null;
  }
}

// Función para verificar tablas existentes
async function checkTables() {
  console.log('=== VERIFICANDO TABLAS EXISTENTES ===');
  
  // Lista de tablas esperadas
  const expectedTables = [
    'users',
    'profiles',
    'documents',
    'document_analyses',
    'batch_jobs',
    'batch_job_files',
    'user_profiles',
    'user_preferences',
    'user_configurations',
    'ocr_processes',
    'ai_model_metrics',
    'usage_statistics'
  ];
  
  const results = {};
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (error) {
        results[table] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ Tabla ${table}: NO EXISTE (${error.message})`);
      } else {
        results[table] = {
          exists: true,
          count: data?.length || 0
        };
        console.log(`✅ Tabla ${table}: EXISTE (${data?.length || 0} registros)`);
      }
    } catch (err) {
      results[table] = {
        exists: false,
        error: err.message
      };
      console.log(`❌ Tabla ${table}: ERROR (${err.message})`);
    }
  }
  
  return results;
}

// Función para verificar columnas específicas
async function checkColumns() {
  console.log('\n=== VERIFICANDO COLUMNAS CRÍTICAS ===');
  
  // Verificar columnas user_id y user_int_id en tablas principales
  const tablesToCheck = [
    'users',
    'profiles',
    'documents',
    'document_analyses',
    'batch_jobs',
    'batch_job_files'
  ];
  
  const columnResults = {};
  
  for (const table of tablesToCheck) {
    columnResults[table] = {};
    
    try {
      // Intentar seleccionar user_id y user_int_id para ver si existen
      const { data, error } = await supabase
        .from(table)
        .select('user_id, user_int_id')
        .limit(1);
      
      if (error) {
        // Si hay un error, podría ser que las columnas no existen
        columnResults[table].user_id = false;
        columnResults[table].user_int_id = false;
        console.log(`❌ Tabla ${table}: No se pudieron verificar las columnas (${error.message})`);
      } else {
        // Si no hay error, las columnas existen
        columnResults[table].user_id = true;
        columnResults[table].user_int_id = true;
        console.log(`✅ Tabla ${table}: user_id y user_int_id EXISTEN`);
      }
    } catch (err) {
      columnResults[table].user_id = false;
      columnResults[table].user_int_id = false;
      console.log(`❌ Tabla ${table}: ERROR verificando columnas (${err.message})`);
    }
  }
  
  return columnResults;
}

// Función para verificar datos de muestra
async function checkSampleData() {
  console.log('\n=== VERIFICANDO DATOS DE MUESTRA ===');
  
  try {
    // Verificar usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, user_int_id')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error consultando usuarios:', usersError.message);
    } else {
      console.log('✅ Usuarios encontrados:', users.length);
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Email: ${user.email}, user_int_id: ${user.user_int_id || 'N/A'}`);
      });
    }
    
    // Verificar documentos
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, filename, user_id, user_int_id')
      .limit(5);
    
    if (docsError) {
      console.log('❌ Error consultando documentos:', docsError.message);
    } else {
      console.log('✅ Documentos encontrados:', documents.length);
      documents.forEach(doc => {
        console.log(`   - ID: ${doc.id}, Filename: ${doc.filename}, user_id: ${doc.user_id}, user_int_id: ${doc.user_int_id || 'N/A'}`);
      });
    }
    
    // Verificar batch jobs
    const { data: batchJobs, error: batchError } = await supabase
      .from('batch_jobs')
      .select('id, name, user_id, user_int_id')
      .limit(5);
    
    if (batchError) {
      console.log('❌ Error consultando batch jobs:', batchError.message);
    } else {
      console.log('✅ Batch jobs encontrados:', batchJobs.length);
      batchJobs.forEach(job => {
        console.log(`   - ID: ${job.id}, Name: ${job.name}, user_id: ${job.user_id}, user_int_id: ${job.user_int_id || 'N/A'}`);
      });
    }
    
  } catch (err) {
    console.log('❌ Error verificando datos de muestra:', err.message);
  }
}

// Función principal
async function main() {
  console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DE BASE DE DATOS');
  console.log('===============================================\n');
  
  // Verificar conexión a Supabase
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      console.error('Por favor, verifica tus credenciales de Supabase en las variables de entorno.');
      process.exit(1);
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente\n');
  } catch (err) {
    console.error('❌ Error crítico conectando a Supabase:', err.message);
    process.exit(1);
  }
  
  // Ejecutar verificaciones
  const tableResults = await checkTables();
  const columnResults = await checkColumns();
  await checkSampleData();
  
  // Resumen final
  console.log('\n=== RESUMEN FINAL ===');
  
  const existingTables = Object.values(tableResults).filter(r => r.exists).length;
  const totalTables = Object.keys(tableResults).length;
  
  console.log(`Tablas existentes: ${existingTables}/${totalTables}`);
  
  const tablesWithColumns = Object.entries(columnResults).filter(([table, cols]) => 
    cols.user_id && cols.user_int_id
  ).length;
  const totalTablesWithColumns = Object.keys(columnResults).length;
  
  console.log(`Tablas con columnas user_id y user_int_id: ${tablesWithColumns}/${totalTablesWithColumns}`);
  
  if (existingTables === totalTables && tablesWithColumns === totalTablesWithColumns) {
    console.log('\n🎉 ¡TODAS LAS TABLAS Y COLUMNAS NECESARIAS EXISTEN!');
  } else {
    console.log('\n⚠️  FALTAN ALGUNAS TABLAS O COLUMNAS. REVISAR LOS DETALLES ARRIBA.');
  }
  
  console.log('\n✅ VERIFICACIÓN COMPLETADA');
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkTables,
  checkColumns,
  checkSampleData
};