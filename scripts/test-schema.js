/**
 * Script para probar el schema SQL paso a paso
 * Identifica errores específicos en el schema
 */

const fs = require('fs');
const path = require('path');

class SchemaTester {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.schemaFile = path.join(this.projectRoot, 'database', 'supabase-schema.sql');
        this.errors = [];
        this.warnings = [];
    }

    async testSchema() {
        console.log('🔍 Analizando schema SQL en busca de errores...\n');
        
        try {
            const schemaContent = fs.readFileSync(this.schemaFile, 'utf8');
            
            // Dividir el schema en statements individuales
            const statements = this.parseSQLStatements(schemaContent);
            
            console.log(`📊 Encontrados ${statements.length} statements SQL\n`);
            
            // Analizar cada statement
            this.analyzeStatements(statements);
            
            // Verificar consistencia de columnas
            this.checkColumnConsistency(schemaContent);
            
            // Mostrar resultados
            this.showResults();
            
        } catch (error) {
            console.error('❌ Error analizando schema:', error);
            process.exit(1);
        }
    }

    parseSQLStatements(content) {
        // Eliminar comentarios y dividir por ;
        const cleaned = content
            .split('--')
            .map(line => line.split('\n').slice(1).join('\n'))
            .join('\n');
        
        return cleaned
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    }

    analyzeStatements(statements) {
        console.log('🔎 Analizando statements...\n');
        
        statements.forEach((statement, index) => {
            const lineNum = index + 1;
            
            // Buscar referencias a created_at en tabla documents
            if (statement.includes('documents') && statement.includes('created_at')) {
                // Verificar si es una referencia incorrecta
                if (!statement.includes('uploaded_at') && 
                    (statement.includes('SELECT') || statement.includes('INDEX'))) {
                    this.errors.push({
                        line: lineNum,
                        type: 'INVALID_COLUMN_REFERENCE',
                        message: 'Referencia a created_at en tabla documents (debería ser uploaded_at)',
                        statement: statement.substring(0, 100) + '...'
                    });
                }
            }
            
            // Verificar definiciones de tablas
            if (statement.startsWith('CREATE TABLE')) {
                this.checkTableDefinition(statement, lineNum);
            }
            
            // Verificar índices
            if (statement.includes('CREATE INDEX')) {
                this.checkIndexDefinition(statement, lineNum);
            }
        });
    }

    checkTableDefinition(statement, lineNum) {
        // Verificar tabla documents
        if (statement.includes('public.documents')) {
            if (statement.includes('created_at') && !statement.includes('uploaded_at')) {
                this.errors.push({
                    line: lineNum,
                    type: 'INVALID_TABLE_DEFINITION',
                    message: 'Tabla documents definida con created_at en lugar de uploaded_at',
                    statement: statement.substring(0, 100) + '...'
                });
            }
        }
    }

    checkIndexDefinition(statement, lineNum) {
        // Verificar índices en tabla documents
        if (statement.includes('public.documents(') && statement.includes('created_at')) {
            this.errors.push({
                line: lineNum,
                type: 'INVALID_INDEX_DEFINITION',
                message: 'Índice en tabla documents usando createdat (debería ser uploaded_at)',
                statement: statement.substring(0, 100) + '...'
            });
        }
    }

    checkColumnConsistency(content) {
        console.log('🔍 Verificando consistencia de columnas...\n');
        
        // Extraer definición de tabla documents
        const tableMatch = content.match(/CREATE TABLE.*?public\.documents\s*\((.*?)\);/gs);
        if (tableMatch) {
            const tableDef = tableMatch[0];
            
            // Verificar que tenga uploaded_at y no created_at
            if (tableDef.includes('uploaded_at')) {
                console.log('✅ Tabla documents tiene columna uploaded_at');
            } else {
                this.errors.push({
                    line: 'TABLE_DEF',
                    type: 'MISSING_COLUMN',
                    message: 'Tabla documents no tiene columna uploaded_at'
                });
            }
            
            if (tableDef.includes('created_at')) {
                this.errors.push({
                    line: 'TABLE_DEF',
                    type: 'EXTRA_COLUMN',
                    message: 'Tabla documents tiene columna created_at que no debería existir'
                });
            }
        }
        
        // Verificar vistas
        const views = content.match(/CREATE.*VIEW.*?AS\s*(.*?);/gs) || [];
        views.forEach((view, index) => {
            if (view.includes('documents') && view.includes('created_at')) {
                // Verificar si es una referencia válida
                if (!view.includes('uploaded_at') && view.includes('d.created_at')) {
                    this.errors.push({
                        line: `VIEW_${index + 1}`,
                        type: 'INVALID_VIEW_REFERENCE',
                        message: 'Vista hace referencia a d.created_at (debería ser d.uploaded_at)',
                        statement: view.substring(0, 100) + '...'
                    });
                }
            }
        });
    }

    showResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESULTADOS DEL ANÁLISIS');
        console.log('='.repeat(60));
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('\n✅ ¡No se encontraron errores! El schema está correcto.\n');
            return;
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ERRORES ENCONTRADOS (${this.errors.length}):\n`);
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] Línea ${error.line}: ${error.message}`);
                if (error.statement) {
                    console.log(`   Statement: ${error.statement}`);
                }
                console.log('');
            });
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️ ADVERTENCIAS (${this.warnings.length}):\n`);
            this.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.message}`);
                console.log('');
            });
        }
        
        // Recomendaciones
        if (this.errors.length > 0) {
            console.log('💡 RECOMENDACIONES:\n');
            console.log('1. Corregir los errores encontrados antes de ejecutar el schema');
            console.log('2. Verificar que todas las referencias a created_at en documentos usen uploaded_at');
            console.log('3. Ejecutar el schema corregido en Supabase SQL Editor');
            console.log('4. Probar la conexión con el cliente de Supabase');
        }
    }
}

// Ejecutar prueba
if (require.main === module) {
    const tester = new SchemaTester();
    tester.testSchema().catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}

module.exports = SchemaTester;