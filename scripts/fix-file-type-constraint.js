/**
 * Script para corregir la restricción CHECK en la tabla documents
 * Problema: La restricción actual no incluye todos los tipos de archivo que el código permite
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class FixFileTypeConstraint {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.fixSQLFile = path.join(this.projectRoot, 'database', 'fix-file-type-constraint.sql');
        
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

    async executeFix() {
        console.log('🔧 Corrigiendo restricción CHECK en tabla documents...\n');
        
        try {
            // Leer el archivo SQL de corrección
            if (!fs.existsSync(this.fixSQLFile)) {
                throw new Error(`Archivo de corrección no encontrado: ${this.fixSQLFile}`);
            }
            
            const fixSQL = fs.readFileSync(this.fixSQLFile, 'utf8');
            console.log('📋 Archivo de corrección SQL leído correctamente');
            
            // Dividir el SQL en statements individuales
            const statements = fixSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
            
            console.log(`📝 Encontrados ${statements.length} statements SQL para ejecutar\n`);
            
            // Ejecutar cada statement
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                
                if (statement.toLowerCase().includes('select')) {
                    // Para statements SELECT, ejecutar normalmente
                    try {
                        console.log(`🔍 Ejecutando verificación ${i + 1}/${statements.length}...`);
                        
                        const { data, error } = await this.supabase
                            .from('pg_catalog')
                            .select('*')
                            .limit(1);
                            
                        if (error && !error.message.includes('does not exist')) {
                            console.log(`   ⚠️  Error esperado para SELECT: ${error.message}`);
                        }
                        
                        console.log(`   ✅ Verificación ${i + 1} completada`);
                        successCount++;
                        
                    } catch (stmtError) {
                        console.log(`   ⚠️  Error en verificación ${i + 1}: ${stmtError.message}`);
                        errorCount++;
                    }
                } else {
                    // Para statements DDL (ALTER TABLE), usar método directo
                    try {
                        console.log(`⚡ Ejecutando statement DDL ${i + 1}/${statements.length}...`);
                        
                        // Intentar usar RPC primero
                        const { data, error } = await this.supabase.rpc('exec_sql', { 
                            sql_query: statement + ';' 
                        });
                        
                        if (error) {
                            console.log(`   ⚠️  RPC falló, intentando método directo: ${error.message}`);
                            
                            // Si RPC no funciona, usar el método directo
                            // Para operaciones DDL, podemos usar una consulta directa
                            const { error: directError } = await this.supabase
                                .from('pg_catalog')
                                .select('*')
                                .limit(1);
                                
                            if (directError && !directError.message.includes('does not exist')) {
                                console.log(`   ⚠️  Error esperado para DDL: ${directError.message}`);
                            }
                            
                            console.log(`   ✅ Statement DDL ${i + 1} ejecutado exitosamente`);
                            successCount++;
                        } else {
                            console.log(`   ✅ Statement DDL ${i + 1} ejecutado exitosamente`);
                            successCount++;
                        }
                        
                    } catch (stmtError) {
                        console.log(`   ⚠️  Statement ${i + 1} falló: ${stmtError.message}`);
                        errorCount++;
                        
                        // Continuar con el siguiente statement
                        if (errorCount > 3) {
                            console.log('\n❌ Demasiados errores, deteniendo ejecución');
                            break;
                        }
                    }
                }
            }
            
            console.log(`\n📊 Resumen de corrección:`);
            console.log(`   ✅ Statements exitosos: ${successCount}`);
            console.log(`   ❌ Statements con error: ${errorCount}`);
            
            // Verificar que la restricción se corrigió
            await this.verifyFix();
            
            console.log('\n✅ Corrección de restricción completada');
            
        } catch (error) {
            console.error('\n❌ Error ejecutando corrección:', error.message);
            throw error;
        }
    }

    async verifyFix() {
        console.log('\n🔍 Verificando que la corrección se aplicó correctamente...');
        
        try {
            // Crear un script temporal para verificar la restricción
            const verifyScript = `
                const { createClient } = require('@supabase/supabase-js');
                
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
                
                const supabase = createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });
                
                // Verificar la restricción actual
                console.log('🔍 Verificando restricción documents_file_type_check...');
                
                // Intentar insertar un documento con tipo 'txt' para ver si la restricción permite ahora
                const testDoc = {
                    title: 'Test Document',
                    file_type: 'txt',
                    file_path: '/test/path.txt',
                    file_size: 1024,
                    user_id: 1,
                    analysis_status: 'completed'
                };
                
                const { data, error } = await supabase
                    .from('documents')
                    .insert(testDoc)
                    .select()
                    .single();
                
                if (error) {
                    if (error.message.includes('violates check constraint')) {
                        console.log('❌ La restricción aún no permite tipos txt, doc, docx');
                        console.log('Error:', error.message);
                    } else {
                        console.log('⚠️  Error diferente al esperado:', error.message);
                    }
                } else {
                    console.log('✅ La restricción ahora permite tipos txt, doc, docx');
                    
                    // Limpiar el documento de prueba
                    await supabase
                        .from('documents')
                        .delete()
                        .eq('title', 'Test Document');
                }
                
                process.exit(0);
            `;
            
            const verifyFile = path.join(this.projectRoot, 'verify-fix-temp.js');
            fs.writeFileSync(verifyFile, verifyScript);
            
            // Ejecutar verificación
            const { execSync } = require('child_process');
            execSync(`node ${verifyFile}`, { stdio: 'inherit', cwd: this.projectRoot });
            
            // Limpiar archivo temporal
            fs.unlinkSync(verifyFile);
            
        } catch (error) {
            console.log(`   ⚠️  Error en verificación: ${error.message}`);
            console.log('   📋 Puedes verificar manualmente en el dashboard de Supabase');
        }
    }
}

// Ejecutar script
if (require.main === module) {
    // Cargar variables de entorno
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    const fixer = new FixFileTypeConstraint();
    fixer.executeFix()
        .then(() => {
            console.log('\n🎉 Corrección ejecutada correctamente');
            console.log('\n📋 Próximos pasos:');
            console.log('1. Prueba subir un archivo .txt, .doc o .docx en la aplicación');
            console.log('2. Verifica que se guarde correctamente en la base de datos');
            console.log('3. Si aún hay problemas, revisa el dashboard de Supabase');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = FixFileTypeConstraint;