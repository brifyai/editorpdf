/**
 * Script para actualizar las API keys de IA en la base de datos
 * 
 * Este script facilita la actualización de las API keys mediante el endpoint /api/save-ai-config
 * 
 * Uso: node scripts/update-ai-keys.js
 * 
 * El script solicitará las claves de forma interactiva y las guardará en la base de datos
 */

const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function updateAIKeys() {
    console.log('🔧 Actualización de API Keys de IA\n');
    console.log('Este script te ayudará a actualizar tus API keys de Groq y Chutes.ai\n');

    try {
        // Solicitar API key de Groq
        const groqKey = await askQuestion('🔑 Ingresa tu API Key de Groq (obtenla de https://console.groq.com/): ');
        
        // Solicitar API key de Chutes.ai
        const chutesKey = await askQuestion('🔑 Ingresa tu API Key de Chutes.ai (obtenla de https://chutes.ai/): ');

        console.log('\n⏳ Guardando configuración en la base de datos...');

        // Realizar la petición al endpoint
        const response = await axios.post('http://localhost:8080/api/save-ai-config', {
            groq_api_key: groqKey,
            chutes_api_key: chutesKey
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data.success) {
            console.log('✅ API keys guardadas exitosamente en la base de datos');
            console.log('📝 Resumen:');
            console.log(`   - Groq API Key: ${groqKey.substring(0, 7)}... (longitud: ${groqKey.length})`);
            console.log(`   - Chutes API Key: ${chutesKey.substring(0, 7)}... (longitud: ${chutesKey.length})`);
            
            console.log('\n🔄 Reiniciando el servidor para cargar las nuevas claves...');
            
            // Esperar un momento antes de reiniciar
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Probar el endpoint de estado de IA
            console.log('🧪 Verificando que las claves funcionan...');
            
            try {
                const statusResponse = await axios.get('http://localhost:8080/api/ai-status', {
                    timeout: 15000
                });
                
                if (statusResponse.data.success) {
                    const { groq, chutes } = statusResponse.data.data;
                    
                    console.log('\n📊 Estado de las APIs:');
                    
                    if (groq.available) {
                        console.log('   ✅ Groq API: Funcionando correctamente');
                        console.log(`      - Modelo: ${groq.model || 'No especificado'}`);
                        console.log(`      - Tiempo de respuesta: ${groq.response_time_ms || 'N/A'} ms`);
                    } else {
                        console.log('   ❌ Groq API: No disponible');
                        console.log(`      - Error: ${groq.error || 'Desconocido'}`);
                    }
                    
                    if (chutes.available) {
                        console.log('   ✅ Chutes.ai API: Funcionando correctamente');
                        console.log(`      - Tiempo de respuesta: ${chutes.response_time_ms || 'N/A'} ms`);
                    } else {
                        console.log('   ❌ Chutes.ai API: No disponible');
                        console.log(`      - Error: ${chutes.error || 'Desconocido'}`);
                    }
                    
                    if (groq.available || chutes.available) {
                        console.log('\n🎉 ¡Al menos una API está funcionando! El sistema puede realizar análisis de IA.');
                    } else {
                        console.log('\n⚠️  Ninguna API está funcionando. Verifica tus claves y conexión a internet.');
                    }
                } else {
                    console.log('❌ Error al verificar el estado de las APIs:', statusResponse.data.message);
                }
            } catch (error) {
                console.log('⚠️  No se pudo verificar el estado de las APIs:', error.message);
                console.log('   Esto puede deberse a que el servidor no está en ejecución.');
            }
            
        } else {
            console.log('❌ Error al guardar las API keys:', response.data.message);
        }

    } catch (error) {
        if (error.response) {
            console.log('❌ Error del servidor:', error.response.data.message || error.response.statusText);
        } else if (error.request) {
            console.log('❌ No se pudo conectar al servidor. Asegúrate de que el servidor esté ejecutándose en http://localhost:8080');
        } else {
            console.log('❌ Error:', error.message);
        }
    } finally {
        rl.close();
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Ejecutar el script
updateAIKeys().catch(console.error);