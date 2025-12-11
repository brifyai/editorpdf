const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageUpload() {
  try {
    console.log('🧪 Probando subida de archivo a storage...');

    // Crear un archivo de prueba
    const testContent = 'Este es un archivo de prueba para verificar el storage.';
    const fileName = `test_${Date.now()}.txt`;
    const filePath = `anonymous/${fileName}`;

    console.log('📁 Intentando subir archivo:', filePath);

    // Intentar subir archivo
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, testContent, {
        contentType: 'text/plain',
        upsert: false
      });

    if (error) {
      console.error('❌ Error subiendo archivo:', error.message);
      console.log('💡 Esto puede indicar que las políticas RLS no están configuradas correctamente');
      return false;
    }

    console.log('✅ Archivo subido exitosamente:', data.path);

    // Intentar leer el archivo
    const { data: fileData, error: readError } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (readError) {
      console.error('❌ Error leyendo archivo:', readError.message);
      return false;
    }

    console.log('✅ Archivo leído exitosamente');

    // Limpiar archivo de prueba
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (deleteError) {
      console.warn('⚠️ Error eliminando archivo de prueba:', deleteError.message);
    } else {
      console.log('🗑️ Archivo de prueba eliminado');
    }

    return true;

  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
  }
}

// Ejecutar prueba
testStorageUpload().then(success => {
  if (success) {
    console.log('\n🎉 ¡Storage funcionando correctamente!');
    console.log('💡 Los usuarios pueden subir y leer archivos');
  } else {
    console.log('\n❌ Problemas con storage detectados');
    console.log('💡 Ejecuta el archivo storage-policies.sql en Supabase');
  }
  process.exit(success ? 0 : 1);
});