/**
 * Script para inspeccionar el esquema real de la base de datos de Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function inspectDatabase() {
    console.log('🔍 Inspeccionando base de datos de Supabase...');
    
    // Conectar a Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Variables de entorno de Supabase no configuradas');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // 1. Listar todas las tablas
        console.log('\n📋 Listando todas las tablas...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'public')
            .neq('table_name', '_realtime');
        
        if (tablesError) {
            console.error('❌ Error obteniendo tablas:', tablesError);
            return;
        }
        
        console.log('✅ Tablas encontradas:');
        tables.forEach(table => {
            console.log(`  - ${table.table_name}`);
        });
        
        // 2. Buscar específicamente tablas de análisis
        const analysisTables = tables.filter(table => 
            table.table_name.includes('analysis') || 
            table.table_name.includes('result')
        );
        
        console.log('\n📊 Tablas de análisis encontradas:');
        analysisTables.forEach(table => {
            console.log(`  - ${table.table_name}`);
        });
        
        // 3. Inspeccionar cada tabla de análisis
        for (const table of analysisTables) {
            console.log(`\n🔍 Inspeccionando tabla: ${table.table_name}`);
            
            // Obtener columnas de la tabla
            const { data: columns, error: columnsError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_schema', 'public')
                .eq('table_name', table.table_name)
                .order('ordinal_position');
            
            if (columnsError) {
                console.error(`❌ Error obteniendo columnas de ${table.table_name}:`, columnsError);
                continue;
            }
            
            console.log(`  Columnas (${columns.length}):`);
            columns.forEach(col => {
                console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            // Intentar obtener un registro de ejemplo
            try {
                const { data: sampleData, error: sampleError } = await supabase
                    .from(table.table_name)
                    .select('*')
                    .limit(1);
                
                if (sampleError) {
                    console.log(`  ⚠️ No se pueden obtener datos de ejemplo: ${sampleError.message}`);
                } else if (sampleData && sampleData.length > 0) {
                    console.log(`  📄 Estructura de datos de ejemplo:`);
                    console.log('  ', JSON.stringify(sampleData[0], null, 2));
                } else {
                    console.log(`  📄 La tabla está vacía`);
                }
            } catch (sampleErr) {
                console.log(`  ⚠️ Error al obtener datos de ejemplo: ${sampleErr.message}`);
            }
        }
        
        // 4. Verificar específicamente la tabla que causa el error
        console.log('\n🚨 Buscando tabla analysis_results_basic_2...');
        const { data: problematicTable, error: problematicError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'analysis_results_basic_2');
        
        if (problematicError) {
            console.log('❌ Error buscando tabla problemática:', problematicError.message);
        } else if (problematicTable && problematicTable.length > 0) {
            console.log('✅ Tabla analysis_results_basic_2 encontrada');
            
            // Obtener sus columnas
            const { data: columns, error: columnsError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type')
                .eq('table_schema', 'public')
                .eq('table_name', 'analysis_results_basic_2')
                .order('ordinal_position');
            
            if (columnsError) {
                console.error('❌ Error obteniendo columnas:', columnsError);
            } else {
                console.log('Columnas de analysis_results_basic_2:');
                columns.forEach(col => {
                    console.log(`  - ${col.column_name} (${col.data_type})`);
                });
                
                // Verificar si page_count existe
                const hasPageCount = columns.some(col => col.column_name === 'page_count');
                console.log(`¿Tiene columna page_count? ${hasPageCount ? '✅ Sí' : '❌ No'}`);
            }
        } else {
            console.log('❌ Tabla analysis_results_basic_2 NO encontrada');
            
            // Buscar vistas o alias
            console.log('\n🔍 Buscando vistas que puedan referenciar analysis_results_basic_2...');
            const { data: views, error: viewsError } = await supabase
                .from('information_schema.views')
                .select('table_name, view_definition')
                .eq('table_schema', 'public');
            
            if (viewsError) {
                console.error('❌ Error obteniendo vistas:', viewsError);
            } else {
                console.log('Vistas encontradas:');
                views.forEach(view => {
                    console.log(`  - ${view.table_name}`);
                    if (view.view_definition && view.view_definition.includes('analysis_results_basic_2')) {
                        console.log(`    ⚠️ Esta vista referencia analysis_results_basic_2`);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar inspección
inspectDatabase();