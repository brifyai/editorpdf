/**
 * Script para probar las APIs de IA y verificar las claves
 */

require('dotenv').config();
const aiAnalyzer = require('../src/ai/aiAnalyzer');

async function testAIAPIs() {
    console.log('🧪 Iniciando pruebas de APIs de IA...\n');

    // 1. Verificar estado de las APIs
    console.log('📊 Verificando estado de las APIs...');
    try {
        const apiStatus = await aiAnalyzer.checkAPIsAvailability();
        console.log('📋 Estado de APIs:', JSON.stringify(apiStatus, null, 2));
        
        if (apiStatus.groq) {
            console.log('✅ API de Groq está funcionando correctamente');
        } else {
            console.log('❌ API de Groq no está disponible:', apiStatus.groqError);
        }
        
        if (apiStatus.chutes) {
            console.log('✅ API de Chutes.ai está funcionando correctamente');
        } else {
            console.log('❌ API de Chutes.ai no está disponible:', apiStatus.chutesError);
        }
    } catch (error) {
        console.error('❌ Error verificando estado de APIs:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 2. Verificar claves de entorno
    console.log('🔑 Verificando claves de entorno...');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 
        `${process.env.GROQ_API_KEY.substring(0, 7)}... (longitud: ${process.env.GROQ_API_KEY.length})` : 
        'No configurada');
    
    console.log('CHUTES_API_KEY:', process.env.CHUTES_API_KEY ? 
        `${process.env.CHUTES_API_KEY.substring(0, 7)}... (longitud: ${process.env.CHUTES_API_KEY.length})` : 
        'No configurada');

    console.log('\n' + '='.repeat(50) + '\n');

    // 3. Probar conexión con Groq
    console.log('🔄 Probando conexión con Groq...');
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_api_key_here') {
        try {
            const testPrompt = 'Hola, por favor responde con "Groq API funcionando correctamente" si recibes este mensaje.';
            const result = await aiAnalyzer.analyzeWithGroq(testPrompt, 'llama-3.1-8b-instant');
            
            if (result && result.analysis) {
                console.log('✅ Prueba con Groq exitosa:');
                console.log('   - Modelo:', result.model);
                console.log('   - Tiempo de respuesta:', result.response_time_ms, 'ms');
                console.log('   - Tokens usados:', result.tokens_used);
                console.log('   - Costo USD:', result.cost_usd.toFixed(4));
                console.log('   - Respuesta:', result.analysis.substring(0, 100) + '...');
            } else {
                console.log('❌ La prueba con Groq no devolvió resultados válidos');
            }
        } catch (error) {
            console.error('❌ Error en prueba con Groq:', error.message);
            console.error('   Detalles:', error.response?.data || error.stack);
        }
    } else {
        console.log('⚠️ No se puede probar Groq - API key no configurada o inválida');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 4. Probar conexión con Chutes.ai
    console.log('🔄 Probando conexión con Chutes.ai...');
    if (process.env.CHUTES_API_KEY && process.env.CHUTES_API_KEY !== 'your_chutes_api_key_here') {
        try {
            const connectionResult = await aiAnalyzer.verifyChutesConnection();
            
            if (connectionResult && connectionResult.success) {
                console.log('✅ Conexión con Chutes.ai exitosa:');
                console.log('   - Mensaje:', connectionResult.message);
                console.log('   - Datos recibidos:', connectionResult.data ? 'Sí' : 'No');
            } else {
                console.log('❌ Conexión con Chutes.ai fallida:');
                console.log('   - Error:', connectionResult.error);
                console.log('   - Mensaje:', connectionResult.message);
                console.log('   - Detalles:', connectionResult.details);
            }
        } catch (error) {
            console.error('❌ Error en prueba con Chutes.ai:', error.message);
            console.error('   Detalles:', error.response?.data || error.stack);
        }
    } else {
        console.log('⚠️ No se puede probar Chutes.ai - API key no configurada o inválida');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 5. Recomendaciones
    console.log('💡 Recomendaciones:');
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_your_api_key_here') {
        console.log('   - Configurar una API key válida de Groq en el archivo .env');
        console.log('   - Obtener una API key en https://console.groq.com/');
    }
    
    if (!process.env.CHUTES_API_KEY || process.env.CHUTES_API_KEY === 'your_chutes_api_key_here') {
        console.log('   - Configurar una API key válida de Chutes.ai en el archivo .env');
        console.log('   - Obtener una API key en https://chutes.ai/');
    }
    
    console.log('   - Para actualizar las claves sin reiniciar el servidor, usar el endpoint /api/save-ai-config');
    console.log('   - Verificar el estado de las APIs en cualquier momento con /api/ai-status');

    console.log('\n🏁 Pruebas completadas');
}

// Ejecutar pruebas
testAIAPIs().catch(console.error);