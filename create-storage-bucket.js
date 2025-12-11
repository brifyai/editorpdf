const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
  try {
    console.log('🔧 Creando bucket "documents"...');
    
    // Crear el bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: false, // Privado por seguridad
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/rtf',
        'application/vnd.oasis.opendocument.text'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (bucketError) {
      console.error('❌ Error creando bucket:', bucketError.message);
      return;
    }

    console.log('✅ Bucket "documents" creado exitosamente');

    // Crear políticas RLS para el bucket
    console.log('🔧 Configurando políticas RLS...');

    // Política para SELECT (leer archivos)
    const { error: selectPolicyError } = await supabase.rpc('create_storage_object_policy', {
      policy_name: 'documents_select_policy',
      bucket_name: 'documents',
      operation: 'SELECT',
      check_expression: 'auth.uid()::text = (storage.foldername(name))[1]'
    });

    if (selectPolicyError) {
      console.log('ℹ️  Política SELECT (puede que ya exista):', selectPolicyError.message);
    } else {
      console.log('✅ Política SELECT creada');
    }

    // Política para INSERT (subir archivos)
    const { error: insertPolicyError } = await supabase.rpc('create_storage_object_policy', {
      policy_name: 'documents_insert_policy',
      bucket_name: 'documents',
      operation: 'INSERT',
      check_expression: 'auth.uid()::text = (storage.foldername(name))[1]'
    });

    if (insertPolicyError) {
      console.log('ℹ️  Política INSERT (puede que ya exista):', insertPolicyError.message);
    } else {
      console.log('✅ Política INSERT creada');
    }

    // Política para UPDATE (actualizar archivos)
    const { error: updatePolicyError } = await supabase.rpc('create_storage_object_policy', {
      policy_name: 'documents_update_policy',
      bucket_name: 'documents',
      operation: 'UPDATE',
      check_expression: 'auth.uid()::text = (storage.foldername(name))[1]'
    });

    if (updatePolicyError) {
      console.log('ℹ️  Política UPDATE (puede que ya exista):', updatePolicyError.message);
    } else {
      console.log('✅ Política UPDATE creada');
    }

    // Política para DELETE (eliminar archivos)
    const { error: deletePolicyError } = await supabase.rpc('create_storage_object_policy', {
      policy_name: 'documents_delete_policy',
      bucket_name: 'documents',
      operation: 'DELETE',
      check_expression: 'auth.uid()::text = (storage.foldername(name))[1]'
    });

    if (deletePolicyError) {
      console.log('ℹ️  Política DELETE (puede que ya exista):', deletePolicyError.message);
    } else {
      console.log('✅ Política DELETE creada');
    }

    console.log('\n🎉 ¡Configuración de storage completada!');
    console.log('📁 Bucket "documents" listo para usar');
    console.log('🔐 Políticas RLS configuradas para seguridad');
    console.log('📋 Tipos de archivo permitidos: PDF, imágenes, DOC, DOCX, RTF, ODT, TXT');
    console.log('📏 Límite de tamaño: 50MB por archivo');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la función
createStorageBucket();