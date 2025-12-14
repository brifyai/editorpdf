/**
 * Guía para obtener API Keys de IA
 * 
 * Este script proporciona instrucciones detalladas sobre cómo obtener
 * las API keys necesarias para Groq y Chutes.ai
 */

console.log(`
🔑 GUÍA PARA OBTENER API KEYS DE IA
=====================================

Este documento te guiará paso a paso para obtener las API keys necesarias
para que el sistema de análisis de IA funcione correctamente.

📋 REQUISITOS PREVIOS:
----------------------
• Cuenta en Groq (https://console.groq.com/)
• Cuenta en Chutes.ai (https://chutes.ai/)
• Acceso a internet

🚀 PASO 1: OBTENER API KEY DE GROQ
-----------------------------------

1. Ve a https://console.groq.com/
2. Regístrate o inicia sesión con tu cuenta
3. Una vez dentro del dashboard, haz clic en "API Keys" en el menú lateral
4. Haz clic en "Create API Key" o "Generate Key"
5. Dale un nombre descriptivo a tu clave (ej: "document-analyzer")
6. Copia la clave generada (comienza con "gsk_")
7. Guarda la clave en un lugar seguro

📝 NOTA: Las claves de Groq tienen este formato:
   gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

🚀 PASO 2: OBTENER API KEY DE CHUTES.AI
---------------------------------------

1. Ve a https://chutes.ai/
2. Regístrate o inicia sesión con tu cuenta
3. Busca la sección de "API" o "Developer" en tu dashboard
4. Busca la opción para generar o ver tu API key
5. Copia la clave proporcionada
6. Guarda la clave en un lugar seguro

📝 NOTA: Las claves de Chutes.ai suelen ser cadenas alfanuméricas
   más largas que las de Groq.

🚀 PASO 3: ACTUALIZAR LAS CLAVES EN EL SISTEMA
----------------------------------------------

Una vez que tengas ambas API keys, tienes dos opciones:

OPCIÓN A: Usar el script interactivo (recomendado)
   Ejecuta: node scripts/update-ai-keys.js
   El script te pedirá las claves y las guardará automáticamente

OPCIÓN B: Usar la interfaz web
   1. Inicia la aplicación (npm run dev)
   2. Ve a la sección de Configuración de IA
   3. Ingresa tus API keys en los campos correspondientes
   4. Guarda la configuración

🚀 PASO 4: VERIFICAR QUE LAS CLAVES FUNCIONAN
-------------------------------------------

Después de actualizar las claves, puedes verificar que funcionan:

1. Ejecuta el script de prueba: node scripts/test-ai-apis.js
2. O visita la página de métricas de IA en la aplicación web

📊 RESULTADOS ESPERADOS:
-----------------------

Si las claves son válidas, deberías ver:
✅ Groq API: Funcionando correctamente
✅ Chutes.ai API: Funcionando correctamente

Si alguna clave no funciona, verás:
❌ [Nombre API]: No disponible
   - Error: [descripción del error]

🔍 SOLUCIÓN DE PROBLEMAS:
------------------------

PROBLEMA: "Invalid API Key" en Groq
SOLUCIÓN:
• Verifica que la clave esté copiada correctamente (sin espacios)
• Asegúrate de que la clave comience con "gsk_"
• Verifica que tu cuenta de Groq esté activa

PROBLEMA: "Authentication failed" en Chutes.ai
SOLUCIÓN:
• Verifica que la clave esté copiada correctamente
• Asegúrate de que tu cuenta de Chutes.ai tenga acceso a la API
• Contacta al soporte de Chutes.ai si es necesario

PROBLEMA: "No se pudo conectar al servidor"
SOLUCIÓN:
• Asegúrate de que el servidor backend esté ejecutándose
• Verifica que esté en el puerto 8080
• Revisa que no haya firewalls bloqueando la conexión

📚 INFORMACIÓN ADICIONAL:
------------------------

• Las API keys son sensibles y no deben compartirse
• Puedes regenerar tus claves en cualquier momento desde los portales
• El sistema carga las claves desde la base de datos al iniciar
• Si cambias las claves, el servidor necesita reiniciarse para cargarlas

🎯 PRÓXIMOS PASOS:
------------------

1. Obtén tus API keys siguiendo esta guía
2. Ejecuta el script de actualización: node scripts/update-ai-keys.js
3. Verifica que funcionen con: node scripts/test-ai-apis.js
4. Disfruta del análisis de IA en tu aplicación

¡Buena suerte! 🚀
`);

console.log('\n💡 Para actualizar tus API keys ahora mismo, ejecuta:');
console.log('   node scripts/update-ai-keys.js');
console.log('\n📚 Para más información, visita la documentación en docs/');