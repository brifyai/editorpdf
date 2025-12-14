/**
 * Script para investigar la tabla batch_jobs
 * 
 * Este script verifica:
 * 1. Si la tabla batch_jobs existe en Supabase
 * 2. La estructura de la tabla
 * 3. Los permisos y políticas RLS
 * 4. Si hay datos en la tabla
 * 5. El estado del endpoint /api/batch-jobs
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

async function investigateBatchJobs() {
    console.log('🔍 Investigando tabla batch_jobs...\n');

    // Verificar si tenemos las credenciales de Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('❌ No se encontraron credenciales de Supabase en el entorno');
        return;
    }

    // Crear cliente de Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    try {
        // 1. Verificar si la tabla batch_jobs existe
        console.log('📋 Verificando existencia de la tabla batch_jobs...');
        
        try {
            const { data, error } = await supabase
                .from('batch_jobs')
                .select('*')
                .limit(1);

            if (error) {
                if (error.code === '42P01') {
                    console.log('❌ La tabla batch_jobs no existe en la base de datos');
                    console.log('   Error:', error.message);
                } else {
                    console.log('❌ Error al consultar la tabla batch_jobs:', error.message);
                }
            } else {
                console.log('✅ La tabla batch_jobs existe');
                
                // 2. Verificar la estructura de la tabla
                console.log('\n📊 Estructura de la tabla:');
                if (data && data.length > 0) {
                    const firstRow = data[0];
                    Object.keys(firstRow).forEach(key => {
                        const value = firstRow[key];
                        const type = value === null ? 'NULL' : typeof value;
                        const displayValue = value === null ? 'NULL' : 
                                            typeof value === 'object' ? JSON.stringify(value) :
                                            String(value).length > 50 ? String(value).substring(0, 47) + '...' :
                                            String(value);
                        console.log(`   - ${key}: ${type} = ${displayValue}`);
                    });
                } else {
                    console.log('   ℹ️ La tabla existe pero está vacía');
                }

                // 3. Contar registros
                const { count } = await supabase
                    .from('batch_jobs')
                    .select('*', { count: 'exact', head: true });
                
                console.log(`\n📈 Total de registros: ${count || 0}`);
            }
        } catch (error) {
            console.log('❌ Error al verificar la tabla:', error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 4. Verificar el endpoint /api/batch-jobs
        console.log('🌐 Probando endpoint /api/batch-jobs...');
        
        try {
            const response = await axios.get('http://localhost:8080/api/batch-jobs', {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Endpoint respondió correctamente');
            console.log(`   - Status: ${response.status}`);
            console.log(`   - Data:`, response.data);
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ Endpoint respondió con error: ${error.response.status}`);
                console.log(`   - Mensaje: ${error.response.data.message || error.response.statusText}`);
                console.log(`   - Data:`, error.response.data);
            } else if (error.request) {
                console.log('❌ No se pudo conectar al endpoint /api/batch-jobs');
                console.log('   - El servidor puede no estar ejecutándose');
                console.log('   - El endpoint puede no existir');
                console.log('   - Error:', error.message);
            } else {
                console.log('❌ Error inesperado al probar el endpoint:', error.message);
            }
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 5. Verificar si hay tablas relacionadas
        console.log('🔗 Verificando tablas relacionadas...');
        
        const relatedTables = ['documents', 'batch_analysis', 'users'];
        
        for (const tableName of relatedTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ Tabla ${tableName}: Error o no existe - ${error.message}`);
                } else {
                    const { count } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true });
                    
                    console.log(`✅ Tabla ${tableName}: Existe con ${count || 0} registros`);
                }
            } catch (error) {
                console.log(`❌ Tabla ${tableName}: No se pudo verificar - ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 6. Recomendaciones
        console.log('💡 Recomendaciones:');
        
        // Verificar archivos SQL relacionados con batch_jobs
        const fs = require('fs');
        const path = require('path');
        
        try {
            const sqlFiles = [
                'database/create-batch-jobs-table.sql',
                'database/complete-batch-tables.sql',
                'database/minimal-test-schema.sql'
            ];
            
            console.log('📄 Buscando archivos SQL relacionados...');
            
            for (const sqlFile of sqlFiles) {
                if (fs.existsSync(sqlFile)) {
                    console.log(`   ✅ Encontrado: ${sqlFile}`);
                } else {
                    console.log(`   ❌ No encontrado: ${sqlFile}`);
                }
            }
        } catch (error) {
            console.log('   ⚠️ No se pudieron verificar archivos SQL:', error.message);
        }

        console.log('\n🏁 Investigación completada');

    } catch (error) {
        console.error('❌ Error general durante la investigación:', error.message);
    }
}

// Ejecutar investigación
investigateBatchJobs().catch(console.error);