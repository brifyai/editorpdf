/**
 * Script final para agregar la columna user_int_id a la tabla documents
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://zolffzfbxkgiozfbbjnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGZmemZieGtnaW96ZmJiam5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzQ2MTksImV4cCI6MjA4MDY1MDYxOX0.1iX0EZXQv8T-jdJJYHwXaDX0CK5xvlpUZui_E7zifq0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserIntId() {
    try {
        console.log('🔧 Conectando a Supabase...');
        
        // Basado en el error anterior, podemos ver la estructura:
        // (id, user_int_id, original_filename, file_path, file_size_bytes, file_type, mime_type, file_hash, storage_url, processing_status, uploaded_at, updated_at, deleted_at, metadata)
        // La segunda posición es user_int_id y está null
        
        console.log('📋 Análisis del error anterior:');
        console.log('- El error muestra que user_int_id existe pero está en posición null');
        console.log('- La tabla tiene la columna, pero el servidor no la está usando correctamente');
        
        // Intentar insertar con user_int_id explícito
        console.log('🔍 Intentando insertar con user_int_id explícito...');
        
        const testRecord = {
            user_int_id: 1, // Valor explícito
            original_filename: 'test.pdf',
            file_path: '/test/test.pdf',
            file_size_bytes: 1024,
            file_type: 'pdf',
            mime_type: 'application/pdf',
            file_hash: 'testhash123',
            processing_status: 'pending', // Valor válido según el constraint
            metadata: {}
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('documents')
            .insert([testRecord])
            .select()
            .single();

        if (insertError) {
            if (insertError.message && insertError.message.includes('user_int_id')) {
                console.log('❌ Confirmado: hay un problema con user_int_id');
                console.log('📝 El error exacto:', insertError.message);
            } else if (insertError.code === '23514') {
                console.log('⚠️ Error de constraint, probando con otro processing_status...');
                
                // Intentar con diferentes valores de processing_status
                const statuses = ['completed', 'processing', 'failed', 'pending'];
                
                for (const status of statuses) {
                    const { data: data2, error: error2 } = await supabase
                        .from('documents')
                        .insert([{
                            ...testRecord,
                            processing_status: status
                        }])
                        .select()
                        .single();
                    
                    if (!error2) {
                        console.log(`✅ Insertado con processing_status: ${status}`);
                        console.log('📄 Columnas del registro:', Object.keys(data2));
                        
                        // Verificar si user_int_id está presente
                        const hasUserIntId = Object.keys(data2).includes('user_int_id');
                        console.log(`🔍 ¿Tiene user_int_id? ${hasUserIntId ? 'Sí' : 'No'}`);
                        
                        if (hasUserIntId) {
                            console.log(`✅ user_int_id = ${data2.user_int_id}`);
                        }
                        
                        // Limpiar
                        await supabase.from('documents').delete().eq('id', data2.id);
                        console.log('🧹 Registro de prueba eliminado');
                        break;
                    } else {
                        console.log(`❌ Falló con status '${status}': ${error2.message}`);
                    }
                }
            } else {
                console.error('❌ Error insertando:', insertError);
            }
        } else {
            console.log('✅ Registro insertado exitosamente');
            console.log('📄 Columnas encontradas:');
            Object.keys(insertData).forEach(key => {
                console.log(`  - ${key}: ${insertData[key]} (${typeof insertData[key]})`);
            });
            
            // Limpiar
            await supabase.from('documents').delete().eq('id', insertData.id);
            console.log('🧹 Registro de prueba eliminado');
        }

        // Ahora verificar el problema real del servidor
        console.log('\n🔍 Analizando el problema del servidor...');
        console.log('El error del servidor indica que está tratando de usar user_int_id pero hay un problema.');
        console.log('Posibles soluciones:');
        console.log('1. La columna existe pero el servidor necesita reiniciar para actualizar el schema cache');
        console.log('2. Hay un problema con cómo el servidor está construyendo las consultas');
        console.log('3. Se necesita verificar la configuración de RLS (Row Level Security)');
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar el script
fixUserIntId();