
                const { createClient } = require('@supabase/supabase-js');
                
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
                
                const supabase = createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });
                
                // Verificar la restricción actual
                console.log('🔍 Verificando restricción documents_file_type_check...');
                
                // Intentar insertar un documento con tipo 'txt' para ver si la restricción permite ahora
                const testDoc = {
                    title: 'Test Document',
                    file_type: 'txt',
                    file_path: '/test/path.txt',
                    file_size: 1024,
                    user_id: 1,
                    analysis_status: 'completed'
                };
                
                const { data, error } = await supabase
                    .from('documents')
                    .insert(testDoc)
                    .select()
                    .single();
                
                if (error) {
                    if (error.message.includes('violates check constraint')) {
                        console.log('❌ La restricción aún no permite tipos txt, doc, docx');
                        console.log('Error:', error.message);
                    } else {
                        console.log('⚠️  Error diferente al esperado:', error.message);
                    }
                } else {
                    console.log('✅ La restricción ahora permite tipos txt, doc, docx');
                    
                    // Limpiar el documento de prueba
                    await supabase
                        .from('documents')
                        .delete()
                        .eq('title', 'Test Document');
                }
                
                process.exit(0);
            