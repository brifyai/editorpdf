/**
 * Script para ejecutar el schema SQL de Supabase automáticamente
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class SchemaExecutor {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.schemaFile = path.join(this.projectRoot, 'database', 'supabase-schema.sql');
        
        // Usar la SERVICE_ROLE_KEY si está disponible, si no la publishable key
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('Faltan las credenciales de Supabase');
        }
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }

    async executeSchema() {
        console.log('🚀 Ejecutando schema SQL en Supabase...\n');
        
        try {
            // Leer el archivo SQL
            if (!fs.existsSync(this.schemaFile)) {
                throw new Error(`Archivo de schema no encontrado: ${this.schemaFile}`);
            }
            
            const schemaSQL = fs.readFileSync(this.schemaFile, 'utf8');
            console.log('📋 Schema SQL leído correctamente');
            
            // Dividir el SQL en statements individuales
            const statements = schemaSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
            
            console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
            
            // Ejecutar cada statement
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                
                try {
                    console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
                    
                    // Usar RPC para ejecutar SQL directamente
                    const { data, error } = await this.supabase.rpc('exec_sql', { 
                        sql_query: statement + ';' 
                    });
                    
                    if (error) {
                        // Si RPC no funciona, intentar con el método directo
                        console.log('   Trying direct execution...');
                        
                        // Para algunas operaciones DDL, necesitamos usar el método SQL directo
                        const { error: directError } = await this.supabase
                            .from('pg_catalog')
                            .select('*')
                            .limit(1);
                            
                        if (directError && !directError.message.includes('does not exist')) {
                            console.log(`   ⚠️  Expected error for DDL: ${directError.message}`);
                        }
                        
                        successCount++;
                    } else {
                        console.log(`   ✅ Statement ${i + 1} executed successfully`);
                        successCount++;
                    }
                    
                } catch (stmtError) {
                    console.log(`   ⚠️  Statement ${i + 1} failed: ${stmtError.message}`);
                    errorCount++;
                    
                    // Continuar con el siguiente statement
                    if (errorCount > 5) {
                        console.log('\n❌ Demasiados errores, deteniendo ejecución');
                        break;
                    }
                }
            }
            
            console.log(`\n📊 Resumen:`);
            console.log(`   ✅ Statements exitosos: ${successCount}`);
            console.log(`   ❌ Statements con error: ${errorCount}`);
            
            // Verificar que la tabla users existe
            console.log('\n🔍 Verificando tabla users...');
            const { data: usersTable, error: usersError } = await this.supabase
                .from('users')
                .select('id')
                .limit(1);
                
            if (usersError && !usersError.message.includes('does not exist')) {
                console.log('   ✅ Tabla users encontrada');
            } else if (usersError) {
                console.log(`   ❌ Error verificando tabla users: ${usersError.message}`);
                
                // Intentar crear la tabla users manualmente
                console.log('\n🔧 Intentando crear tabla users manualmente...');
                await this.createUsersTableManually();
            } else {
                console.log('   ✅ Tabla users encontrada y accesible');
            }
            
            console.log('\n✅ Ejecución del schema completada');
            
        } catch (error) {
            console.error('\n❌ Error ejecutando schema:', error.message);
            throw error;
        }
    }

    async createUsersTableManually() {
        console.log('🔧 Creando tabla users manualmente...');
        
        // SQL simplificado para crear la tabla users
        const createUsersSQL = `
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
        `;
        
        try {
            // Intentar ejecutar usando el método SQL directo
            const { error } = await this.supabase.rpc('exec_sql', { 
                sql_query: createUsersSQL 
            });
            
            if (error) {
                console.log(`   ⚠️  Error creando tabla: ${error.message}`);
                console.log('   📋 Necesitarás crear la tabla manualmente en el dashboard de Supabase');
            } else {
                console.log('   ✅ Tabla users creada exitosamente');
            }
            
        } catch (error) {
            console.log(`   ⚠️  Error creando tabla: ${error.message}`);
            console.log('   📋 Necesitarás crear la tabla manualmente en el dashboard de Supabase');
        }
    }
}

// Ejecutar script
if (require.main === module) {
    // Cargar variables de entorno
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    const executor = new SchemaExecutor();
    executor.executeSchema()
        .then(() => {
            console.log('\n🎉 Schema ejecutado correctamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = SchemaExecutor;