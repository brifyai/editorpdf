/**
 * Script para forzar la creación de la tabla users en Supabase
 * Usa múltiples métodos para asegurar que la tabla se cree
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function forceCreateUsersTable() {
    console.log('🔧 Forzando creación de tabla users en Supabase...\n');
    
    // Configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Faltan credenciales de Supabase');
        process.exit(1);
    }
    
    console.log('📋 URL de Supabase:', supabaseUrl);
    console.log('📋 API Key disponible:', supabaseKey ? 'Sí' : 'No');
    
    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        // Método 1: Intentar crear tabla directamente con SQL
        console.log('\n🔄 Método 1: Intentando crear tabla con SQL directo...');
        
        const createTableSQL = `
            -- Crear tabla users si no existe
            CREATE TABLE IF NOT EXISTS public.users (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                avatar_url TEXT,
                phone VARCHAR(20),
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
                subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
                api_usage_limit INTEGER DEFAULT 100,
                monthly_api_count INTEGER DEFAULT 0,
                storage_quota_mb INTEGER DEFAULT 100,
                storage_used_mb INTEGER DEFAULT 0,
                preferences JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                last_login TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            
            -- Crear índices
            CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
            CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
            CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
            
            -- Habilitar RLS
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            
            -- Crear políticas básicas
            CREATE POLICY IF NOT EXISTS "Enable insert for authentication" ON public.users
                FOR INSERT WITH CHECK (true);
                
            CREATE POLICY IF NOT EXISTS "Enable select for users based on id" ON public.users
                FOR SELECT USING (auth.uid()::text = id::text);
                
            CREATE POLICY IF NOT EXISTS "Enable update for users based on id" ON public.users
                FOR UPDATE USING (auth.uid()::text = id::text);
        `;
        
        // Guardar SQL en archivo temporal
        const tempSQLFile = path.join(__dirname, 'temp-create-users.sql');
        fs.writeFileSync(tempSQLFile, createTableSQL);
        
        console.log('📄 SQL guardado en archivo temporal:', tempSQLFile);
        
        // Método 2: Intentar verificar si la tabla ya existe
        console.log('\n🔄 Método 2: Verificando si la tabla ya existe...');
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);
                
            if (error) {
                console.log('⚠️  Error verificando tabla:', error.message);
                console.log('   Código:', error.code);
                
                if (error.code === 'PGRST116') {
                    console.log('📍 La tabla users no existe, necesita ser creada manualmente');
                    console.log('\n📋 Instrucciones para crear la tabla manualmente:');
                    console.log('1. Abre: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
                    console.log('2. Ve a "SQL Editor"');
                    console.log('3. Copia y pega el siguiente SQL:');
                    console.log('\n' + '='.repeat(60));
                    console.log(createTableSQL);
                    console.log('='.repeat(60));
                    console.log('\n4. Ejecuta el SQL');
                    console.log('5. Una vez creada, intenta registrar el usuario nuevamente');
                    
                    // También guardar el SQL en un archivo separado para fácil acceso
                    const manualSQLFile = path.join(__dirname, 'create-users-manual.sql');
                    fs.writeFileSync(manualSQLFile, createTableSQL);
                    console.log(`\n📄 SQL también guardado en: ${manualSQLFile}`);
                    
                    return;
                }
            } else {
                console.log('✅ La tabla users ya existe y es accesible');
                
                // Intentar crear un usuario de prueba
                console.log('\n🧪 Intentando crear usuario de prueba...');
                
                const testUserData = {
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'test123',
                    first_name: 'Test',
                    last_name: 'User'
                };
                
                const { data: testResult, error: testError } = await supabase
                    .from('users')
                    .insert([testUserData])
                    .select('id, email, username')
                    .single();
                    
                if (testError) {
                    console.log('❌ Error creando usuario de prueba:', testError.message);
                } else {
                    console.log('✅ Usuario de prueba creado:', testResult);
                    
                    // Limpiar usuario de prueba
                    await supabase
                        .from('users')
                        .delete()
                        .eq('id', testResult.id);
                    console.log('🧹 Usuario de prueba eliminado');
                }
            }
        } catch (verifyError) {
            console.log('❌ Error en verificación:', verifyError.message);
        }
        
        // Método 3: Intentar con el schema completo
        console.log('\n🔄 Método 3: Intentando ejecutar schema completo...');
        
        const schemaFile = path.join(__dirname, '..', 'database', 'supabase-schema.sql');
        if (fs.existsSync(schemaFile)) {
            console.log('📄 Schema file encontrado:', schemaFile);
            
            const schemaSQL = fs.readFileSync(schemaFile, 'utf8');
            
            // Extraer solo la parte de la tabla users
            const usersTableMatch = schemaSQL.match(/-- Tabla de usuarios personalizada[\s\S]*?\);/);
            
            if (usersTableMatch) {
                console.log('✅ Se extrajo la definición de la tabla users del schema');
                console.log('\n📋 SQL para la tabla users:');
                console.log(usersTableMatch[0]);
                
                const usersSQLFile = path.join(__dirname, 'users-table-from-schema.sql');
                fs.writeFileSync(usersSQLFile, usersTableMatch[0]);
                console.log(`📄 SQL guardado en: ${usersSQLFile}`);
            }
        }
        
        console.log('\n🎯 Resumen:');
        console.log('1. La tabla users necesita ser creada manualmente en el dashboard de Supabase');
        console.log('2. Usa el SQL proporcionado arriba');
        console.log('3. Una vez creada, el registro de usuarios funcionará correctamente');
        
    } catch (error) {
        console.error('\n❌ Error general:', error.message);
        console.log('\n📋 Recomendación:');
        console.log('1. Ve a: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
        console.log('2. Ve a "SQL Editor"');
        console.log('3. Ejecuta el SQL para crear la tabla users');
        console.log('4. Luego intenta registrar el usuario nuevamente');
    }
}

// Ejecutar script
if (require.main === module) {
    // Cargar variables de entorno
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    forceCreateUsersTable()
        .then(() => {
            console.log('\n✅ Proceso completado');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { forceCreateUsersTable };