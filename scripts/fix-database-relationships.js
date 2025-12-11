/**
 * Script completo para arreglar las relaciones entre tablas y asegurar la integridad referencial
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://zolffzfbxkgiozfbbjnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGZmemZieGtnaW96ZmJiam5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzQ2MTksImV4cCI6MjA4MDY1MDYxOX0.1iX0EZXQv8T-jdJJYHwXaDX0CK5xvlpUZui_E7zifq0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseRelationships() {
    try {
        console.log('🔧 Iniciando reparación completa de la base de datos...');
        
        // 1. Verificar tabla users
        console.log('\n📋 1. Verificando tabla users...');
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (usersError) {
            console.error('❌ Error accediendo a users:', usersError);
            return;
        }

        if (usersData && usersData.length > 0) {
            console.log('✅ Tabla users accesible');
            console.log('📄 Columnas de users:', Object.keys(usersData[0]));
            console.log('👤 Usuario de ejemplo:', {
                id: usersData[0].id,
                email: usersData[0].email,
                username: usersData[0].username
            });
        } else {
            console.log('⚠️ Tabla users vacía o no accesible');
        }

        // 2. Verificar qué tablas existen
        console.log('\n📋 2. Listando todas las tablas...');
        const tables = [
            'documents',
            'document_analyses', 
            'analysis_results_basic',
            'analysis_results_advanced',
            'analysis_results_ai',
            'ai_model_metrics',
            'user_configurations'
        ];

        for (const tableName of tables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);

                if (error) {
                    if (error.message.includes('does not exist')) {
                        console.log(`❌ Tabla ${tableName} no existe`);
                    } else if (error.message.includes('user_int_id')) {
                        console.log(`⚠️ Tabla ${tableName} existe pero le falta user_int_id`);
                    } else {
                        console.log(`⚠️ Tabla ${tableName} tiene error: ${error.message}`);
                    }
                } else {
                    console.log(`✅ Tabla ${tableName} accesible`);
                    if (data && data.length > 0) {
                        console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
                        const hasUserIntId = Object.keys(data[0]).includes('user_int_id');
                        console.log(`   ¿Tiene user_int_id? ${hasUserIntId ? 'Sí' : 'No'}`);
                    }
                }
            } catch (err) {
                console.log(`❌ Error verificando ${tableName}: ${err.message}`);
            }
        }

        // 3. Generar SQL para arreglar las relaciones
        console.log('\n📝 3. Generando SQL para reparar la base de datos...');
        
        const sqlCommands = [
            '-- Asegurar que todas las tablas tengan user_int_id',
            '-- Ejecutar en orden en la consola de Supabase SQL Editor',
            '',
            '-- 1. Agregar user_int_id a documents si no existe',
            'ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 2. Agregar user_int_id a document_analyses si no existe', 
            'ALTER TABLE document_analyses ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 3. Agregar user_int_id a analysis_results_basic si no existe',
            'ALTER TABLE analysis_results_basic ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 4. Agregar user_int_id a analysis_results_advanced si no existe',
            'ALTER TABLE analysis_results_advanced ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 5. Agregar user_int_id a analysis_results_ai si no existe',
            'ALTER TABLE analysis_results_ai ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 6. Agregar user_int_id a ai_model_metrics si no existe',
            'ALTER TABLE ai_model_metrics ADD COLUMN IF NOT EXISTS user_int_id INTEGER;',
            '',
            '-- 7. Crear foreign key constraints (si no existen)',
            'ALTER TABLE documents ADD CONSTRAINT fk_documents_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            'ALTER TABLE document_analyses ADD CONSTRAINT fk_document_analyses_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            'ALTER TABLE analysis_results_basic ADD CONSTRAINT fk_analysis_results_basic_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            'ALTER TABLE analysis_results_advanced ADD CONSTRAINT fk_analysis_results_advanced_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            'ALTER TABLE analysis_results_ai ADD CONSTRAINT fk_analysis_results_ai_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            'ALTER TABLE ai_model_metrics ADD CONSTRAINT fk_ai_model_metrics_user_int_id FOREIGN KEY (user_int_id) REFERENCES users(id) ON DELETE CASCADE;',
            '',
            '-- 8. Limpiar y refrescar el schema cache',
            'NOTIFY pgrst, \'reload schema\';',
            '',
            '-- 9. Verificar que todo esté correcto',
            'SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN (\'documents\', \'document_analyses\', \'analysis_results_basic\', \'analysis_results_advanced\', \'analysis_results_ai\', \'ai_model_metrics\') AND column_name = \'user_int_id\' ORDER BY table_name;'
        ];

        console.log('📋 SQL generado para ejecutar manualmente:');
        console.log('='.repeat(60));
        sqlCommands.forEach(cmd => console.log(cmd));
        console.log('='.repeat(60));

        // 4. Probar una inserción simple para verificar
        console.log('\n🧪 4. Probando inserción sin user_int_id...');
        try {
            const { data: testData, error: testError } = await supabase
                .from('documents')
                .insert([{
                    original_filename: 'test-relationships.pdf',
                    file_path: '/test/test.pdf',
                    file_size_bytes: 1024,
                    file_type: 'pdf',
                    mime_type: 'application/pdf',
                    file_hash: 'testhash123',
                    processing_status: 'pending',
                    metadata: {}
                }])
                .select()
                .single();

            if (testError) {
                console.log('❌ Error en inserción de prueba:', testError.message);
            } else {
                console.log('✅ Inserción exitosa');
                console.log('📄 Datos insertados:', {
                    id: testData.id,
                    filename: testData.original_filename,
                    user_int_id: testData.user_int_id
                });
                
                // Limpiar
                await supabase.from('documents').delete().eq('id', testData.id);
                console.log('🧹 Datos de prueba eliminados');
            }
        } catch (err) {
            console.log('❌ Error en prueba de inserción:', err.message);
        }

        // 5. Instrucciones finales
        console.log('\n📋 5. INSTRUCCIONES PARA COMPLETAR LA REPARACIÓN:');
        console.log('='.repeat(60));
        console.log('1. Ve a: https://zolffzfbxkgiozfbbjnm.supabase.co');
        console.log('2. Navega a "SQL Editor"');
        console.log('3. Copia y ejecuta el SQL generado arriba');
        console.log('4. Reinicia el servidor Node.js: npm restart o pkill && npm start');
        console.log('5. Prueba la aplicación');
        console.log('');
        console.log('🔍 El problema principal es que el schema cache de Supabase');
        console.log('   necesita ser actualizado después de agregar las columnas.');
        console.log('   La instrucción NOTIFY pgrst fuerza esa actualización.');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar el script
fixDatabaseRelationships();