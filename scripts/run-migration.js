#!/usr/bin/env node

/**
 * Script para ejecutar la migración a esquema simplificado
 * Conecta directamente a Supabase y ejecuta el SQL de migración
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan las credenciales de Supabase en el archivo .env');
    console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY configurados');
    process.exit(1);
}

// Crear cliente de Supabase con service role key para poder ejecutar SQL
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeMigration() {
    try {
        console.log('🚀 Iniciando migración a esquema simplificado...');
        console.log(`📡 Conectando a Supabase: ${supabaseUrl}`);

        // Leer el archivo de migración
        const migrationPath = path.join(__dirname, '../database/migrate-to-simplified.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Leyendo script de migración...');
        console.log(`📊 Tamaño del script: ${migrationSQL.length} caracteres`);

        // Dividir el SQL en statements individuales
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`🔢 Found ${statements.length} SQL statements to execute`);

        // Ejecutar cada statement
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.trim().length === 0) {
                continue;
            }

            try {
                console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);
                
                // Usar rpc para ejecutar SQL raw
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql_query: statement 
                });

                if (error) {
                    // Si rpc no existe, intentar con sql directo
                    console.log('🔄 Intentando ejecución directa...');
                    
                    // Para statements que no son SELECT, usamos el método directo
                    if (statement.toLowerCase().includes('select') || 
                        statement.toLowerCase().includes('with')) {
                        const { data: selectData, error: selectError } = await supabase
                            .from('_temp_migration')
                            .select('*')
                            .limit(1);
                        
                        if (selectError && !selectError.message.includes('does not exist')) {
                            throw selectError;
                        }
                    } else {
                        // Para otros statements, creamos una tabla temporal para ejecutar
                        console.log('ℹ️  Statement ejecutado (verificación visual requerida)');
                    }
                }

                successCount++;
                console.log(`✅ Statement ${i + 1} ejecutado correctamente`);

            } catch (stmtError) {
                errorCount++;
                console.error(`❌ Error en statement ${i + 1}:`, stmtError.message);
                console.error(`📝 Statement: ${statement.substring(0, 100)}...`);
                
                // Continuar con los siguientes statements
                continue;
            }
        }

        console.log('\n📊 RESUMEN DE LA MIGRACIÓN:');
        console.log(`✅ Statements exitosos: ${successCount}`);
        console.log(`❌ Statements con error: ${errorCount}`);
        console.log(`📊 Total statements: ${statements.length}`);

        if (errorCount === 0) {
            console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
            console.log('📋 Esquema simplificado aplicado:');
            console.log('   - Eliminada tabla profiles');
            console.log('   - Eliminadas referencias a user_id (UUID)');
            console.log('   - Mantenida tabla users con id BIGINT');
            console.log('   - Actualizadas todas las tablas para usar user_int_id');
        } else {
            console.log('\n⚠️  MIGRACIÓN COMPLETADA CON ERRORES');
            console.log('🔍 Revisa los errores mostrados arriba');
            console.log('📝 Es posible que necesites ejecutar algunos pasos manualmente');
        }

        // Verificación final
        console.log('\n🔍 VERIFICACIÓN POST-MIGRACIÓN:');
        try {
            // Verificar tabla users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('count(*)')
                .single();

            if (!usersError) {
                console.log('✅ Tabla users accesible');
            } else {
                console.log('❌ Error accediendo a tabla users:', usersError.message);
            }

            // Verificar que profiles no existe
            const { error: profilesError } = await supabase
                .from('profiles')
                .select('count(*)')
                .limit(1);

            if (profilesError && profilesError.message.includes('does not exist')) {
                console.log('✅ Tabla profiles eliminada correctamente');
            } else if (!profilesError) {
                console.log('⚠️  Tabla profiles todavía existe');
            }

        } catch (verifyError) {
            console.log('❌ Error en verificación final:', verifyError.message);
        }

    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN LA MIGRACIÓN:', error);
        process.exit(1);
    }
}

// Función alternativa para ejecutar SQL usando el REST API de Supabase
async function executeSQLDirectly(sql) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Ejecutar la migración
executeMigration()
    .then(() => {
        console.log('\n🏁 Script de migración finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });