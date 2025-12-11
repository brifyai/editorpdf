/**
 * Script para crear la tabla users directamente en Supabase
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function createUsersTable() {
    console.log('🔧 Creando tabla users en Supabase...\n');
    
    // Usar SERVICE_ROLE_KEY para tener permisos de administrador
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Faltan credenciales de administrador');
        console.log('   Se necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }
    
    // Crear cliente con SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        // SQL para crear la tabla users
        const createTableSQL = `
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
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
            CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
            CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
            
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view own user record" ON public.users
                FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);
            
            CREATE POLICY "Users can update own user record" ON public.users
                FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);
            
            CREATE POLICY "Users can insert own user record" ON public.users
                FOR INSERT WITH CHECK (true);
                
            CREATE POLICY "Allow read access for authenticated users" ON public.users
                FOR SELECT USING (auth.role() = 'authenticated');
        `;
        
        console.log('📋 Ejecutando SQL para crear tabla users...');
        
        // Usar RPC para ejecutar SQL (si está disponible)
        try {
            const { data, error } = await supabase.rpc('exec_sql', { 
                sql_query: createTableSQL 
            });
            
            if (error) {
                console.log('⚠️  RPC exec_sql no disponible, intentando método alternativo...');
                throw error;
            }
            
            console.log('✅ Tabla users creada exitosamente via RPC');
            
        } catch (rpcError) {
            console.log('🔄 Intentando crear tabla mediante inserción de prueba...');
            
            // Intentar crear tabla forzando un error que la cree
            try {
                const { error: testError } = await supabase
                    .from('users')
                    .select('id')
                    .limit(1);
                    
                if (testError && testError.code === 'PGRST116') {
                    // La tabla no existe, necesitamos crearla manualmente
                    console.log('❌ La tabla users no existe. Debe ser creada manualmente en el dashboard de Supabase.');
                    console.log('\n📋 Instrucciones manuales:');
                    console.log('1. Ve a: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
                    console.log('2. Ve a "SQL Editor"');
                    console.log('3. Ejecuta el siguiente SQL:');
                    console.log('\n' + createTableSQL);
                    console.log('\n4. Una vez creada la tabla, intenta registrar el usuario nuevamente.');
                    process.exit(1);
                } else if (!testError) {
                    console.log('✅ La tabla users ya existe');
                } else {
                    throw testError;
                }
            } catch (testError) {
                console.log('❌ Error verificando tabla:', testError.message);
                console.log('\n📋 La tabla debe ser creada manualmente en el dashboard de Supabase.');
                console.log('   Ve a: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
                console.log('   Ve a "SQL Editor" y ejecuta el SQL proporcionado arriba.');
                process.exit(1);
            }
        }
        
        // Verificar que la tabla existe
        console.log('\n🔍 Verificando que la tabla users existe...');
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
        if (testError) {
            console.error('❌ Error verificando tabla:', testError);
            throw testError;
        }
        
        console.log('✅ Tabla users verificada y accesible');
        
        // Intentar crear un usuario de prueba
        console.log('\n🧪 Creando usuario de prueba...');
        const bcrypt = require('bcrypt');
        const testPassword = await bcrypt.hash('test123', 10);
        
        const { data: testUser, error: createError } = await supabase
            .from('users')
            .insert([{
                email: 'test@example.com',
                username: 'testuser',
                password_hash: testPassword,
                first_name: 'Test',
                last_name: 'User',
                is_active: true
            }])
            .select('id, email, username')
            .single();
            
        if (createError) {
            console.error('❌ Error creando usuario de prueba:', createError);
            throw createError;
        }
        
        console.log('✅ Usuario de prueba creado:', testUser.email);
        
        // Limpiar usuario de prueba
        await supabase
            .from('users')
            .delete()
            .eq('id', testUser.id);
            
        console.log('🧹 Usuario de prueba eliminado');
        
        console.log('\n🎉 Tabla users creada y verificada exitosamente');
        console.log('\n📋 Ahora puedes crear el usuario "Camilo Alegria" con:');
        console.log('   Email: camiloalegriabarra@gmail.com');
        console.log('   Username: camiloalegria');
        console.log('   Password: Antonito26$');
        
    } catch (error) {
        console.error('\n❌ Error creando tabla users:', error);
        console.log('\n📋 Si el error persiste, crea la tabla manualmente en:');
        console.log('   https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
        console.log('   Ve a "SQL Editor" y ejecuta el SQL correspondiente.');
        process.exit(1);
    }
}

// Ejecutar script
if (require.main === module) {
    // Cargar variables de entorno
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    createUsersTable()
        .then(() => {
            console.log('\n✅ Proceso completado exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { createUsersTable };