/**
 * Script para verificar la estructura de la tabla documents
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://zolffzfbxkgiozfbbjnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGZmemZieGtnaW96ZmJiam5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzQ2MTksImV4cCI6MjA4MDY1MDYxOX0.1iX0EZXQv8T-jdJJYHwXaDX0CK5xvlpUZui_E7zifq0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    try {
        console.log('🔧 Conectando a Supabase...');
        
        // Intentar hacer un SELECT a la tabla para ver qué columnas existen
        console.log('🔍 Intentando acceder a la tabla documents...');
        
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error accediendo a documents:', error);
            
            // Si el error es sobre la columna user_int_id, intentar sin ella
            if (error.message && error.message.includes('user_int_id')) {
                console.log('⚠️ El error confirma que user_int_id no existe');
                console.log('📝 Se necesita agregar la columna manualmente');
                console.log('SQL: ALTER TABLE documents ADD COLUMN user_int_id INTEGER;');
            }
            return;
        }

        if (data && data.length > 0) {
            console.log('✅ Tabla documents accesible');
            console.log('📄 Columnas encontradas:');
            Object.keys(data[0]).forEach(key => {
                console.log(`  - ${key}: ${typeof data[0][key]}`);
            });
            
            // Verificar si user_int_id existe
            const hasUserIntId = Object.keys(data[0]).includes('user_int_id');
            console.log(`\n🔍 ¿Tiene user_int_id? ${hasUserIntId ? 'Sí' : 'No'}`);
            
            if (!hasUserIntId) {
                console.log('\n⚠️ La columna user_int_id no existe');
                console.log('📝 SQL para agregar la columna:');
                console.log('ALTER TABLE documents ADD COLUMN user_int_id INTEGER;');
                console.log('\n📋 Instrucciones:');
                console.log('1. Ve a la consola de Supabase: https://zolffzfbxkgiozfbbjnm.supabase.co');
                console.log('2. Navega a SQL Editor');
                console.log('3. Ejecuta: ALTER TABLE documents ADD COLUMN user_int_id INTEGER;');
            }
        } else {
            console.log('📄 La tabla documents está vacía, pero es accesible');
            
            // Intentar insertar un registro de prueba para ver la estructura
            console.log('🔍 Intentando insertar un registro de prueba...');
            const testRecord = {
                original_filename: 'test.pdf',
                file_path: '/test/test.pdf',
                file_size_bytes: 1024,
                file_type: 'pdf',
                mime_type: 'application/pdf',
                file_hash: 'testhash',
                processing_status: 'test'
            };
            
            const { data: insertData, error: insertError } = await supabase
                .from('documents')
                .insert([testRecord])
                .select()
                .single();

            if (insertError) {
                if (insertError.message && insertError.message.includes('user_int_id')) {
                    console.log('⚠️ Confirmado: la columna user_int_id no existe');
                    console.log('📝 SQL necesario: ALTER TABLE documents ADD COLUMN user_int_id INTEGER;');
                } else {
                    console.error('❌ Error insertando registro de prueba:', insertError);
                }
            } else {
                console.log('✅ Registro de prueba insertado');
                console.log('📄 Columnas del registro insertado:');
                Object.keys(insertData).forEach(key => {
                    console.log(`  - ${key}: ${typeof insertData[key]}`);
                });
                
                // Limpiar el registro de prueba
                await supabase
                    .from('documents')
                    .delete()
                    .eq('id', insertData.id);
                console.log('🧹 Registro de prueba eliminado');
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar el script
checkTable();