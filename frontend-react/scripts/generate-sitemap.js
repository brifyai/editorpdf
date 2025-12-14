#!/usr/bin/env node

/**
 * Generador de Sitemap XML para EditorPDF Pro
 * Crea un sitemap dinámico con todas las rutas de la aplicación
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rutas principales de la aplicación
const BASE_URL = 'https://editorpdf.pro';
const LAST_MOD = new Date().toISOString().split('T')[0];

// Rutas estáticas principales
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/analisis-documentos', priority: '0.9', changefreq: 'daily' },
  { path: '/ocr-conversion', priority: '0.9', changefreq: 'daily' },
  { path: '/procesamiento-batch', priority: '0.8', changefreq: 'weekly' },
  { path: '/inteligencia-artificial', priority: '0.8', changefreq: 'weekly' },
  { path: '/exportacion-avanzada', priority: '0.7', changefreq: 'monthly' },
  { path: '/estadisticas', priority: '0.6', changefreq: 'monthly' },
  { path: '/configuracion', priority: '0.5', changefreq: 'monthly' },
  { path: '/ayuda-soporte', priority: '0.5', changefreq: 'monthly' },
  { path: '/historial-analisis', priority: '0.6', changefreq: 'weekly' },
  { path: '/analisis-imagenes', priority: '0.7', changefreq: 'weekly' },
  { path: '/conversion-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/conversion-word', priority: '0.8', changefreq: 'weekly' },
  { path: '/metricas-ia', priority: '0.6', changefreq: 'monthly' },
  { path: '/comparacion-modelos', priority: '0.6', changefreq: 'monthly' },
  { path: '/acceso', priority: '0.4', changefreq: 'monthly' },
  { path: '/registro', priority: '0.4', changefreq: 'monthly' }
];

// Rutas de herramientas PDF
const pdfToolRoutes = [
  { path: '/herramientas/unir-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/separar-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/organizar-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/optimizar-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/restaurar-pdf', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/word-a-pdf', priority: '0.9', changefreq: 'weekly' },
  { path: '/herramientas/powerpoint-a-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/excel-a-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/web-a-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/imagenes-a-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/pdf-a-word', priority: '0.9', changefreq: 'weekly' },
  { path: '/herramientas/pdf-a-powerpoint', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/pdf-a-excel', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/pdf-a-imagenes', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/editor-avanzado', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/firmar-documento', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/marca-de-agua', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/rotar-paginas', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/proteger-contrasena', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/desbloquear-pdf', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/numeracion-paginas', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/recortar-documento', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/reconocimiento-texto', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/escaner-movil', priority: '0.6', changefreq: 'monthly' },
  { path: '/herramientas/comparar-pdf', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/censurar-pdf', priority: '0.5', changefreq: 'monthly' },
  { path: '/herramientas/analisis-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/herramientas/ocr-inteligente', priority: '0.8', changefreq: 'weekly' },
  { path: '/herramientas/extraccion-inteligente', priority: '0.7', changefreq: 'weekly' }
];

// Combinar todas las rutas
const allRoutes = [...staticRoutes, ...pdfToolRoutes];

// Generar XML del sitemap
function generateSitemap() {
  const urls = allRoutes.map(route => {
    const fullUrl = `${BASE_URL}${route.path}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

// Guardar el sitemap
function saveSitemap() {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemapContent = generateSitemap();
  
  try {
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('✅ Sitemap generado exitosamente en:', sitemapPath);
    console.log(`📊 Total de URLs: ${allRoutes.length}`);
    console.log('📝 Última modificación:', LAST_MOD);
  } catch (error) {
    console.error('❌ Error al generar sitemap:', error);
    process.exit(1);
  }
}

// Ejecutar
saveSitemap();

export { generateSitemap, allRoutes };