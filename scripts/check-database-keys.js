/**
 * Script para verificar las API keys guardadas en la base de datos
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseKeys() {
    console.log('🔍 Verificando API keys en la base de datos...\n');

    // Verificar si tenemos las credenciales de Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('❌ No se encontraron credenciales de Supabase en el entorno');
        return;
    }

    // Crear cliente de Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    try {
        // Verificar la tabla user_configurations
        console.log('📋 Consultando tabla user_configurations...');
        
        const { data: configs, error } = await supabase
            .from('user_configurations')
            .select('*');

        if (error) {
            console.error('❌ Error consultando user_configurations:', error.message);
            return;
        }

        console.log(`✅ Encontrados ${configs?.length || 0} registros de configuración`);

        if (configs && configs.length > 0) {
            configs.forEach((config, index) => {
                console.log(`\n📝 Configuración ${index + 1}:`);
                console.log(`   ID: ${config.id}`);
                console.log(`   User ID: ${config.user_id}`);
                console.log(`   Groq API Key: ${config.groq_api_key ? 
                    `${config.groq_api_key.substring(0, 7)}... (longitud: ${config.groq_api_key.length})` : 
                    'No configurada'}`);
                console.log(`   Chutes API Key: ${config.chutes_api_key ? 
                    `${config.chutes_api_key.substring(0, 7)}... (longitud: ${config.chutes_api_key.length})` : 
                    'No configurada'}`);
                console.log(`   Creado: ${config.created_at}`);
                console.log(`   Actualizado: ${config.updated_at}`);
            });
        } else {
            console.log('ℹ️ No se encontraron configuraciones guardadas');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Verificar si hay algún usuario para obtener su ID
        console.log('👥 Consultando tabla users...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .limit(5);

        if (usersError) {
            console.error('❌ Error consultando users:', usersError.message);
        } else {
            console.log(`✅ Encontrados ${users?.length || 0} usuarios`);
            
            if (users && users.length > 0) {
                users.forEach((user, index) => {
                    console.log(`\n👤 Usuario ${index + 1}:`);
                    console.log(`   ID: ${user.id}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
                });
            }
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Recomendaciones
        console.log('💡 Recomendaciones:');
        
        if (configs && configs.length > 0) {
            const hasValidGroqKey = configs.some(config => 
                config.groq_api_key && 
                config.groq_api_key !== 'gsk_your_groq_api_key_here' &&
                config.groq_api_key.length > 30
            );
            
            const hasValidChutesKey = configs.some(config => 
                config.chutes_api_key && 
                config.chutes_api_key !== 'your_chutes_api_key_here' &&
                config.chutes_api_key.length > 20
            );

            if (hasValidGroqKey) {
                console.log('   ✅ Se encontraron API keys de Groq válidas en la base de datos');
                console.log('   🔧 El servidor debería cargar automáticamente estas claves');
            } else {
                console.log('   ❌ No se encontraron API keys de Groq válidas en la base de datos');
                console.log('   🔧 Actualiza las claves usando el endpoint /api/save-ai-config');
            }

            if (hasValidChutesKey) {
                console.log('   ✅ Se encontraron API keys de Chutes.ai válidas en la base de datos');
            } else {
                console.log('   ❌ No se encontraron API keys de Chutes.ai válidas en la base de datos');
                console.log('   🔧 Actualiza las claves usando el endpoint /api/save-ai-config');
            }
        } else {
            console.log('   ℹ️ No hay configuraciones guardadas en la base de datos');
            console.log('   🔧 Usa el endpoint /api/save-ai-config para guardar tus API keys');
        }

        console.log('\n🏁 Verificación completada');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar verificación
checkDatabaseKeys().catch(console.error);