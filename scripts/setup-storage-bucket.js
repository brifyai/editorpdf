/**
 * Script para configurar el bucket de storage en Supabase
 * Este script crea el bucket 'documents' necesario para almacenar archivos
 */

require('dotenv').config();
const { supabaseClient } = require('../src/database/supabaseClient');

async function setupStorageBucket() {
    try {
        console.log('🔧 Configurando bucket de storage en Supabase...');
        
        // Verificar si el cliente está inicializado
        if (!supabaseClient.isInitialized()) {
            throw new Error('Cliente de Supabase no está inicializado');
        }

        const bucketName = 'documents';
        
        // Verificar si el bucket ya existe
        console.log(`📋 Verificando si el bucket '${bucketName}' ya existe...`);
        try {
            const existingBucket = await supabaseClient.getBucket(bucketName);
            console.log(`✅ Bucket '${bucketName}' ya existe`);
            console.log(`   - ID: ${existingBucket.id}`);
            console.log(`   - Público: ${existingBucket.public}`);
            console.log(`   - Creado: ${existingBucket.created_at}`);
            return;
        } catch (error) {
            console.log(`📝 Bucket '${bucketName}' no existe, creándolo...`);
        }

        // Crear el bucket
        console.log(`📦 Creando bucket '${bucketName}'...`);
        const bucketOptions = {
            public: false, // No público por seguridad
            allowedMimeTypes: [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/bmp',
                'image/tiff',
                'image/webp'
            ],
            fileSizeLimit: 52428800 // 50MB
        };

        const newBucket = await supabaseClient.createBucket(bucketName, bucketOptions);
        console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
        console.log(`   - ID: ${newBucket.id}`);
        console.log(`   - Público: ${newBucket.public}`);
        console.log(`   - Límite de tamaño: ${bucketOptions.fileSizeLimit} bytes`);

        // Listar todos los buckets para verificar
        console.log('\n📋 Listando todos los buckets:');
        const buckets = await supabaseClient.listBuckets();
        buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (ID: ${bucket.id}, Público: ${bucket.public})`);
        });

        console.log('\n🎉 Configuración de storage completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error configurando el bucket de storage:', error);
        
        if (error.message.includes('Invalid JWT')) {
            console.error('\n🔑 Error de autenticación. Verifica que:');
            console.error('   1. La SUPABASE_SERVICE_ROLE_KEY sea correcta');
            console.error('   2. La clave tenga permisos de administrador');
            console.error('   3. El proyecto de Supabase esté activo');
        } else if (error.message.includes('bucket already exists')) {
            console.log('\n✅ El bucket ya existe, no es necesario crearlo');
        } else if (error.message.includes('insufficient_privilege')) {
            console.error('\n🚫 Permisos insuficientes. La SERVICE_ROLE_KEY debe tener permisos de administrador.');
        }
        
        process.exit(1);
    }
}

// Ejecutar el script
if (require.main === module) {
    setupStorageBucket()
        .then(() => {
            console.log('\n✨ Script completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Script falló:', error);
            process.exit(1);
        });
}

module.exports = { setupStorageBucket };