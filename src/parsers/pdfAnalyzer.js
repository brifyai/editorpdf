const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-parse');
const advancedAnalyzer = require('../advanced/advancedAnalyzer');
const aiAnalyzer = require('../ai/aiAnalyzer');

class PDFAnalyzer {
  constructor() {
    this.supportedFormats = ['.pdf'];
  }

  /**
   * Analiza un archivo PDF y extrae información detallada
   * @param {string} filePath - Ruta al archivo PDF
   * @param {Object} options - Opciones de análisis
   * @returns {Object} - Análisis completo del PDF
   */
  async analyzePDF(filePath, options = {}) {
    try {
      // Leer el archivo PDF
      const dataBuffer = await fs.readFile(filePath);
      
      // Configuración avanzada para el parsing
      const pdfOptions = {
        // Función personalizada para renderizar páginas
        pagerender: this.customPageRenderer.bind(this),
        // Máximo de páginas a procesar (0 = todas)
        max: 0,
        // Versión de PDF.js a usar
        version: 'v2.0.550'
      };

      // Parsear el PDF
      const data = await pdf(dataBuffer, pdfOptions);

      // Análisis detallado del contenido
      const analysis = {
        // Información básica del documento
        documentInfo: {
          title: data.info?.Title || 'Sin título',
          author: data.info?.Author || 'Desconocido',
          subject: data.info?.Subject || '',
          creator: data.info?.Creator || '',
          producer: data.info?.Producer || '',
          creationDate: data.info?.CreationDate || '',
          modificationDate: data.info?.ModDate || '',
          keywords: data.info?.Keywords || ''
        },
        
        // Estadísticas del documento
        statistics: {
          totalPages: data.numpages,
          renderedPages: data.numrender,
          totalWords: this.countWords(data.text),
          totalCharacters: data.text.length,
          totalLines: data.text.split('\n').length,
          averageWordsPerPage: Math.round(this.countWords(data.text) / data.numpages),
          fileSize: await this.getFileSize(filePath)
        },

        // Análisis de contenido
        content: {
          fullText: data.text,
          textByPage: data.pageData || [],
          cleanText: this.cleanText(data.text),
          paragraphs: this.extractParagraphs(data.text),
          sentences: this.extractSentences(data.text),
          words: this.extractWords(data.text)
        },

        // Análisis avanzado
        advanced: {
          readabilityScore: this.calculateReadabilityScore(data.text),
          language: this.detectLanguage(data.text),
          keywords: this.extractKeywords(data.text),
          phrases: this.extractCommonPhrases(data.text),
          numbers: this.extractNumbers(data.text),
          emails: this.extractEmails(data.text),
          urls: this.extractURLs(data.text),
          dates: this.extractDates(data.text),
          ...advancedAnalyzer.performCompleteAnalysis(data.text, 'pdf')
        },

        // Análisis con IA
        aiAnalysis: options.useAI ? await aiAnalyzer.performCombinedAnalysis(data.text, 'pdf', {
          analysisType: options.aiAnalysisType || 'balanced'
        }) : null,

        // Estructura del documento
        structure: {
          hasHeaders: this.detectHeaders(data.text),
          hasFooters: this.detectFooters(data.text),
          hasTables: this.detectTables(data.text),
          hasLists: this.detectLists(data.text),
          hasImages: data.info?.HasImages || false
        },

        // Metadatos técnicos
        technical: {
          pdfVersion: data.version,
          isEncrypted: data.info?.Encrypted || false,
          isSigned: data.info?.Signed || false,
          isOptimized: data.info?.Optimized || false,
          formFields: data.info?.HasFormFields || false
        }
      };

      return analysis;

    } catch (error) {
      throw new Error(`Error analizando PDF: ${error.message}`);
    }
  }

  /**
   * Función personalizada para renderizar páginas
   */
  customPageRenderer(pageData) {
    const render_options = {
      normalizeWhitespace: true,
      disableCombineTextItems: false
    };

    return pageData.getTextContent(render_options)
      .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        return text;
      });
  }

  /**
   * Limpia y normaliza el texto
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Cuenta palabras en el texto
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extrae párrafos del texto
   */
  extractParagraphs(text) {
    return text
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
  }

  /**
   * Extrae oraciones del texto
   */
  extractSentences(text) {
    return text
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());
  }

  /**
   * Extrae palabras únicas del texto
   */
  extractWords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return [...new Set(words)].sort();
  }

  /**
   * Calcula puntaje de legibilidad (Flesch Reading Ease)
   */
  calculateReadabilityScore(text) {
    const sentences = this.extractSentences(text);
    const words = this.extractWords(text);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Cuenta sílabas en una palabra (simplificado)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    const matches = word.match(/[aeiouAEIOU]/g);
    return matches ? matches.length : 1;
  }

  /**
   * Detecta el idioma del texto (simplificado)
   */
  detectLanguage(text) {
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'];
    const englishWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but'];
    
    const words = this.extractWords(text).slice(0, 100);
    const spanishCount = words.filter(w => spanishWords.includes(w)).length;
    const englishCount = words.filter(w => englishWords.includes(w)).length;
    
    if (spanishCount > englishCount) return 'es';
    if (englishCount > spanishCount) return 'en';
    return 'unknown';
  }

  /**
   * Extrae palabras clave del texto
   */
  extractKeywords(text) {
    const words = this.extractWords(text);
    const stopWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'the', 'and', 'that', 'have', 'for'];
    
    const filtered = words.filter(word => !stopWords.includes(word));
    const frequency = {};
    
    filtered.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * Extrae frases comunes
   */
  extractCommonPhrases(text) {
    const phrases = text.match(/\b[A-Za-zÀ-ÿ\s]{4,}\b/g) || [];
    const frequency = {};
    
    phrases.forEach(phrase => {
      const clean = phrase.trim().toLowerCase();
      if (clean.length > 10) {
        frequency[clean] = (frequency[clean] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .filter(([,count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));
  }

  /**
   * Extrae números del texto
   */
  extractNumbers(text) {
    const numbers = text.match(/\b\d+\.?\d*\b/g) || [];
    return [...new Set(numbers)].map(n => parseFloat(n));
  }

  /**
   * Extrae emails del texto
   */
  extractEmails(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return [...new Set(text.match(emailRegex) || [])];
  }

  /**
   * Extrae URLs del texto
   */
  extractURLs(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return [...new Set(text.match(urlRegex) || [])];
  }

  /**
   * Extrae fechas del texto
   */
  extractDates(text) {
    const dateRegex = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g;
    return [...new Set(text.match(dateRegex) || [])];
  }

  /**
   * Detecta encabezados
   */
  detectHeaders(text) {
    const lines = text.split('\n');
    return lines.some(line => line.trim().length > 0 && line.trim().length < 100 && line === line.toUpperCase());
  }

  /**
   * Detecta pies de página
   */
  detectFooters(text) {
    const lines = text.split('\n');
    return lines.some(line => line.includes('Página') || line.includes('Page') || /^\d+$/.test(line.trim()));
  }

  /**
   * Detecta tablas (simplificado)
   */
  detectTables(text) {
    return text.includes('|') || text.includes('\t') || /\s{3,}/.test(text);
  }

  /**
   * Detecta listas
   */
  detectLists(text) {
    return /^[•\-\*]\s|^\d+\.\s/m.test(text);
  }

  /**
   * Obtiene el tamaño del archivo
   */
  async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return {
      bytes: stats.size,
      kb: Math.round(stats.size / 1024 * 100) / 100,
      mb: Math.round(stats.size / (1024 * 1024) * 100) / 100
    };
  }
}

module.exports = new PDFAnalyzer();