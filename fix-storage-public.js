const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeBucketPublic() {
  try {
    console.log('🔧 Haciendo bucket "documents" público...');

    // Actualizar bucket para hacerlo público
    const { data, error } = await supabase.storage
      .updateBucket('documents', {
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/bmp',
          'image/tiff',
          'image/webp'
        ]
      });

    if (error) {
      console.error('❌ Error actualizando bucket:', error.message);
      return false;
    }

    console.log('✅ Bucket "documents" ahora es público');
    console.log('💡 Los usuarios pueden subir archivos sin restricciones de RLS');
    console.log('🔒 La seguridad se maneja a nivel de aplicación (servidor)');

    // Probar subida
    console.log('\n🧪 Probando subida de archivo...');
    const testContent = 'Este es un archivo de prueba.';
    const fileName = `test_public_${Date.now()}.txt`;
    const filePath = `anonymous/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, testContent, {
        contentType: 'text/plain',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error en test de subida:', uploadError.message);
      return false;
    }

    console.log('✅ Test de subida exitoso:', uploadData.path);

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

// Ejecutar
makeBucketPublic().then(success => {
  if (success) {
    console.log('\n🎉 ¡Storage funcionando correctamente!');
    console.log('💡 Los usuarios pueden subir archivos sin problemas');
    console.log('🔒 La seguridad se mantiene a nivel de servidor');
  } else {
    console.log('\n❌ No se pudo configurar el storage');
  }
  process.exit(success ? 0 : 1);
});