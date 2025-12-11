#!/usr/bin/env node

/**
 * Script de instalación y configuración para Document Analyzer
 * Este script configura el entorno, instala dependencias y verifica el sistema
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class SetupManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.requiredNodeVersion = '14.0.0';
        this.requiredNpmVersion = '6.0.0';
    }

    async run() {
        console.log('🚀 Configurando Document Analyzer\n');
        
        try {
            await this.checkSystemRequirements();
            await this.createDirectories();
            await this.installDependencies();
            await this.verifyInstallation();
            await this.createEnvironmentFile();
            await this.showNextSteps();
            
            console.log('\n✅ ¡Configuración completada exitosamente!');
            
        } catch (error) {
            console.error('\n❌ Error durante la configuración:', error.message);
            process.exit(1);
        }
    }

    async checkSystemRequirements() {
        console.log('📋 Verificando requisitos del sistema...');
        
        // Verificar Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const nodeVersionNum = nodeVersion.replace('v', '');
            
            if (this.compareVersions(nodeVersionNum, this.requiredNodeVersion) < 0) {
                throw new Error(`Node.js ${this.requiredNodeVersion} o superior es requerido. Versión actual: ${nodeVersion}`);
            }
            
            console.log(`   ✅ Node.js: ${nodeVersion}`);
            
        } catch (error) {
            if (error.message.includes('Node.js')) {
                throw error;
            }
            throw new Error('Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/');
        }

        // Verificar npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            
            if (this.compareVersions(npmVersion, this.requiredNpmVersion) < 0) {
                throw new Error(`npm ${this.requiredNpmVersion} o superior es requerido. Versión actual: ${npmVersion}`);
            }
            
            console.log(`   ✅ npm: ${npmVersion}`);
            
        } catch (error) {
            if (error.message.includes('npm')) {
                throw error;
            }
            throw new Error('npm no está instalado. Por favor instala npm junto con Node.js.');
        }

        // Verificar memoria disponible
        try {
            const os = require('os');
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const totalMemoryGB = Math.round(totalMemory / (1024 * 1024 * 1024) * 100) / 100;
            const freeMemoryGB = Math.round(freeMemory / (1024 * 1024 * 1024) * 100) / 100;
            
            console.log(`   📊 Memoria RAM: ${totalMemoryGB}GB total, ${freeMemoryGB}GB disponible`);
            
            if (freeMemoryGB < 1) {
                console.log('   ⚠️  Se recomienda tener al menos 2GB de RAM disponible para mejor rendimiento');
            }
            
        } catch (error) {
            console.log('   ⚠️  No se pudo verificar la memoria RAM');
        }

        console.log('   ✅ Requisitos del sistema verificados\n');
    }

    async createDirectories() {
        console.log('📁 Creando directorios necesarios...');
        
        const directories = [
            'uploads',
            'logs',
            'temp',
            'examples',
            'docs'
        ];

        for (const dir of directories) {
            const dirPath = path.join(this.projectRoot, dir);
            await fs.ensureDir(dirPath);
            
            // Crear .gitkeep para mantener directorios vacíos en git
            const gitkeepPath = path.join(dirPath, '.gitkeep');
            if (!await fs.pathExists(gitkeepPath)) {
                await fs.writeFile(gitkeepPath, '');
            }
            
            console.log(`   ✅ Directorio creado: ${dir}/`);
        }

        console.log('   ✅ Directorios creados\n');
    }

    async installDependencies() {
        console.log('📦 Instalando dependencias...');
        
        try {
            // Instalar dependencias de producción
            console.log('   📥 Instalando dependencias de producción...');
            execSync('npm install', { stdio: 'pipe', cwd: this.projectRoot });
            console.log('   ✅ Dependencias de producción instaladas');
            
            // Instalar dependencias de desarrollo
            console.log('   📥 Instalando dependencias de desarrollo...');
            execSync('npm install --include=dev', { stdio: 'pipe', cwd: this.projectRoot });
            console.log('   ✅ Dependencias de desarrollo instaladas');
            
        } catch (error) {
            throw new Error(`Error instalando dependencias: ${error.message}`);
        }

        console.log('   ✅ Dependencias instaladas\n');
    }

    async verifyInstallation() {
        console.log('🔍 Verificando instalación...');
        
        try {
            // Verificar que los módulos principales se puedan cargar
            const modules = [
                'express',
                'multer',
                'pdf-parse',
                'officeparser',
                'cors',
                'fs-extra'
            ];

            for (const module of modules) {
                try {
                    require.resolve(module);
                    console.log(`   ✅ ${module}`);
                } catch (error) {
                    throw new Error(`Módulo ${module} no encontrado`);
                }
            }

            // Verificar archivos del proyecto
            const requiredFiles = [
                'server.js',
                'package.json',
                'public/index.html',
                'src/parsers/pdfAnalyzer.js',
                'src/parsers/pptxAnalyzer.js',
                'src/advanced/advancedAnalyzer.js'
            ];

            for (const file of requiredFiles) {
                const filePath = path.join(this.projectRoot, file);
                if (await fs.pathExists(filePath)) {
                    console.log(`   ✅ ${file}`);
                } else {
                    throw new Error(`Archivo requerido no encontrado: ${file}`);
                }
            }

        } catch (error) {
            throw new Error(`Error en verificación: ${error.message}`);
        }

        console.log('   ✅ Instalación verificada\n');
    }

    async createEnvironmentFile() {
        console.log('⚙️  Creando archivo de configuración...');
        
        const envPath = path.join(this.projectRoot, '.env');
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        
        const envContent = `# Configuración de Document Analyzer
# Generado automáticamente por setup.js

# Puerto del servidor
PORT=3000

# Tamaño máximo de archivo (bytes) - 50MB por defecto
MAX_FILE_SIZE=52428800

# Máximo de archivos por lote
MAX_BATCH_FILES=10

# Directorio de uploads
UPLOAD_DIR=uploads

# Directorio de logs
LOG_DIR=logs

# Nivel de logging (error, warn, info, debug)
LOG_LEVEL=info

# Modo de operación (development, production)
NODE_ENV=development

# Habilitar CORS
ENABLE_CORS=true

# Timeout de procesamiento (milisegundos)
PROCESSING_TIMEOUT=300000
`;

        const envExampleContent = `# Configuración de Document Analyzer
# Copia este archivo a .env y ajusta los valores según necesites

# Puerto del servidor
PORT=3000

# Tamaño máximo de archivo (bytes) - 50MB por defecto
MAX_FILE_SIZE=52428800

# Máximo de archivos por lote
MAX_BATCH_FILES=10

# Directorio de uploads
UPLOAD_DIR=uploads

# Directorio de logs
LOG_DIR=logs

# Nivel de logging (error, warn, info, debug)
LOG_LEVEL=info

# Modo de operación (development, production)
NODE_ENV=development

# Habilitar CORS
ENABLE_CORS=true

# Timeout de procesamiento (milisegundos)
PROCESSING_TIMEOUT=300000
`;

        // Crear .env si no existe
        if (!await fs.pathExists(envPath)) {
            await fs.writeFile(envPath, envContent);
            console.log('   ✅ .env creado');
        } else {
            console.log('   ℹ️  .env ya existe, omitiendo');
        }

        // Crear .env.example
        await fs.writeFile(envExamplePath, envExampleContent);
        console.log('   ✅ .env.example creado');

        console.log('   ✅ Configuración creada\n');
    }

    async showNextSteps() {
        console.log('🎯 Próximos pasos:');
        console.log('');
        console.log('1. Iniciar la aplicación:');
        console.log('   npm start');
        console.log('');
        console.log('   O en modo desarrollo:');
        console.log('   npm run dev');
        console.log('');
        console.log('2. Abrir el navegador en:');
        console.log('   http://localhost:3000');
        console.log('');
        console.log('3. Probar la funcionalidad:');
        console.log('   - Sube archivos PDF o PPTX');
        console.log('   - Prueba el análisis por lotes');
        console.log('   - Exporta los resultados');
        console.log('');
        console.log('4. Ejecuta ejemplos:');
        console.log('   node examples/sample-usage.js');
        console.log('');
        console.log('📚 Para más información, consulta:');
        console.log('   - README.md');
        console.log('   - examples/sample-usage.js');
        console.log('   - docs/ (documentación adicional)');
    }

    /**
     * Compara dos versiones en formato semántico (x.y.z)
     * @param {string} version1 
     * @param {string} version2 
     * @returns {number} -1 si version1 < version2, 0 si iguales, 1 si version1 > version2
     */
    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part < v2Part) return -1;
            if (v1Part > v2Part) return 1;
        }
        
        return 0;
    }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
    const setup = new SetupManager();
    setup.run().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = SetupManager;