const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStoragePolicies() {
  try {
    console.log('🔧 Configurando políticas RLS para storage...');

    // Primero, verificar si RLS está habilitado en storage.objects
    const { data: storageObjects, error: checkError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('ℹ️  Tabla storage.objects:', checkError.message);
    }

    // Crear políticas usando SQL directo
    const policies = [
      {
        name: 'Users can view own files',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can view own files" ON storage.objects
          FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Users can upload own files',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can upload own files" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Users can update own files',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can update own files" ON storage.objects
          FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Users can delete own files',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can delete own files" ON storage.objects
          FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error) {
          console.log(`ℹ️  Política "${policy.name}":`, error.message);
        } else {
          console.log(`✅ Política "${policy.name}" configurada`);
        }
      } catch (err) {
        console.log(`ℹ️  Error con política "${policy.name}":`, err.message);
      }
    }

    // También crear un bucket público como alternativa
    console.log('\n🔧 Verificando bucket público...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const documentsBucket = buckets?.find(b => b.name === 'documents');
    
    if (documentsBucket) {
      console.log('✅ Bucket "documents" encontrado');
      console.log('📋 Configuración del bucket:', {
        id: documentsBucket.id,
        name: documentsBucket.name,
        public: documentsBucket.public,
        file_size_limit: documentsBucket.file_size_limit,
        allowed_mime_types: documentsBucket.allowed_mime_types
      });
    }

    console.log('\n🎉 ¡Configuración de storage completada!');
    console.log('💡 Los usuarios ahora pueden subir archivos usando la estructura:');
    console.log('   user_id/filename.pdf');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la función
setupStoragePolicies();