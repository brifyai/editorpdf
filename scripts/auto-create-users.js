/**
 * Script automático para crear la tabla users
 * Intenta múltiples métodos y proporciona instrucciones claras
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function autoCreateUsers() {
    console.log('🚀 Script automático para crear tabla users\n');
    
    // Cargar variables de entorno
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Faltan credenciales de Supabase en .env.local');
        process.exit(1);
    }
    
    console.log('📋 Configuración:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 10)}...`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Paso 1: Verificar si la tabla ya existe
        console.log('\n🔍 Paso 1: Verificando si la tabla users existe...');
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);
                
            if (!error) {
                console.log('✅ ¡La tabla users ya existe!');
                
                // Intentar crear el usuario Camilo Alegria directamente
                console.log('\n🧪 Intentando crear usuario Camilo Alegria...');
                
                const userData = {
                    email: 'camiloalegriabarra@gmail.com',
                    username: 'camiloalegria',
                    password: 'Antonito26$',
                    firstName: 'Camilo',
                    lastName: 'Alegria'
                };
                
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([userData])
                    .select('id, email, username, first_name, last_name')
                    .single();
                    
                if (createError) {
                    console.log('❌ Error creando usuario:', createError.message);
                    
                    if (createError.message.includes('duplicate')) {
                        console.log('ℹ️  El usuario ya existe. Intentando hacer login...');
                        
                        // Intentar login para obtener el token
                        const loginData = {
                            email: 'camiloalegriabarra@gmail.com',
                            password: 'Antonito26$'
                        };
                        
                        console.log('\n🔑 Para obtener el token, ejecuta:');
                        console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginData)}'`);
                    }
                } else {
                    console.log('✅ ¡Usuario Camilo Alegria creado exitosamente!');
                    console.log('   ID:', newUser.id);
                    console.log('   Email:', newUser.email);
                    console.log('   Username:', newUser.username);
                    
                    // Generar token
                    const token = newUser.id.toString();
                    console.log('   Token:', token);
                    
                    console.log('\n🎉 ¡Listo! Ya puedes usar la aplicación con este usuario.');
                }
                
                return;
            }
        } catch (verifyError) {
            console.log('⚠️  La tabla users no existe:', verifyError.message);
        }
        
        // Paso 2: Intentar crear la tabla usando el método de inserción forzada
        console.log('\n🔧 Paso 2: Intentando crear tabla users...');
        
        // Leer el SQL completo
        const sqlFile = path.join(__dirname, 'create-users-complete.sql');
        if (fs.existsSync(sqlFile)) {
            console.log('📄 Archivo SQL encontrado:', sqlFile);
            
            const sqlContent = fs.readFileSync(sqlFile, 'utf8');
            
            console.log('\n📋 INSTRUCCIONES MANUALES:');
            console.log('='.repeat(60));
            console.log('1. Abre tu navegador y ve a:');
            console.log('   https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
            console.log('\n2. Inicia sesión en tu cuenta de Supabase');
            console.log('\n3. En el menú lateral, haz clic en "SQL Editor"');
            console.log('\n4. Copia todo el contenido del archivo:');
            console.log(`   ${sqlFile}`);
            console.log('\n5. Pégalo en el editor SQL y haz clic en "Run"');
            console.log('\n6. Espera a que se ejecute completamente');
            console.log('\n7. Vuelve a esta terminal y ejecuta:');
            console.log('   node scripts/auto-create-users.js');
            console.log('\n8. O intenta crear el usuario directamente con:');
            console.log(`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "camiloalegriabarra@gmail.com",
    "username": "camiloalegria",
    "password": "Antonito26$",
    "firstName": "Camilo",
    "lastName": "Alegria"
  }'`);
            console.log('='.repeat(60));
            
            // También mostrar el SQL directamente
            console.log('\n📄 SQL PARA EJECUTAR (copia y pega en Supabase):');
            console.log('-'.repeat(60));
            
            // Extraer solo el CREATE TABLE y políticas
            const lines = sqlContent.split('\n');
            let inCreateSection = false;
            let sqlToShow = '';
            
            for (const line of lines) {
                if (line.includes('CREATE TABLE IF NOT EXISTS public.users')) {
                    inCreateSection = true;
                }
                
                if (inCreateSection) {
                    sqlToShow += line + '\n';
                    
                    if (line.includes('EXECUTE FUNCTION public.handle_updated_at()')) {
                        break;
                    }
                }
            }
            
            console.log(sqlToShow);
            console.log('-'.repeat(60));
            
        } else {
            console.log('❌ No se encontró el archivo SQL');
        }
        
        console.log('\n🎯 RESUMEN:');
        console.log('1. La tabla users no existe en la base de datos');
        console.log('2. Necesitas crearla manualmente en el dashboard de Supabase');
        console.log('3. Usa el SQL proporcionado arriba');
        console.log('4. Una vez creada, podrás registrar usuarios normalmente');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n📋 Solución:');
        console.log('1. Ve a: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
        console.log('2. Ve a "SQL Editor"');
        console.log('3. Ejecuta el SQL del archivo: scripts/create-users-complete.sql');
        console.log('4. Luego intenta crear el usuario nuevamente');
    }
}

// Ejecutar script
if (require.main === module) {
    autoCreateUsers()
        .then(() => {
            console.log('\n✅ Script completado');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { autoCreateUsers };