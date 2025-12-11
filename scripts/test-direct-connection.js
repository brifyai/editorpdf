#!/usr/bin/env node

/**
 * Script para probar conexión directa a Supabase con diferentes keys
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

// Intentar con service role key (si existe)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

console.log('🔍 Probando conexión directa a Supabase...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Anon Key:', anonKey ? `${anonKey.substring(0, 10)}...` : 'No configurada');
console.log('🔑 Service Role Key:', serviceRoleKey !== anonKey ? `${serviceRoleKey.substring(0, 10)}...` : 'Usando Anon Key');

async function testConnection(key, keyType) {
    console.log(`\n🧪 Probando con ${keyType}...`);
    
    const supabase = createClient(supabaseUrl, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // Probar lista de tablas
        console.log('📋 Listando tablas...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['users', 'documents', 'document_analyses']);

        if (tablesError) {
            console.error('❌ Error listando tablas:', tablesError);
        } else {
            console.log('✅ Tablas encontradas:', tables.map(t => t.table_name).join(', '));
        }

        // Probar acceso a tabla users
        console.log('👤 Probando acceso a tabla users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, username')
            .limit(1);

        if (usersError) {
            console.error('❌ Error accediendo a users:', usersError);
        } else {
            console.log('✅ Acceso a users exitoso');
            if (users.length > 0) {
                console.log('   Usuario encontrado:', users[0].email);
            } else {
                console.log('   No hay usuarios (tabla vacía)');
            }
        }

        // Probar insert en users
        console.log('➕ Probando insert en users...');
        const testUser = {
            email: `test_${Date.now()}@example.com`,
            username: `testuser_${Date.now()}`,
            password_hash: 'test_hash_123',
            first_name: 'Test',
            last_name: 'User'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([testUser])
            .select('id, email, username')
            .single();

        if (insertError) {
            console.error('❌ Error insertando usuario:', insertError);
        } else {
            console.log('✅ Usuario insertado exitosamente:', insertData.email);
            
            // Limpiar usuario de prueba
            await supabase
                .from('users')
                .delete()
                .eq('id', insertData.id);
            console.log('🧹 Usuario de prueba eliminado');
        }

        return true;

    } catch (error) {
        console.error('❌ Error general:', error);
        return false;
    }
}

async function main() {
    // Probar con anon key
    const anonSuccess = await testConnection(anonKey, 'Anon Key');
    
    // Probar con service role key si es diferente
    if (serviceRoleKey !== anonKey) {
        const serviceSuccess = await testConnection(serviceRoleKey, 'Service Role Key');
        
        if (serviceSuccess && !anonSuccess) {
            console.log('\n💡 Recomendación: Usa la Service Role Key para operaciones administrativas');
            console.log('   Agrega SUPABASE_SERVICE_ROLE_KEY a tu archivo .env');
        }
    }

    // Verificar schema cache
    console.log('\n🔍 Verificando información del schema...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        const { data: schemaInfo, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('table_name, column_name, data_type')
            .eq('table_schema', 'public')
            .in('table_name', ['users', 'documents', 'document_analyses'])
            .order('table_name, ordinal_position');

        if (schemaError) {
            console.error('❌ Error obteniendo schema:', schemaError);
        } else {
            console.log('✅ Estructura del schema:');
            const currentTable = '';
            schemaInfo.forEach(col => {
                if (col.table_name !== currentTable) {
                    console.log(`\n📋 Tabla: ${col.table_name}`);
                }
                console.log(`   - ${col.column_name} (${col.data_type})`);
            });
        }
    } catch (error) {
        console.error('❌ Error verificando schema:', error);
    }

    console.log('\n🏁 Prueba de conexión completada');
}

main().catch(console.error);