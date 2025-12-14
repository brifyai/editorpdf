#!/usr/bin/env node

/**
 * Script para abrir el navegador sin caché y con DevTools activado
 * Esto fuerza la recarga completa de todos los archivos
 */

import { exec } from 'child_process';
import os from 'os';

const platform = os.platform();
const url = 'http://localhost:3000';

console.log('🧹 Abriendo navegador con caché completamente deshabilitada...\n');

let command;

if (platform === 'darwin') { // macOS
  command = `open -n -a "Google Chrome" --args --disable-cache --disk-cache-size=0 --media-cache-size=0 --aggressive-cache-discard --disable-application-cache --disable-offline-load-stale-cache --disk-cache-dir=/dev/null --user-data-dir=/tmp/chrome-dev --auto-open-devtools-for-tabs ${url}`;
} else if (platform === 'win32') { // Windows
  command = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --disable-cache --disk-cache-size=0 --media-cache-size=0 --aggressive-cache-discard --disable-application-cache --disable-offline-load-stale-cache --disk-cache-dir=/dev/null --user-data-dir=%TEMP%\\chrome-dev --auto-open-devtools-for-tabs ${url}`;
} else { // Linux
  command = `google-chrome --disable-cache --disk-cache-size=0 --media-cache-size=0 --aggressive-cache-discard --disable-application-cache --disable-offline-load-stale-cache --disk-cache-dir=/dev/null --user-data-dir=/tmp/chrome-dev --auto-open-devtools-for-tabs ${url}`;
}

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al abrir Chrome:', error.message);
    console.log('\n💡 Alternativa: Ejecuta este comando manualmente en tu terminal:');
    console.log(`\n${command}\n`);
    process.exit(1);
  }
  
  console.log('✅ Navegador abierto correctamente con caché deshabilitada');
  console.log('📍 URL:', url);
  console.log('\n🔧 DevTools se abrirá automáticamente');
  console.log('💾 NO se guardará ninguna caché en esta sesión');
  console.log('\n🔄 Si el botón sigue sin verse correctamente,');
  console.log('   verifica en DevTools → Elements que el botón tenga 3 divs dentro');
});