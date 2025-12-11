/**
 * Script de diagnóstico para verificar el problema de guardado de API keys
 */

const { getSupabaseClient } = require('./src/utils/database');
const { isDatabaseAvailable } = require('./src/utils/database');

async function debugConfiguration() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE CONFIGURACIÓN DE API KEYS');
  console.log('==============================================');
  
  try {
    // 1. Verificar si la base de datos está disponible
    console.log('\n1️⃣ Verificando disponibilidad de base de datos...');
    const dbAvailable = isDatabaseAvailable();
    console.log(`✅ Base de datos disponible: ${dbAvailable}`);
    
    if (!dbAvailable) {
      console.log('❌ LA BASE DE DATOS NO ESTÁ DISPONIBLE');
      console.log('   Esto explica por qué no se pueden guardar las API keys');
      return;
    }
    
    // 2. Obtener cliente de Supabase
    console.log('\n2️⃣ Obteniendo cliente de Supabase...');
    const supabase = getSupabaseClient();
    console.log('✅ Cliente de Supabase obtenido');
    
    // 3. Verificar si existe la tabla user_configurations
    console.log('\n3️⃣ Verificando tabla user_configurations...');
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .select('count')
        .single();
      
      if (error) {
        console.log(`❌ Error al acceder a la tabla: ${error.message}`);
        console.log(`   Código de error: ${error.code}`);
      } else {
        console.log('✅ Tabla user_configurations existe y es accesible');
      }
    } catch (tableError) {
      console.log(`❌ Error crítico con la tabla: ${tableError.message}`);
    }
    
    // 4. Intentar obtener configuración para usuario 1
    console.log('\n4️⃣ Intentando obtener configuración para usuario 1...');
    try {
      const { data: configData, error: configError } = await supabase
        .from('user_configurations')
        .select('*')
        .eq('user_int_id', 1)
        .single();
      
      if (configError) {
        if (configError.code === 'PGRST116') {
          console.log('ℹ️ No se encontró configuración para el usuario 1 (esto es normal si nunca se guardó)');
        } else if (configError.code === 'PGRST204') {
          console.log('❌ La tabla user_configurations no existe');
        } else {
          console.log(`❌ Error al obtener configuración: ${configError.message}`);
        }
      } else if (configData) {
        console.log('✅ Configuración encontrada para usuario 1:');
        console.log('   Datos:', JSON.stringify(configData, null, 2));
      } else {
        console.log('ℹ️ No hay configuración guardada para el usuario 1');
      }
    } catch (getError) {
      console.log(`❌ Error al obtener configuración: ${getError.message}`);
    }
    
    // 5. Intentar guardar una configuración de prueba
    console.log('\n5️⃣ Intentando guardar configuración de prueba...');
    try {
      const testConfig = {
        user_int_id: 1,
        groq_api_key: 'gsk_test_api_key_123',
        chutes_api_key: 'test_chutes_key_456',
        updated_at: new Date().toISOString()
      };
      
      console.log('Datos a guardar:', JSON.stringify(testConfig, null, 2));
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_configurations')
        .upsert(testConfig)
        .select()
        .single();
      
      if (insertError) {
        console.log(`❌ Error al guardar configuración: ${insertError.message}`);
        console.log(`   Código de error: ${insertError.code}`);
        console.log(`   Detalles: ${JSON.stringify(insertError, null, 2)}`);
      } else if (insertData) {
        console.log('✅ Configuración de prueba guardada exitosamente:');
        console.log('   Datos guardados:', JSON.stringify(insertData, null, 2));
      } else {
        console.log('⚠️ La operación de guardado no devolvió datos');
      }
    } catch (saveError) {
      console.log(`❌ Error al guardar configuración: ${saveError.message}`);
    }
    
    // 6. Verificar si ahora existe la configuración
    console.log('\n6️⃣ Verificando si ahora existe la configuración...');
    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_configurations')
        .select('*')
        .eq('user_int_id', 1)
        .single();
      
      if (verifyError) {
        console.log(`❌ Error al verificar configuración: ${verifyError.message}`);
      } else if (verifyData) {
        console.log('✅ Configuración encontrada después del guardado:');
        console.log('   Datos:', JSON.stringify(verifyData, null, 2));
      } else {
        console.log('❌ La configuración no se guardó correctamente');
      }
    } catch (verifyError) {
      console.log(`❌ Error al verificar: ${verifyError.message}`);
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('==============================================');
    
  } catch (generalError) {
    console.error('❌ Error general en el diagnóstico:', generalError);
    console.error('Stack trace:', generalError.stack);
  }
}

// Ejecutar el diagnóstico
debugConfiguration().catch(error => {
  console.error('❌ Error ejecutando diagnóstico:', error);
  process.exit(1);
});