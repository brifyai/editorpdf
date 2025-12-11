const fs = require('fs-extra');
const path = require('path');
const officeParser = require('officeparser');
const advancedAnalyzer = require('../advanced/advancedAnalyzer');
const aiAnalyzer = require('../ai/aiAnalyzer');

class PPTXAnalyzer {
  constructor() {
    this.supportedFormats = ['.pptx'];
  }

  /**
   * Analiza un archivo PPTX y extrae información detallada
   * @param {string} filePath - Ruta al archivo PPTX
   * @param {Object} options - Opciones de análisis
   * @returns {Object} - Análisis completo del PPTX
   */
  async analyzePPTX(filePath, options = {}) {
    try {
      // Configuración para el parsing
      const config = {
        newlineDelimiter: '\n',
        ignoreNotes: false,
        putNotesAtLast: false,
        outputErrorToConsole: false
      };

      // Extraer texto del PPTX
      const extractedText = await officeParser.parseOfficeAsync(filePath, config);
      
      // Análisis detallado del contenido
      const analysis = {
        // Información básica del documento
        documentInfo: {
          title: this.extractTitle(filePath),
          author: 'Desconocido',
          subject: '',
          creator: '',
          keywords: ''
        },
        
        // Estadísticas del documento
        statistics: {
          totalSlides: this.countSlides(extractedText),
          totalWords: this.countWords(extractedText),
          totalCharacters: extractedText.length,
          totalLines: extractedText.split('\n').length,
          averageWordsPerSlide: Math.round(this.countWords(extractedText) / this.countSlides(extractedText)),
          fileSize: await this.getFileSize(filePath)
        },

        // Análisis de contenido
        content: {
          fullText: extractedText,
          cleanText: this.cleanText(extractedText),
          slides: this.extractSlides(extractedText),
          paragraphs: this.extractParagraphs(extractedText),
          sentences: this.extractSentences(extractedText),
          words: this.extractWords(extractedText)
        },

        // Análisis avanzado
        advanced: {
          readabilityScore: this.calculateReadabilityScore(extractedText),
          language: this.detectLanguage(extractedText),
          keywords: this.extractKeywords(extractedText),
          phrases: this.extractCommonPhrases(extractedText),
          numbers: this.extractNumbers(extractedText),
          emails: this.extractEmails(extractedText),
          urls: this.extractURLs(extractedText),
          dates: this.extractDates(extractedText),
          ...advancedAnalyzer.performCompleteAnalysis(extractedText, 'pptx')
        },

        // Análisis con IA
        aiAnalysis: options.useAI ? await aiAnalyzer.performCombinedAnalysis(extractedText, 'pptx', {
          analysisType: options.aiAnalysisType || 'balanced'
        }) : null,

        // Estructura de la presentación
        structure: {
          hasTitleSlides: this.detectTitleSlides(extractedText),
          hasBulletPoints: this.detectBulletPoints(extractedText),
          hasTables: this.detectTables(extractedText),
          hasCharts: this.detectCharts(extractedText),
          hasImages: this.detectImages(extractedText),
          hasSpeakerNotes: this.detectSpeakerNotes(extractedText)
        },

        // Análisis específico de presentaciones
        presentation: {
          slideTitles: this.extractSlideTitles(extractedText),
          keyTopics: this.extractKeyTopics(extractedText),
          actionItems: this.extractActionItems(extractedText),
          questions: this.extractQuestions(extractedText),
          conclusions: this.extractConclusions(extractedText)
        },

        // Metadatos técnicos
        technical: {
          format: 'PPTX',
          isTemplate: this.detectTemplate(extractedText),
          hasAnimations: this.detectAnimations(extractedText),
          hasTransitions: this.detectTransitions(extractedText)
        }
      };

      return analysis;

    } catch (error) {
      throw new Error(`Error analizando PPTX: ${error.message}`);
    }
  }

  /**
   * Extrae el título del nombre del archivo
   */
  extractTitle(filePath) {
    const filename = path.basename(filePath, '.pptx');
    return filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Cuenta el número de diapositivas (estimado)
   */
  countSlides(text) {
    // Busca patrones que sugieren nuevas diapositivas
    const slideMarkers = text.match(/\n\s*\n/g) || [];
    return Math.max(1, slideMarkers.length + 1);
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
   * Extrae diapositivas individuales
   */
  extractSlides(text) {
    // Divide el texto en posibles diapositivas
    const slides = text.split(/\n\s*\n/);
    return slides
      .filter(slide => slide.trim().length > 0)
      .map((slide, index) => ({
        slideNumber: index + 1,
        content: slide.trim(),
        wordCount: this.countWords(slide),
        hasTitle: this.hasSlideTitle(slide),
        hasBulletPoints: this.hasBulletPoints(slide)
      }));
  }

  /**
   * Verifica si una diapositiva tiene título
   */
  hasSlideTitle(slideText) {
    const lines = slideText.split('\n').filter(line => line.trim().length > 0);
    return lines.length > 0 && lines[0].length < 100 && lines[0].trim().length > 0;
  }

  /**
   * Verifica si una diapositiva tiene viñetas
   */
  hasBulletPoints(slideText) {
    return /^[•\-\*]\s|^\d+\.\s/m.test(slideText);
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
   * Calcula puntaje de legibilidad
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
   * Detecta el idioma del texto
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
   * Detecta diapositivas de título
   */
  detectTitleSlides(text) {
    const slides = this.extractSlides(text);
    return slides.some(slide => slide.hasTitle && slide.wordCount < 50);
  }

  /**
   * Detecta viñetas
   */
  detectBulletPoints(text) {
    return /^[•\-\*]\s|^\d+\.\s/m.test(text);
  }

  /**
   * Detecta tablas (simplificado)
   */
  detectTables(text) {
    return text.includes('|') || text.includes('\t') || /\s{3,}/.test(text);
  }

  /**
   * Detecta gráficos (basado en palabras clave)
   */
  detectCharts(text) {
    const chartKeywords = ['gráfico', 'gráfica', 'chart', 'graph', 'diagrama', 'figura', 'figura'];
    return chartKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Detecta imágenes (basado en palabras clave)
   */
  detectImages(text) {
    const imageKeywords = ['imagen', 'image', 'foto', 'photograph', 'gráfico', 'illustración'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Detecta notas del presentador
   */
  detectSpeakerNotes(text) {
    const noteKeywords = ['nota', 'note', 'comentario', 'comment', 'observación', 'remark'];
    return noteKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Extrae títulos de diapositivas
   */
  extractSlideTitles(text) {
    const slides = this.extractSlides(text);
    return slides
      .filter(slide => slide.hasTitle)
      .map(slide => {
        const lines = slide.content.split('\n');
        return lines[0].trim();
      })
      .filter(title => title.length > 0);
  }

  /**
   * Extrae temas clave
   */
  extractKeyTopics(text) {
    const keywords = this.extractKeywords(text);
    return keywords.slice(0, 10).map(item => item.word);
  }

  /**
   * Extrae elementos de acción
   */
  extractActionItems(text) {
    const actionPatterns = [
      /(?:accionar|acción|action|tarea|task|realizar|ejecutar)\s*:\s*(.+)/gi,
      /(?:debe|must|should|hay que)\s+(.+?)(?:\.|$)/gi
    ];
    
    const actions = [];
    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        actions.push(...matches.map(m => m.trim()));
      }
    });
    
    return [...new Set(actions)];
  }

  /**
   * Extrae preguntas
   */
  extractQuestions(text) {
    const questionPattern = /[¿?]\s*[^¿?]*[¿?]/g;
    return [...new Set(text.match(questionPattern) || [])];
  }

  /**
   * Extrae conclusiones
   */
  extractConclusions(text) {
    const conclusionKeywords = ['conclusión', 'conclusión', 'conclusión', 'resumen', 'summary', 'final', 'finalmente'];
    const sentences = this.extractSentences(text);
    
    return sentences.filter(sentence => 
      conclusionKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Detecta si es una plantilla
   */
  detectTemplate(text) {
    const templateKeywords = ['plantilla', 'template', 'haga clic', 'click here', 'ejemplo', 'example'];
    return templateKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Detecta animaciones (basado en palabras clave)
   */
  detectAnimations(text) {
    const animationKeywords = ['animación', 'animation', 'transición', 'transition', 'efecto', 'effect'];
    return animationKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Detecta transiciones (basado en palabras clave)
   */
  detectTransitions(text) {
    const transitionKeywords = ['transición', 'transition', 'cambiar', 'change', 'siguiente', 'next'];
    return transitionKeywords.some(keyword => text.toLowerCase().includes(keyword));
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

module.exports = new PPTXAnalyzer();