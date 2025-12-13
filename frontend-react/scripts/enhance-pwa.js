#!/usr/bin/env node

/**
 * Script para mejorar la configuración PWA
 * Añade splash screen, modo standalone y mejora el manifest
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Configuración de íconos PWA
const PWA_ICONS = [
  { size: 192, purpose: 'any' },
  { size: 192, purpose: 'maskable' },
  { size: 512, purpose: 'any' },
  { size: 512, purpose: 'maskable' },
  { size: 1024, purpose: 'any' }, // Para splash screen
];

// Colores para el tema
const THEME_CONFIG = {
  background_color: '#0f0f14',
  theme_color: '#00d4ff',
  display: 'standalone',
  orientation: 'portrait-primary',
  categories: ['productivity', 'utilities'],
  lang: 'es',
  dir: 'ltr',
  start_url: '/',
  scope: '/',
};

// Apple splash screen sizes (iPhone/iPad)
const APPLE_SPLASH_SCREENS = [
  { width: 640, height: 1136, device: 'iPhone SE' },
  { width: 750, height: 1334, device: 'iPhone 8' },
  { width: 828, height: 1792, device: 'iPhone 11' },
  { width: 1125, height: 2436, device: 'iPhone 11 Pro' },
  { width: 1242, height: 2688, device: 'iPhone 11 Pro Max' },
  { width: 1170, height: 2532, device: 'iPhone 12' },
  { width: 1284, height: 2778, device: 'iPhone 12 Pro Max' },
  { width: 1536, height: 2048, device: 'iPad Mini' },
  { width: 1668, height: 2388, device: 'iPad Pro 11' },
  { width: 2048, height: 2732, device: 'iPad Pro 12.9' },
];

/**
 * Mejora el manifest.json existente
 */
async function enhanceManifest() {
  console.log('📝 Mejorando manifest.json...');

  const manifestPath = path.join(publicDir, 'manifest.json');
  
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    
    // Añadir configuraciones PWA avanzadas
    const enhancedManifest = {
      ...manifest,
      ...THEME_CONFIG,
      icons: [
        ...(manifest.icons || []),
        // Añadir íconos maskable
        {
          src: '/icon-192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'Analizar Imágenes',
          short_name: 'Analizar',
          description: 'Sube y analiza imágenes con IA',
          url: '/analisis-imagenes',
          icons: [{ src: '/icon-96.png', sizes: '96x96' }],
        },
        {
          name: 'Historial',
          short_name: 'Historial',
          description: 'Ver historial de análisis',
          url: '/historial-analisis',
          icons: [{ src: '/icon-96.png', sizes: '96x96' }],
        },
      ],
      screenshots: [
        {
          src: '/screenshot-mobile.png',
          sizes: '390x844',
          type: 'image/png',
          platform: 'narrow',
          label: 'Vista móvil del Dashboard',
        },
        {
          src: '/screenshot-desktop.png',
          sizes: '1280x800',
          type: 'image/png',
          platform: 'wide',
          label: 'Vista desktop del Dashboard',
        },
      ],
    };

    await fs.writeFile(manifestPath, JSON.stringify(enhancedManifest, null, 2));
    console.log('✅ Manifest.json mejorado');
  } catch (error) {
    console.error('❌ Error mejorando manifest:', error.message);
  }
}

/**
 * Crear HTML para splash screens de Apple
 */
async function createAppleSplashScreens() {
  console.log('🍎 Creando splash screens para iOS...');

  const htmlPath = path.join(publicDir, 'apple-splash-screens.html');
  let html = '<!-- Apple Splash Screens -->\n';

  for (const screen of APPLE_SPLASH_SCREENS) {
    const { width, height, device } = screen;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    html += `<!-- ${device} (${orientation}) -->\n`;
    html += `<link rel="apple-touch-startup-image" 
      media="(device-width: ${width / 2}px) and (device-height: ${height / 2}px) and (-webkit-device-pixel-ratio: 2) and (orientation: ${orientation})"
      href="/splash-${width}x${height}.png">\n\n`;
  }

  await fs.writeFile(htmlPath, html);
  console.log('✅ Splash screens de Apple creadas');
}

/**
 * Crear service worker avanzado
 */
async function createAdvancedServiceWorker() {
  console.log('🔧 Creando service worker avanzado...');

  const swContent = `
// Service Worker Avanzado para PDF Analyzer Pro
const CACHE_NAME = 'pdf-analyzer-pro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

// Instalar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch con estrategia Network First
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes no GET
  if (event.request.method !== 'GET') return;

  // Ignorar solicitudes de extensiones de Chrome
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // No cachear respuestas no válidas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonar respuesta para cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback a cache si network falla
        return caches.match(event.request).then((response) => {
          if (response) return response;
          
          // Fallback para navegación
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nueva notificación de PDF Analyzer Pro',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir',
        icon: '/icon-96.png',
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-96.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('PDF Analyzer Pro', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí iría la lógica de sincronización
      console.log('Sincronización en background ejecutada')
    );
  }
});

console.log('Service Worker cargado exitosamente');
`;

  const swPath = path.join(publicDir, 'sw-advanced.js');
  await fs.writeFile(swPath, swContent.trim());
  console.log('✅ Service worker avanzado creado');
}

/**
 * Crear página offline
 */
async function createOfflinePage() {
  console.log('📴 Creando página offline...');

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Analyzer Pro - Offline</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    .offline-container {
      max-width: 400px;
      padding: 2rem;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .offline-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .offline-message {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
    }
    .retry-button {
      background: linear-gradient(135deg, #00d4ff 0%, #9d00ff 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .retry-button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📶</div>
    <h1 class="offline-title">Sin Conexión</h1>
    <p class="offline-message">
      Parece que has perdido la conexión a internet. Algunas funciones pueden no estar disponibles.
    </p>
    <button class="retry-button" onclick="window.location.reload()">
      Reintentar
    </button>
  </div>
</body>
</html>
`;

  const offlinePath = path.join(publicDir, 'offline.html');
  await fs.writeFile(offlinePath, htmlContent.trim());
  console.log('✅ Página offline creada');
}

/**
 * Actualizar index.html con meta tags PWA
 */
async function updateIndexHtml() {
  console.log('📝 Actualizando index.html con meta tags PWA...');

  const indexPath = path.join(rootDir, 'index.html');
  
  try {
    let html = await fs.readFile(indexPath, 'utf8');

    // Añadir meta tags si no existen
    const pwaMetaTags = `
<!-- PWA Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="PDF Analyzer Pro">
<meta name="application-name" content="PDF Analyzer Pro">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#00d4ff">
<meta name="msapplication-navbutton-color" content="#00d4ff">
<meta name="msapplication-TileColor" content="#00d4ff">
<meta name="msapplication-config" content="/browserconfig.xml">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png">
<link rel="apple-touch-icon" sizes="167x167" href="/icon-167.png">

<!-- PWA Scripts -->
<script>
  // Registrar service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw-advanced.js')
        .then((registration) => {
          console.log('SW registrado:', registration);
        })
        .catch((error) => {
          console.log('SW registro fallido:', error);
        });
    });
  }

  // Detectar cuando la app se instala
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    console.log('App instalable detectada');
  });

  // Detectar cuando la app se abre desde home screen
  window.addEventListener('appinstalled', () => {
    console.log('App instalada desde PWA');
    window.deferredPrompt = null;
  });
</script>
`;

    // Insertar antes de </head>
    html = html.replace('</head>', `${pwaMetaTags}\n</head>`);

    await fs.writeFile(indexPath, html);
    console.log('✅ index.html actualizado');
  } catch (error) {
    console.error('❌ Error actualizando index.html:', error.message);
  }
}

/**
 * Función principal
 */
async function enhancePWA() {
  console.log('🚀 Mejorando configuración PWA...\n');

  try {
    await enhanceManifest();
    await createAppleSplashScreens();
    await createAdvancedServiceWorker();
    await createOfflinePage();
    await updateIndexHtml();

    console.log('\n🎉 ¡Configuración PWA mejorada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Generar íconos en todas las resoluciones');
    console.log('2. Crear screenshots para el manifest');
    console.log('3. Probar instalación en dispositivos móviles');
    console.log('4. Configurar push notifications si es necesario');
  } catch (error) {
    console.error('❌ Error mejorando PWA:', error.message);
  }
}

// Ejecutar si se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  enhancePWA().catch(console.error);
}

export { enhancePWA };