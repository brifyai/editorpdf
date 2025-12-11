/**
 * Script para verificar la conexión a Supabase usando REST API
 */

require('dotenv').config();

async function checkSupabaseRest() {
    console.log('🔍 Verificando conexión a Supabase via REST API...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Credenciales de Supabase no configuradas');
        console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
        console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', supabaseKey ? '✅' : '❌');
        return;
    }
    
    console.log(`📡 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
    
    try {
        // 1. Verificar conexión básica
        console.log('\n📋 Verificando conexión básica...');
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Conexión REST API establecida');
        } else {
            console.log('❌ Error en conexión REST API:', response.status, response.statusText);
            return;
        }
        
        // 2. Listar tablas disponibles
        console.log('\n📊 Listando tablas disponibles...');
        const tablesResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Accept': 'application/vnd.pgrst.object+json'
            }
        });
        
        if (tablesResponse.ok) {
            const tables = await tablesResponse.json();
            console.log('Tablas encontradas:', tables);
        }
        
        // 3. Verificar tabla users
        console.log('\n👥 Verificando tabla users...');
        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (usersResponse.ok) {
            const count = usersResponse.headers.get('content-range');
            console.log('✅ Tabla users accesible');
            console.log(`📊 Registros en users: ${count}`);
            
            // Obtener algunos usuarios
            const usersDataResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,username,email,created_at&limit=5`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            
            if (usersDataResponse.ok) {
                const users = await usersDataResponse.json();
                console.log('👤 Usuarios encontrados:');
                users.forEach(user => {
                    console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
                });
                
                // Buscar específicamente a Camilo Alegria
                const camiloUser = users.find(u => u.username === 'Camilo Alegria' || u.email === 'camilo@alegria.com');
                if (camiloUser) {
                    console.log('✅ Usuario Camilo Alegria encontrado:', camiloUser);
                } else {
                    console.log('❌ Usuario Camilo Alegria no encontrado');
                }
            }
        } else {
            console.log('❌ Error accediendo a tabla users:', usersResponse.status, usersResponse.statusText);
            
            if (usersResponse.status === 404) {
                console.log('💡 La tabla users no existe. ¿Necesita crearla?');
            } else if (usersResponse.status === 401 || usersResponse.status === 403) {
                console.log('💡 Problema de permisos. Verifique las API keys.');
            }
        }
        
        // 4. Buscar tablas de análisis
        console.log('\n📈 Buscando tablas de análisis...');
        const analysisTables = ['analysis_results_basic', 'analysis_results_basic_2', 'analysis_results', 'document_analysis'];
        
        for (const tableName of analysisTables) {
            const tableResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count&limit=1`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'count=exact'
                }
            });
            
            if (tableResponse.ok) {
                const count = tableResponse.headers.get('content-range');
                console.log(`✅ Tabla ${tableName}: ${count} registros`);
                
                // Verificar estructura de la tabla
                const structureResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                });
                
                if (structureResponse.ok) {
                    const sampleData = await structureResponse.json();
                    if (sampleData.length > 0) {
                        const columns = Object.keys(sampleData[0]);
                        console.log(`  Columnas: ${columns.join(', ')}`);
                        
                        const hasPageCount = columns.includes('page_count');
                        console.log(`  ¿Tiene page_count? ${hasPageCount ? '✅ Sí' : '❌ No'}`);
                        
                        if (tableName === 'analysis_results_basic_2' && !hasPageCount) {
                            console.log('  🚨 Esta es la tabla que causa el error de page_count');
                        }
                    }
                }
            } else if (tableResponse.status === 404) {
                console.log(`❌ Tabla ${tableName} no existe`);
            } else {
                console.log(`⚠️ Error en tabla ${tableName}: ${tableResponse.status}`);
            }
        }
        
        console.log('\n✅ Verificación REST API completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Posibles soluciones:');
            console.log('  1. Verificar la URL de Supabase');
            console.log('  2. Verificar conexión a internet');
            console.log('  3. Revisar firewall o proxy');
        }
    }
}

// Ejecutar verificación
checkSupabaseRest();