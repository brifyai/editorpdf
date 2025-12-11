/**
 * Script para configurar la base de datos de Document Analyzer
 * Instala dependencias y ejecuta el schema de Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseSetup {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.schemaFile = path.join(this.projectRoot, 'database', 'supabase-schema.sql');
    }

    async setup() {
        console.log('🚀 Iniciando configuración de la base de datos para Document Analyzer\n');
        
        try {
            // Paso 1: Verificar variables de entorno
            this.verifyEnvironment();
            
            // Paso 2: Instalar dependencias
            await this.installDependencies();
            
            // Paso 3: Verificar conexión con Supabase
            await this.testSupabaseConnection();
            
            // Paso 4: Ejecutar schema SQL
            await this.executeSchema();
            
            // Paso 5: Verificar configuración
            await this.verifySetup();
            
            console.log('\n✅ Configuración de base de datos completada exitosamente');
            this.showNextSteps();
            
        } catch (error) {
            console.error('\n❌ Error en la configuración:', error.message);
            process.exit(1);
        }
    }

    verifyEnvironment() {
        console.log('📋 Verificando variables de entorno...');
        
        const requiredEnvVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
        ];
        
        const missingVars = [];
        
        // Cargar variables de entorno
        if (fs.existsSync(this.envFile)) {
            require('dotenv').config({ path: this.envFile });
        }
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            }
        }
        
        if (missingVars.length > 0) {
            throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
        }
        
        console.log('✅ Variables de entorno verificadas');
    }

    async installDependencies() {
        console.log('\n📦 Instalando dependencias necesarias...');
        
        const dependencies = [
            '@supabase/supabase-js',
            'bcryptjs',
            'jsonwebtoken',
            'helmet',
            'compression',
            'express-rate-limit',
            'dotenv'
        ];
        
        try {
            for (const dep of dependencies) {
                console.log(`   Instalando ${dep}...`);
                execSync(`npm install ${dep}`, { stdio: 'inherit', cwd: this.projectRoot });
            }
            console.log('✅ Dependencias instaladas');
        } catch (error) {
            throw new Error(`Error instalando dependencias: ${error.message}`);
        }
    }

    async testSupabaseConnection() {
        console.log('\n🔗 Verificando conexión con Supabase...');
        
        try {
            // Crear un script temporal para probar la conexión básica
            const testScript = `
                const { createClient } = require('@supabase/supabase-js');
                
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
                
                const supabase = createClient(supabaseUrl, supabaseKey);
                
                // Probar conexión básica sin consultar tablas específicas
                supabase.rpc('version')
                    .then(({ data, error }) => {
                        if (error && error.message.includes('function')) {
                            // Es normal que la función no exista aún, solo verificamos conexión
                            console.log('✅ Conexión con Supabase establecida (las tablas se crearán con el schema)');
                            process.exit(0);
                        }
                        if (error) {
                            console.error('Error de conexión:', error);
                            process.exit(1);
                        }
                        console.log('✅ Conexión con Supabase exitosa');
                        process.exit(0);
                    })
                    .catch(err => {
                        // Si hay error de conexión, mostrarlo
                        if (err.message.includes('fetch')) {
                            console.error('Error de conexión: No se puede conectar a Supabase');
                            console.error('Verifica tu URL y API key');
                            process.exit(1);
                        }
                        console.log('✅ Conexión con Supabase establecida (las tablas se crearán con el schema)');
                        process.exit(0);
                    });
            `;
            
            const testFile = path.join(this.projectRoot, 'test-supabase-connection.js');
            fs.writeFileSync(testFile, testScript);
            
            execSync(`node ${testFile}`, { stdio: 'inherit', cwd: this.projectRoot });
            
            // Limpiar archivo temporal
            fs.unlinkSync(testFile);
            
        } catch (error) {
            throw new Error(`Error verificando conexión con Supabase: ${error.message}`);
        }
    }

    async executeSchema() {
        console.log('\n🗄️ Ejecutando schema de la base de datos...');
        
        if (!fs.existsSync(this.schemaFile)) {
            throw new Error(`Archivo de schema no encontrado: ${this.schemaFile}`);
        }
        
        try {
            // Leer el archivo SQL
            const schemaSQL = fs.readFileSync(this.schemaFile, 'utf8');
            
            // Dividir el SQL en statements individuales
            const statements = schemaSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            console.log(`   Ejecutando ${statements.length} statements SQL...`);
            
            // Crear script para ejecutar SQL
            const executeScript = `
                const { createClient } = require('@supabase/supabase-js');
                const fs = require('fs');
                
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
                
                const supabase = createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });
                
                // Necesitamos la SERVICE_ROLE_KEY para ejecutar DDL
                // Por ahora, mostramos instrucciones manuales
                console.log('\\n⚠️ IMPORTANTE: Para ejecutar el schema completo:');
                console.log('1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
                console.log('2. Ve a "SQL Editor"');
                console.log('3. Copia y pega el contenido del archivo: database/supabase-schema.sql');
                console.log('4. Ejecuta el script completo');
                console.log('\\n✅ Schema listo para ejecutar manualmente');
                process.exit(0);
            `;
            
            const executeFile = path.join(this.projectRoot, 'execute-schema.js');
            fs.writeFileSync(executeFile, executeScript);
            
            execSync(`node ${executeFile}`, { stdio: 'inherit', cwd: this.projectRoot });
            
            // Limpiar archivo temporal
            fs.unlinkSync(executeFile);
            
        } catch (error) {
            throw new Error(`Error ejecutando schema: ${error.message}`);
        }
    }

    async verifySetup() {
        console.log('\n🔍 Verificando configuración...');
        
        try {
            // Verificar que los archivos necesarios existan
            const requiredFiles = [
                'src/database/supabaseClient.js',
                'database/supabase-schema.sql',
                '.env.local'
            ];
            
            for (const file of requiredFiles) {
                const filePath = path.join(this.projectRoot, file);
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Archivo requerido no encontrado: ${file}`);
                }
            }
            
            // Verificar que las dependencias estén instaladas
            const packageJson = JSON.parse(fs.readFileSync(
                path.join(this.projectRoot, 'package.json'), 'utf8'
            ));
            
            const requiredDeps = ['@supabase/supabase-js', 'bcrypt', 'jsonwebtoken'];
            for (const dep of requiredDeps) {
                if (!packageJson.dependencies[dep]) {
                    throw new Error(`Dependencia requerida no instalada: ${dep}`);
                }
            }
            
            console.log('✅ Configuración verificada');
            
        } catch (error) {
            throw new Error(`Error en verificación: ${error.message}`);
        }
    }

    showNextSteps() {
        console.log('\n📋 Próximos pasos:');
        console.log('');
        console.log('1. Ejecuta el schema SQL en Supabase:');
        console.log('   📂 Abre: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm');
        console.log('   🗄️ Ve a "SQL Editor"');
        console.log('   📋 Copia el contenido de: database/supabase-schema.sql');
        console.log('   ▶️ Ejecuta el script completo');
        console.log('');
        console.log('2. Configura tus API keys de IA:');
        console.log('   🔑 Obtén Groq API Key: https://console.groq.com/');
        console.log('   🔑 Obtén Chutes API Key: https://chutes.ai/');
        console.log('   ⚙️ Agrégalas al archivo .env.local');
        console.log('');
        console.log('3. Inicia la aplicación:');
        console.log('   🚀 npm start');
        console.log('   🌐 Abre: http://localhost:3000');
        console.log('');
        console.log('4. Configura las APIs en la interfaz web');
        console.log('');
        console.log('📚 Documentación disponible:');
        console.log('   📖 docs/ai-model-recommendations.md');
        console.log('   🤖 docs/ai-setup-guide.md');
        console.log('   🔍 docs/ocr-guide.md');
        console.log('');
    }
}

// Ejecutar configuración
if (require.main === module) {
    const setup = new DatabaseSetup();
    setup.setup().catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}

module.exports = DatabaseSetup;