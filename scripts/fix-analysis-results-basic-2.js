/**
 * Script para buscar y eliminar referencias a analysis_results_basic_2 en la base de datos
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function fixAnalysisResultsBasic2() {
    console.log('🔧 Buscando y eliminando referencias a analysis_results_basic_2...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Credenciales de Supabase no configuradas');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // 1. Buscar vistas que referencien analysis_results_basic_2
        console.log('\n🔍 Buscando vistas que referencien analysis_results_basic_2...');
        const { data: views, error: viewsError } = await supabase
            .from('information_schema.views')
            .select('table_name, view_definition')
            .eq('table_schema', 'public');
        
        if (viewsError) {
            console.log('❌ Error buscando vistas:', viewsError.message);
        } else if (views && views.length > 0) {
            console.log('Vistas encontradas:');
            views.forEach(view => {
                if (view.view_definition && view.view_definition.includes('analysis_results_basic_2')) {
                    console.log(`⚠️ Vista ${view.table_name} referencia analysis_results_basic_2`);
                    console.log(`   Definición: ${view.view_definition.substring(0, 200)}...`);
                }
            });
        } else {
            console.log('✅ No se encontraron vistas que referencien analysis_results_basic_2');
        }
        
        // 2. Buscar funciones o procedimientos almacenados
        console.log('\n🔍 Buscando funciones que referencien analysis_results_basic_2...');
        const { data: functions, error: functionsError } = await supabase
            .from('information_schema.routines')
            .select('routine_name, routine_definition')
            .eq('routine_schema', 'public');
        
        if (functionsError) {
            console.log('❌ Error buscando funciones:', functionsError.message);
        } else if (functions && functions.length > 0) {
            console.log('Funciones encontradas:');
            functions.forEach(func => {
                if (func.routine_definition && func.routine_definition.includes('analysis_results_basic_2')) {
                    console.log(`⚠️ Función ${func.routine_name} referencia analysis_results_basic_2`);
                }
            });
        } else {
            console.log('✅ No se encontraron funciones que referencien analysis_results_basic_2');
        }
        
        // 3. Verificar si hay alguna tabla temporal o alias
        console.log('\n🔍 Verificando tablas temporales...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_type')
            .eq('table_schema', 'public')
            .like('table_name', '%analysis_results_basic%');
        
        if (tablesError) {
            console.log('❌ Error buscando tablas:', tablesError.message);
        } else if (tables && tables.length > 0) {
            console.log('Tablas de análisis encontradas:');
            tables.forEach(table => {
                console.log(`  - ${table.table_name} (${table.table_type})`);
            });
        }
        
        // 4. Verificar el endpoint de análisis-history específicamente
        console.log('\n🔍 Probando endpoint /api/analysis-history directamente...');
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/document_analyses?select=*,analysis_results_basic(*)`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            
            if (response.ok) {
                console.log('✅ Query directa funciona correctamente');
            } else {
                console.log('❌ Error en query directa:', response.status, response.statusText);
                const errorText = await response.text();
                console.log('Error details:', errorText);
            }
        } catch (error) {
            console.log('❌ Error probando query directa:', error.message);
        }
        
        console.log('\n✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar script
fixAnalysisResultsBasic2();