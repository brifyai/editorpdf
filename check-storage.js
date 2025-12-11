require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkStorage() {
  try {
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'presente' : 'ausente');
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    console.log('Verificando buckets de storage...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error al listar buckets:', error);
      return;
    }
    
    console.log('Buckets encontrados:', buckets);
    
    // Verificar si existe el bucket 'documents'
    const documentsBucket = buckets.find(b => b.name === 'documents');
    if (documentsBucket) {
      console.log('Bucket documents existe:', documentsBucket);
    } else {
      console.log('Bucket documents NO existe');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkStorage();