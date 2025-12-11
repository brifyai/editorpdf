/**
 * Script para probar que los documentos se guardan correctamente después de la corrección
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

class TestDocumentUpload {
    constructor() {
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

    async testDocumentTypes() {
        console.log('🧪 Probando guardado de documentos con diferentes tipos...\n');
        
        const testTypes = ['txt', 'doc', 'docx', 'pdf', 'pptx'];
        const results = [];
        
        for (const fileType of testTypes) {
            try {
                console.log(`📄 Probando tipo: ${fileType}`);
                
                const testDoc = {
                    original_filename: `Test Document ${fileType.toUpperCase()}.${fileType}`,
                    file_type: fileType,
                    file_path: `/test/path.${fileType}`,
                    file_size_bytes: 1024,
                    user_int_id: 2, // Usar user_int_id para IDs numéricos
                    processing_status: 'completed',
                    mime_type: `application/${fileType === 'txt' ? 'text' : fileType}`,
                    file_hash: `test_hash_${Date.now()}`,
                    storage_url: `/storage/test/path.${fileType}`,
                    is_processed: true
                };
                
                const { data, error } = await this.supabase
                    .from('documents')
                    .insert(testDoc)
                    .select()
                    .single();
                
                if (error) {
                    if (error.message.includes('violates check constraint')) {
                        console.log(`   ❌ FALLO: Restricción aún bloquea tipo "${fileType}"`);
                        console.log(`   Error: ${error.message}`);
                        results.push({ type: fileType, status: 'failed', error: error.message });
                    } else {
                        console.log(`   ⚠️  Error diferente: ${error.message}`);
                        results.push({ type: fileType, status: 'other_error', error: error.message });
                    }
                } else {
                    console.log(`   ✅ ÉXITO: Tipo "${fileType}" guardado correctamente`);
                    results.push({ type: fileType, status: 'success', id: data.id });
                    
                    // Limpiar documento de prueba
                    await this.supabase
                        .from('documents')
                        .delete()
                        .eq('id', data.id);
                }
                
            } catch (err) {
                console.log(`   💥 Error inesperado: ${err.message}`);
                results.push({ type: fileType, status: 'unexpected_error', error: err.message });
            }
            
            console.log(''); // Línea en blanco para separar
        }
        
        this.showResults(results);
    }

    showResults(results) {
        console.log('📊 RESULTADOS DE LA PRUEBA:');
        console.log('='.repeat(50));
        
        const success = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const other = results.filter(r => r.status !== 'success' && r.status !== 'failed').length;
        
        console.log(`✅ Tipos que funcionan: ${success}`);
        console.log(`❌ Tipos que fallan: ${failed}`);
        console.log(`⚠️  Otros errores: ${other}`);
        console.log('');
        
        if (failed > 0) {
            console.log('🔧 TIPOS QUE AÚN FALLAN:');
            results.filter(r => r.status === 'failed').forEach(r => {
                console.log(`   - ${r.type}: ${r.error}`);
            });
            console.log('');
            console.log('📋 SOLUCIÓN:');
            console.log('1. Ve a Supabase Dashboard');
            console.log('2. Ejecuta el SQL de corrección en SQL Editor');
            console.log('3. Vuelve a ejecutar esta prueba');
        }
        
        if (success === results.length) {
            console.log('🎉 ¡TODOS LOS TIPOS DE ARCHIVO FUNCIONAN CORRECTAMENTE!');
            console.log('✅ El problema de guardado de documentos está resuelto');
        }
    }
}

// Ejecutar prueba
if (require.main === module) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    const tester = new TestDocumentUpload();
    tester.testDocumentTypes()
        .then(() => {
            console.log('\n🏁 Prueba completada');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error en la prueba:', error.message);
            process.exit(1);
        });
}

module.exports = TestDocumentUpload;