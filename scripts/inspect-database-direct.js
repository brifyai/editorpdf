/**
 * Script para inspeccionar directamente la base de datos PostgreSQL de Supabase
 */

require('dotenv').config();
const { Pool } = require('pg');

async function inspectDatabaseDirect() {
    console.log('🔍 Inspeccionando base de datos PostgreSQL directamente...');
    
    // Extraer conexión de la URL de Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
        console.error('❌ SUPABASE_URL no configurada');
        return;
    }
    
    // Parsear la URL para obtener la conexión PostgreSQL
    const url = new URL(supabaseUrl);
    const postgresUrl = `postgresql://postgres.${url.host}:5432/postgres`;
    
    console.log(`📡 Conectando a: ${postgresUrl}`);
    
    const pool = new Pool({
        connectionString: postgresUrl,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        const client = await pool.connect();
        console.log('✅ Conexión establecida');
        
        // 1. Listar todas las tablas
        console.log('\n📋 Listando todas las tablas...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name != '_realtime'
            ORDER BY table_name
        `);
        
        console.log('✅ Tablas encontradas:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // 2. Buscar específicamente tablas de análisis
        const analysisTables = tablesResult.rows.filter(row => 
            row.table_name.includes('analysis') || 
            row.table_name.includes('result')
        );
        
        console.log('\n📊 Tablas de análisis encontradas:');
        analysisTables.forEach(table => {
            console.log(`  - ${table.table_name}`);
        });
        
        // 3. Verificar específicamente la tabla que causa el error
        console.log('\n🚨 Buscando tabla analysis_results_basic_2...');
        const tableExistsResult = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'analysis_results_basic_2'
            ) as exists
        `);
        
        const tableExists = tableExistsResult.rows[0].exists;
        console.log(`¿Existe tabla analysis_results_basic_2? ${tableExists ? '✅ Sí' : '❌ No'}`);
        
        if (tableExists) {
            // Obtener columnas de la tabla problemática
            console.log('\n🔍 Columnas de analysis_results_basic_2:');
            const columnsResult = await client.query(`
                SELECT column_name, data_type, is_nullable, ordinal_position
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'analysis_results_basic_2'
                ORDER BY ordinal_position
            `);
            
            columnsResult.rows.forEach(col => {
                const hasPageCount = col.column_name === 'page_count';
                console.log(`  ${hasPageCount ? '🚨' : '  '} ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            const hasPageCount = columnsResult.rows.some(col => col.column_name === 'page_count');
            console.log(`\n¿Tiene columna page_count? ${hasPageCount ? '✅ Sí' : '❌ No'}`);
            
            if (!hasPageCount) {
                console.log('\n💡 Posibles soluciones:');
                console.log('  1. Agregar la columna page_count a la tabla');
                console.log('  2. Modificar las consultas para no usar page_count');
                console.log('  3. Usar una columna alternativa');
                
                // Verificar qué columnas similares existen
                const similarColumns = columnsResult.rows.filter(col => 
                    col.column_name.includes('page') || 
                    col.column_name.includes('count')
                );
                
                if (similarColumns.length > 0) {
                    console.log('\n🔍 Columnas similares encontradas:');
                    similarColumns.forEach(col => {
                        console.log(`    - ${col.column_name} (${col.data_type})`);
                    });
                }
            }
        }
        
        // 4. Inspeccionar tablas de análisis básicas
        console.log('\n📊 Inspeccionando tablas de análisis básicas...');
        for (const table of analysisTables) {
            if (table.table_name.includes('basic')) {
                console.log(`\n🔍 Tabla: ${table.table_name}`);
                
                const columnsResult = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = '${table.table_name}'
                    ORDER BY ordinal_position
                `);
                
                console.log(`  Columnas (${columnsResult.rows.length}):`);
                columnsResult.rows.forEach(col => {
                    const isPageCount = col.column_name === 'page_count';
                    console.log(`  ${isPageCount ? '🚨' : '  '} ${col.column_name} (${col.data_type})`);
                });
                
                const hasPageCount = columnsResult.rows.some(col => col.column_name === 'page_count');
                console.log(`  ¿Tiene page_count? ${hasPageCount ? '✅ Sí' : '❌ No'}`);
                
                // Obtener conteo de registros
                const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                console.log(`  Registros: ${countResult.rows[0].count}`);
            }
        }
        
        // 5. Buscar vistas que puedan referenciar analysis_results_basic_2
        console.log('\n🔍 Buscando vistas...');
        const viewsResult = await client.query(`
            SELECT table_name, view_definition
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (viewsResult.rows.length > 0) {
            console.log('Vistas encontradas:');
            viewsResult.rows.forEach(view => {
                console.log(`  - ${view.table_name}`);
                if (view.view_definition && view.view_definition.includes('analysis_results_basic_2')) {
                    console.log(`    ⚠️ Esta vista referencia analysis_results_basic_2`);
                    console.log(`    Definición: ${view.view_definition.substring(0, 200)}...`);
                }
            });
        } else {
            console.log('No se encontraron vistas');
        }
        
        await client.release();
        console.log('\n✅ Inspección completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Posibles soluciones:');
            console.log('  1. Verificar que la URL de Supabase sea correcta');
            console.log('  2. Usar la clave de servicio (SERVICE_ROLE_KEY) en lugar de ANON_KEY');
            console.log('  3. Verificar que la base de datos acepte conexiones externas');
        }
    } finally {
        await pool.end();
    }
}

// Ejecutar inspección
inspectDatabaseDirect();