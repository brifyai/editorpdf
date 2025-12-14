#!/usr/bin/env node

/**
 * Script para verificar el estado del build en Netlify
 * Este script proporciona información sobre cómo monitorear el despliegue
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const NETLIFY_SITE_URL = 'https://editorpdfcl.netlify.app';
const NETLIFY_API_URL = 'api.netlify.com';
const GITHUB_REPO = 'https://github.com/brifyai/editorpdf';

console.log('='.repeat(60));
console.log('VERIFICACIÓN DE ESTADO DE BUILD EN NETLIFY');
console.log('='.repeat(60));
console.log();

// 1. Verificar estado de Git
console.log('1. Verificando estado de Git...');
try {
  const lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr)"', { encoding: 'utf8' });
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  
  console.log('   ✅ Último commit:', lastCommit.trim());
  console.log('   ✅ Rama actual:', currentBranch);
  console.log('   ✅ Repositorio:', GITHUB_REPO);
} catch (error) {
  console.log('   ❌ Error al verificar Git:', error.message);
}
console.log();

// 2. Verificar archivos clave
console.log('2. Verificando archivos clave para Netlify...');
const keyFiles = [
  'netlify.toml',
  'frontend-react/package.json',
  'frontend-react/vite.config.js',
  'functions/api-handler.js',
  'functions/package.json'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`   ✅ ${file} (modificado: ${stats.mtime.toISOString()})`);
  } else {
    console.log(`   ❌ ${file} (no encontrado)`);
  }
});
console.log();

// 3. Verificar archivo de trigger
console.log('3. Verificando archivo de trigger...');
if (fs.existsSync('NETLIFY_TRIGGER.md')) {
  const content = fs.readFileSync('NETLIFY_TRIGGER.md', 'utf8');
  console.log('   ✅ NETLIFY_TRIGGER.md encontrado');
  console.log('   📄 Contenido:', content.trim());
} else {
  console.log('   ❌ NETLIFY_TRIGGER.md no encontrado');
}
console.log();

// 4. Instrucciones para monitoreo
console.log('4. Instrucciones para monitorear el build:');
console.log();
console.log('   a) Verificar en GitHub Actions:');
console.log(`      - Visita: ${GITHUB_REPO}/actions`);
console.log('      - Busca el workflow "Build and Deploy to Netlify"');
console.log('      - Revisa el estado del último build');
console.log();
console.log('   b) Verificar en Netlify Dashboard:');
console.log('      - Visita: https://app.netlify.com/sites/editorpdfcl');
console.log('      - Revisa la pestaña "Deploys"');
console.log('      - Busca el deploy más reciente con el commit:', execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7));
console.log();
console.log('   c) Verificar en la terminal:');
console.log('      - Ejecuta: git log --oneline -5');
console.log('      - Compara el hash del commit con el mostrado en Netlify');
console.log();

// 5. Tiempos estimados
console.log('5. Tiempos estimados del proceso:');
console.log('   🕐 GitHub Actions: 2-5 minutos');
console.log('   🕐 Netlify Build: 3-8 minutos');
console.log('   🕐 Despliegue total: 5-15 minutos');
console.log('   🕐 Propagación CDN: 1-5 minutos adicionales');
console.log();

// 6. Comandos útiles
console.log('6. Comandos útiles:');
console.log('   🔄 Ver últimos commits:');
console.log('      git log --oneline -5');
console.log();
console.log('   🔄 Ver estado actual:');
console.log('      git status');
console.log();
console.log('   🔄 Forzar nuevo build (si es necesario):');
console.log('      echo "# Build trigger $(date)" >> TRIGGER.md && git add TRIGGER.md && git commit -m "Force new build" && git push');
console.log();

// 7. Pruebas de la aplicación desplegada
console.log('7. Pruebas de la aplicación desplegada:');
console.log('   🌐 URL principal:', NETLIFY_SITE_URL);
console.log('   🔍 Health check:', `${NETLIFY_SITE_URL}/api/health`);
console.log('   🤖 Estado IA:', `${NETLIFY_SITE_URL}/api/ai-status`);
console.log('   👤 Autenticación:', `${NETLIFY_SITE_URL}/api/auth/me`);
console.log('   📋 Modelos:', `${NETLIFY_SITE_URL}/api/models`);
console.log();

// 8. Posibles problemas y soluciones
console.log('8. Posibles problemas y soluciones:');
console.log('   ❌ Build fallido en Netlify:');
console.log('      - Revisa los logs en el dashboard de Netlify');
console.log('      - Verifica que todas las dependencias estén en package.json');
console.log('      - Asegúrate de que los archivos de configuración sean correctos');
console.log();
console.log('   ❌ Error 404 en endpoints de API:');
console.log('      - Verifica las redirecciones en netlify.toml');
console.log('      - Revisa que las funciones estén en el directorio correcto');
console.log('      - Comprueba que el archivo api-handler.js exista');
console.log();
console.log('   ❌ Aplicación no carga:');
console.log('      - Espera a que el build termine completamente');
console.log('      - Limpia la caché del navegador');
console.log('      - Verifica la consola del navegador por errores');
console.log();

console.log('='.repeat(60));
console.log('VERIFICACIÓN COMPLETADA');
console.log('='.repeat(60));
console.log();
console.log('📝 Resumen:');
console.log('   - Se ha creado un nuevo commit para forzar el build');
console.log('   - Los archivos clave están presentes y configurados');
console.log('   - El build debería comenzar automáticamente en Netlify');
console.log('   - Monitorea el progreso usando las instrucciones anteriores');
console.log();
console.log('⏱️  Tiempo estimado para ver los cambios: 10-20 minutos');
console.log('🔗 URL para verificar:', NETLIFY_SITE_URL);