#!/usr/bin/env node

/**
 * Script de limpieza de dependencias
 * Elimina dependencias duplicadas y no utilizadas
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧹 Iniciando limpieza de dependencias...\n')

// 1. Eliminar bcryptjs (duplicado con bcrypt)
console.log('1. Eliminando bcryptjs (duplicado)...')
try {
  execSync('npm uninstall bcryptjs --silent', { stdio: 'inherit' })
  console.log('✅ bcryptjs eliminado correctamente')
} catch (error) {
  console.log('⚠️ bcryptjs ya estaba eliminado o no existe')
}

// 2. Verificar uso de jimp
console.log('\n2. Verificando uso de jimp...')
const jimpUsage = searchFilesForImports('jimp', ['src/', 'scripts/', 'server.js'])
if (jimpUsage.length === 0) {
  console.log('3. Eliminando jimp (no se usa en el código fuente)...')
  try {
    execSync('npm uninstall jimp --silent', { stdio: 'inherit' })
    console.log('✅ jimp eliminado correctamente')
  } catch (error) {
    console.log('⚠️ jimp ya estaba eliminado o no existe')
  }
} else {
  console.log('⚠️ jimp se usa en:', jimpUsage.join(', '))
}

// 3. Verificar uso de docx
console.log('\n4. Verificando uso de docx...')
const docxUsage = searchFilesForImports('docx', ['src/', 'scripts/', 'server.js'])
if (docxUsage.length === 0) {
  console.log('⚠️ docx no se usa en el código fuente')
} else {
  console.log('✅ docx se usa en:', docxUsage.join(', '))
}

// 4. Verificar uso de pdfkit
console.log('\n5. Verificando uso de pdfkit...')
const pdfkitUsage = searchFilesForImports('pdfkit', ['src/', 'scripts/', 'server.js'])
if (pdfkitUsage.length === 0) {
  console.log('⚠️ pdfkit no se usa en el código fuente')
} else {
  console.log('✅ pdfkit se usa en:', pdfkitUsage.join(', '))
}

// 5. Verificar uso de pg
console.log('\n6. Verificando uso de pg...')
const pgUsage = searchFilesForImports('pg', ['src/', 'scripts/', 'server.js'])
if (pgUsage.length === 0) {
  console.log('⚠️ pg no se usa en el código fuente')
} else {
  console.log('✅ pg se usa en:', pgUsage.join(', '))
}

// 6. Instalar dependencias de desarrollo
console.log('\n7. Instalando dependencias de desarrollo...')
try {
  execSync('npm install --save-dev jest supertest eslint prettier depcheck', { stdio: 'inherit' })
  console.log('✅ Dependencias de desarrollo instaladas')
} catch (error) {
  console.log('⚠️ Error instalando dependencias de desarrollo:', error.message)
}

// 7. Verificar package.json actualizado
console.log('\n8. Verificando package.json...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
console.log('📦 Dependencias principales:', Object.keys(packageJson.dependencies).length)
console.log('🛠️ Dependencias de desarrollo:', Object.keys(packageJson.devDependencies).length)

// 8. Limpiar node_modules y reinstalar
console.log('\n9. Limpiando node_modules y reinstalando...')
try {
  execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' })
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ node_modules reinstalado correctamente')
} catch (error) {
  console.log('⚠️ Error reinstalando:', error.message)
}

// 9. Ejecutar depcheck
console.log('\n10. Verificando dependencias no utilizadas...')
try {
  const depcheckOutput = execSync('npx depcheck', { encoding: 'utf8', stdio: 'pipe' })
  console.log('📊 Resultado de depcheck:')
  console.log(depcheckOutput)
} catch (error) {
  console.log('⚠️ Error ejecutando depcheck:', error.message)
}

console.log('\n✅ Limpieza de dependencias completada!')

// Función auxiliar para buscar imports
function searchFilesForImports(packageName, paths) {
  const results = []
  
  paths.forEach(pathItem => {
    if (fs.existsSync(pathItem)) {
      const stat = fs.statSync(pathItem)
      
      if (stat.isFile() && pathItem.endsWith('.js')) {
        // Es un archivo individual
        const content = fs.readFileSync(pathItem, 'utf8')
        if (content.includes(`require('${packageName}')`) || 
            content.includes(`require("${packageName}")`) ||
            content.includes(`import.*${packageName}`)) {
          results.push(pathItem)
        }
      } else if (stat.isDirectory()) {
        // Es un directorio, buscar archivos dentro
        const files = getAllJsFiles(pathItem)
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8')
          if (content.includes(`require('${packageName}')`) || 
              content.includes(`require("${packageName}")`) ||
              content.includes(`import.*${packageName}`)) {
            results.push(file)
          }
        })
      }
    }
  })
  
  return results
}

// Función auxiliar para obtener todos los archivos JS
function getAllJsFiles(dir) {
  const files = []
  
  if (!fs.existsSync(dir)) return files
  
  const items = fs.readdirSync(dir)
  items.forEach(item => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllJsFiles(fullPath))
    } else if (stat.isFile() && item.endsWith('.js')) {
      files.push(fullPath)
    }
  })
  
  return files
}