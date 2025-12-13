#!/usr/bin/env node

/**
 * Script para optimizar imágenes del proyecto
 * Convierte PNG/JPG a WebP y comprime SVG
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');

// Configuración de optimización
const config = {
  webp: {
    quality: 80,
    effort: 6,
    alphaQuality: 90,
  },
  png: {
    compressionLevel: 9,
    palette: true,
  },
  jpg: {
    quality: 85,
    mozjpeg: true,
  },
  svg: {
    multipass: true,
    plugins: [
      { name: 'preset-default' },
      { name: 'removeDimensions', active: true },
      { name: 'sortAttrs', active: true },
    ],
  },
};

// Función para convertir a WebP
async function convertToWebp(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp(config.webp)
      .toFile(outputPath);
    
    const originalStats = await fs.stat(inputPath);
    const webpStats = await fs.stat(outputPath);
    const saved = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✅ Convertido: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${saved}% menor)`);
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${inputPath}:`, error.message);
    return false;
  }
}

// Función para optimizar PNG
async function optimizePng(inputPath) {
  try {
    const buffer = await fs.readFile(inputPath);
    const optimizedBuffer = await sharp(buffer)
      .png(config.png)
      .toBuffer();
    
    await fs.writeFile(inputPath, optimizedBuffer);
    console.log(`✅ PNG optimizado: ${path.basename(inputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
    return false;
  }
}

// Función para optimizar JPG
async function optimizeJpg(inputPath) {
  try {
    const buffer = await fs.readFile(inputPath);
    const optimizedBuffer = await sharp(buffer)
      .jpeg(config.jpg)
      .toBuffer();
    
    await fs.writeFile(inputPath, optimizedBuffer);
    console.log(`✅ JPG optimizado: ${path.basename(inputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
    return false;
  }
}

// Función principal de optimización
async function optimizeImages() {
  console.log('🚀 Iniciando optimización de imágenes...\n');

  // Buscar todas las imágenes
  const imagePatterns = [
    'public/**/*.{png,jpg,jpeg}',
    'src/**/*.{png,jpg,jpeg}',
    '!**/node_modules/**',
    '!**/.vite/**',
    '!**/dist/**',
  ];

  const images = await glob(imagePatterns, { cwd: rootDir });
  
  console.log(`📸 Encontradas ${images.length} imágenes para optimizar\n`);

  let converted = 0;
  let optimized = 0;
  let errors = 0;

  for (const imagePath of images) {
    const fullPath = path.join(rootDir, imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(fullPath);
    const name = path.basename(imagePath, ext);

    try {
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        // Convertir a WebP
        const webpPath = path.join(dir, `${name}.webp`);
        const success = await convertToWebp(fullPath, webpPath);
        
        if (success) {
          converted++;
          // Opcional: eliminar original si el WebP es mucho más pequeño
          const originalStats = await fs.stat(fullPath);
          const webpStats = await fs.stat(webpPath);
          
          if (webpStats.size < originalStats.size * 0.8) {
            // El WebP es al menos 20% más pequeño, podemos eliminar el original
            console.log(`🗑️  Eliminando original: ${path.basename(imagePath)}`);
            await fs.unlink(fullPath);
          }
        } else {
          errors++;
        }
      }
    } catch (error) {
      console.error(`❌ Error procesando ${imagePath}:`, error.message);
      errors++;
    }
  }

  // Resumen
  console.log('\n📊 Resumen de optimización:');
  console.log(`✅ Convertidas a WebP: ${converted}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total procesado: ${images.length}`);

  if (errors === 0) {
    console.log('\n🎉 ¡Todas las imágenes optimizadas exitosamente!');
  } else {
    console.log(`\n⚠️  Se encontraron ${errors} errores. Revisa los logs.`);
  }
}

// Ejecutar si se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeImages().catch(console.error);
}

export { optimizeImages };