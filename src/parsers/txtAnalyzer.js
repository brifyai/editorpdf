/**
 * Analizador de archivos de texto (.txt)
 * Procesa archivos de texto plano y genera análisis completo
 */

const fs = require('fs-extra');
const path = require('path');

class TXTAnalyzer {
    constructor() {
        this.supportedExtensions = ['.txt', '.text'];
    }

    /**
     * Analizar archivo de texto
     * @param {string} filePath - Ruta del archivo
     * @param {Object} options - Opciones de análisis
     * @returns {Object} - Análisis completo del texto
     */
    async analyzeTXT(filePath, options = {}) {
        const startTime = Date.now();
        
        try {
            console.log('📄 Iniciando análisis de archivo TXT:', filePath);
            
            // Leer archivo
            const content = await fs.readFile(filePath, 'utf-8');
            
            if (!content) {
                throw new Error('El archivo está vacío o no se pudo leer');
            }

            // Análisis básico del contenido
            const basicAnalysis = this.analyzeBasicContent(content);
            
            // Análisis avanzado del contenido
            const advancedAnalysis = this.analyzeAdvancedContent(content);
            
            // Análisis de estructura
            const structureAnalysis = this.analyzeStructure(content);
            
            // Información del documento
            const documentInfo = await this.getDocumentInfo(filePath);
            
            // Estadísticas completas
            const statistics = this.generateStatistics(content, basicAnalysis);
            
            // Análisis con IA si está habilitado
            let aiAnalysis = null;
            if (options.useAI) {
                try {
                    const aiAnalyzer = require('../ai/aiAnalyzer');
                    const aiResult = await aiAnalyzer.performAIAnalysis(content, 'txt', {
                        analysisType: options.aiAnalysisType || 'balanced',
                        selectedModel: options.selectedModel
                    });
                    aiAnalysis = aiResult.aiAnalysis;
                } catch (aiError) {
                    console.warn('⚠️ Error en análisis con IA:', aiError.message);
                }
            }

            const processingTime = Date.now() - startTime;
            
            const analysisResult = {
                documentInfo,
                statistics,
                content: {
                    paragraphs: this.extractParagraphs(content),
                    sentences: this.extractSentences(content),
                    words: this.extractWords(content),
                    characters: content.length
                },
                advanced: advancedAnalysis,
                structure: structureAnalysis,
                aiAnalysis: aiAnalysis,
                processingInfo: {
                    fileSize: (await fs.stat(filePath)).size,
                    processingTime: processingTime,
                    contentLength: content.length,
                    encoding: 'utf-8'
                }
            };

            console.log('✅ Análisis TXT completado en', processingTime, 'ms');
            return analysisResult;

        } catch (error) {
            console.error('❌ Error analizando archivo TXT:', error);
            throw new Error(`Error analizando archivo TXT: ${error.message}`);
        }
    }

    /**
     * Análisis básico del contenido
     */
    analyzeBasicContent(content) {
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        return {
            totalLines: lines.length,
            totalWords: words.length,
            totalSentences: sentences.length,
            totalCharacters: content.length,
            nonSpaceCharacters: content.replace(/\s/g, '').length,
            averageWordsPerLine: Math.round(words.length / lines.length),
            averageWordsPerSentence: Math.round(words.length / sentences.length),
            averageCharactersPerLine: Math.round(content.length / lines.length)
        };
    }

    /**
     * Análisis avanzado del contenido
     */
    analyzeAdvancedContent(content) {
        const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        // Análisis de palabras clave
        const wordFreq = {};
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (cleanWord.length > 2) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
            }
        });

        const keywords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));

        // Detectar idioma básico
        const language = this.detectLanguage(content);
        
        // Calcular legibilidad básica
        const readabilityScore = this.calculateReadabilityScore(content);
        
        // Extraer entidades
        const entities = this.extractEntities(content);
        
        // Análisis de sentimiento básico
        const sentiment = this.analyzeBasicSentiment(content);

        return {
            keywords,
            language,
            readabilityScore,
            entities,
            sentiment,
            complexity: this.calculateComplexity(content),
            topics: this.extractTopics(content)
        };
    }

    /**
     * Análisis de estructura del documento
     */
    analyzeStructure(content) {
        const lines = content.split('\n');
        
        // Detectar encabezados (líneas que parecen títulos)
        const headers = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && 
                   trimmed.length < 100 && 
                   /^[A-ZÁÉÍÓÚÑ\s\d\.\-\(\)]+$/.test(trimmed) &&
                   !trimmed.endsWith('.');
        });

        // Detectar listas
        const listItems = lines.filter(line => {
            const trimmed = line.trim();
            return /^[\s]*[-*•]\s+/.test(trimmed) || 
                   /^[\s]*\d+\.\s+/.test(trimmed);
        });

        // Detectar párrafos
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        return {
            hasHeaders: headers.length > 0,
            hasLists: listItems.length > 0,
            hasParagraphs: paragraphs.length > 1,
            headerCount: headers.length,
            listItemCount: listItems.length,
            paragraphCount: paragraphs.length,
            structureType: this.determineStructureType(headers, listItems, paragraphs)
        };
    }

    /**
     * Obtener información del documento
     */
    async getDocumentInfo(filePath) {
        const stats = await fs.stat(filePath);
        const filename = path.basename(filePath);
        
        return {
            title: filename.replace(/\.[^/.]+$/, ''),
            author: 'Desconocido',
            subject: 'Documento de texto',
            creator: 'TXT Analyzer',
            producer: 'Document Analyzer App',
            keywords: '',
            creationDate: stats.birthtime,
            modificationDate: stats.mtime,
            fileSize: stats.size
        };
    }

    /**
     * Generar estadísticas completas
     */
    generateStatistics(content, basicAnalysis) {
        const fileSizeBytes = Buffer.byteLength(content, 'utf8');
        
        return {
            totalPages: 1, // Los archivos de texto no tienen páginas
            totalWords: basicAnalysis.totalWords,
            totalCharacters: basicAnalysis.totalCharacters,
            totalLines: basicAnalysis.totalLines,
            totalSentences: basicAnalysis.totalSentences,
            averageWordsPerPage: basicAnalysis.totalWords,
            averageWordsPerLine: basicAnalysis.averageWordsPerLine,
            fileSize: {
                bytes: fileSizeBytes,
                kb: (fileSizeBytes / 1024).toFixed(2),
                mb: (fileSizeBytes / (1024 * 1024)).toFixed(2)
            },
            density: {
                charactersPerWord: (basicAnalysis.totalCharacters / basicAnalysis.totalWords).toFixed(2),
                wordsPerSentence: (basicAnalysis.totalWords / basicAnalysis.totalSentences).toFixed(2)
            }
        };
    }

    /**
     * Extraer párrafos
     */
    extractParagraphs(content) {
        return content.split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
    }

    /**
     * Extraer oraciones
     */
    extractSentences(content) {
        return content.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /**
     * Extraer palabras
     */
    extractWords(content) {
        return content.split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length > 0);
    }

    /**
     * Detectar idioma básico
     */
    detectLanguage(content) {
        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las'];
        const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
        
        const words = content.toLowerCase().split(/\s+/);
        let spanishCount = 0;
        let englishCount = 0;
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (spanishWords.includes(cleanWord)) spanishCount++;
            if (englishWords.includes(cleanWord)) englishCount++;
        });
        
        if (spanishCount > englishCount) return 'es';
        if (englishCount > spanishCount) return 'en';
        return 'unknown';
    }

    /**
     * Calcular puntaje de legibilidad básico
     */
    calculateReadabilityScore(content) {
        const sentences = content.split(/[.!?]+/).length;
        const words = content.split(/\s+/).length;
        const syllables = this.countSyllables(content);
        
        if (sentences === 0 || words === 0) return 0;
        
        // Fórmula de Flesch simplificada
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Contar sílabas básicas
     */
    countSyllables(text) {
        return text.toLowerCase()
            .replace(/[^a-záéíóúñü]/g, '')
            .replace(/[aeiouáéíóúñü]+/g, 'a')
            .replace(/^a|a$/g, '')
            .length + 1;
    }

    /**
     * Extraer entidades básicas
     */
    extractEntities(content) {
        const emails = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
        const urls = content.match(/\bhttps?:\/\/[^\s]+/g) || [];
        const phones = content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
        const dates = content.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g) || [];
        
        return {
            emails,
            urls,
            phones,
            dates,
            numbers: content.match(/\b\d+\b/g) || []
        };
    }

    /**
     * Análisis de sentimiento básico
     */
    analyzeBasicSentiment(content) {
        const positiveWords = ['bueno', 'excelente', 'genial', 'fantástico', 'maravilloso', 'good', 'great', 'excellent', 'fantastic', 'wonderful'];
        const negativeWords = ['malo', 'terrible', 'horrible', 'pésimo', 'awful', 'terrible', 'horrible', 'bad', 'worst'];
        
        const words = content.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (positiveWords.includes(cleanWord)) positiveCount++;
            if (negativeWords.includes(cleanWord)) negativeCount++;
        });
        
        let sentiment = 'neutral';
        if (positiveCount > negativeCount) sentiment = 'positive';
        else if (negativeCount > positiveCount) sentiment = 'negative';
        
        return {
            sentiment,
            confidence: Math.min(0.9, (positiveCount + negativeCount) / words.length * 10),
            positiveWords: positiveCount,
            negativeWords: negativeCount
        };
    }

    /**
     * Calcular complejidad del texto
     */
    calculateComplexity(content) {
        const words = content.split(/\s+/).length;
        const sentences = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = words / sentences;
        
        if (avgWordsPerSentence < 10) return 'simple';
        if (avgWordsPerSentence < 20) return 'moderate';
        return 'complex';
    }

    /**
     * Extraer temas básicos
     */
    extractTopics(content) {
        const words = content.toLowerCase().split(/\s+/);
        const wordFreq = {};
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (cleanWord.length > 4) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
            }
        });
        
        return Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ topic: word, relevance: count }));
    }

    /**
     * Determinar tipo de estructura
     */
    determineStructureType(headers, lists, paragraphs) {
        if (headers.length > 0 && lists.length > 0) return 'structured_document';
        if (headers.length > 0) return 'formatted_text';
        if (lists.length > 0) return 'list_based';
        if (paragraphs.length > 1) return 'narrative';
        return 'simple_text';
    }
}

module.exports = new TXTAnalyzer();