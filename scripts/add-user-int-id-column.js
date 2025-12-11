/**
 * Script para agregar la columna user_int_id a la tabla documents
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración directa de Supabase
const supabaseUrl = 'https://zolffzfbxkgiozfbbjnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGZmemZieGtnaW96ZmJiam5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzQ2MTksImV4cCI6MjA4MDY1MDYxOX0.1iX0EZXQv8T-jdJJYHwXaDX0CK5xvlpUZui_E7zifq0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
    try {
        console.log('🔧 Conectando a Supabase...');
        
        // Primero verificar si la columna ya existe
        console.log('🔍 Verificando si la columna user_int_id ya existe...');
        
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'documents')
            .eq('table_schema', 'public')
            .eq('column_name', 'user_int_id');

        if (columnsError) {
            console.error('❌ Error verificando columnas:', columnsError);
            return;
        }

        if (columns && columns.length > 0) {
            console.log('✅ La columna user_int_id ya existe en la tabla documents');
            return;
        }

        console.log('⚠️ La columna user_int_id no existe. Agregándola...');
        
        // Usar RPC para ejecutar SQL (si está disponible) o intentar directamente
        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE documents ADD COLUMN user_int_id INTEGER;'
            });

            if (error) {
                console.log('⚠️ RPC no disponible, intentando método alternativo...');
                throw error;
            }

            console.log('✅ Columna user_int_id agregada exitosamente via RPC');
        } catch (rpcError) {
            console.log('⚠️ RPC falló, la columna debe ser agregada manualmente desde la consola de Supabase');
            console.log('📝 SQL para ejecutar manualmente:');
            console.log('ALTER TABLE documents ADD COLUMN user_int_id INTEGER;');
        }

        // Verificar nuevamente
        console.log('🔍 Verificando estructura actualizada...');
        const { data: finalColumns, error: finalError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'documents')
            .eq('table_schema', 'public')
            .order('ordinal_position');

        if (finalError) {
            console.error('❌ Error verificando estructura final:', finalError);
        } else {
            console.log('📄 Estructura actual de la tabla documents:');
            finalColumns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar el script
addColumn();