const fs = require('fs-extra');
const path = require('path');

class AdvancedAnalyzer {
  constructor() {
    this.sentimentPatterns = {
      positive: ['bueno', 'excelente', 'perfecto', 'increíble', 'amazing', 'great', 'excellent', 'wonderful'],
      negative: ['malo', 'terrible', 'pésimo', 'horrible', 'awful', 'terrible', 'horrible', 'bad'],
      neutral: ['información', 'reporte', 'análisis', 'documento', 'information', 'report', 'analysis', 'document']
    };
  }

  /**
   * Realiza análisis avanzado del sentimiento del texto
   * @param {string} text - Texto a analizar
   * @returns {Object} - Análisis de sentimiento
   */
  analyzeSentiment(text) {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    words.forEach(word => {
      if (this.sentimentPatterns.positive.some(pattern => word.includes(pattern))) {
        positiveCount++;
      } else if (this.sentimentPatterns.negative.some(pattern => word.includes(pattern))) {
        negativeCount++;
      } else if (this.sentimentPatterns.neutral.some(pattern => word.includes(pattern))) {
        neutralCount++;
      }
    });

    const total = positiveCount + negativeCount + neutralCount;
    
    return {
      positive: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
      negative: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
      neutral: total > 0 ? Math.round((neutralCount / total) * 100) : 0,
      dominant: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral',
      confidence: total > 0 ? Math.max(positiveCount, negativeCount, neutralCount) / total : 0
    };
  }

  /**
   * Extrae entidades nombradas (simplificado)
   * @param {string} text - Texto a analizar
   * @returns {Object} - Entidades encontradas
   */
  extractNamedEntities(text) {
    // Patrones para detectar entidades
    const patterns = {
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phones: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      dates: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g,
      urls: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      currencies: /[$€£¥]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?[$€£¥]/g,
      percentages: /\d+(?:\.\d+)?%/g,
      companies: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Ltd|LLC|Corp|SA|S\.A\.))\b/g,
      locations: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:St|Ave|Dr|Blvd|Road|Street|Avenue|Drive|Boulevard))\b/g
    };

    const entities = {};
    
    Object.keys(patterns).forEach(type => {
      const matches = text.match(patterns[type]);
      entities[type] = matches ? [...new Set(matches)] : [];
    });

    // Detectar posibles nombres propios (palabras que comienzan con mayúscula)
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    entities.properNouns = [...new Set(properNouns.filter(word => 
      word.length > 2 && 
      !entities.companies.includes(word) && 
      !entities.locations.includes(word)
    ))];

    return entities;
  }

  /**
   * Analiza la complejidad del texto
   * @param {string} text - Texto a analizar
   * @returns {Object} - Métricas de complejidad
   */
  analyzeComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Calcular longitud promedio de oración
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;

    // Calcular longitud promedio de palabra
    const avgWordLength = words.length > 0 ? words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;

    // Contar palabras complejas (más de 3 sílabas)
    const complexWords = words.filter(word => this.countSyllables(word) > 3).length;

    // Índice Gunning Fog (simplificado)
    const gunningFog = 0.4 * (avgSentenceLength + 100 * (complexWords / words.length));

    // Nivel de educación estimado
    let educationLevel = 'Primaria';
    if (gunningFog > 12) educationLevel = 'Universidad';
    else if (gunningFog > 8) educationLevel = 'Secundaria';
    else if (gunningFog > 6) educationLevel = 'Media';

    return {
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      complexWordsCount: complexWords,
      complexWordsPercentage: Math.round((complexWords / words.length) * 100),
      gunningFogIndex: Math.round(gunningFog * 10) / 10,
      educationLevel,
      difficulty: gunningFog > 12 ? 'Difícil' : gunningFog > 8 ? 'Medio' : 'Fácil'
    };
  }

  /**
   * Detecta el tipo de documento basado en el contenido
   * @param {string} text - Texto a analizar
   * @param {string} fileType - Tipo de archivo (pdf/pptx)
   * @returns {Object} - Clasificación del documento
   */
  classifyDocument(text, fileType) {
    const patterns = {
      academic: ['abstract', 'introduction', 'methodology', 'results', 'conclusion', 'references', 'resumen', 'introducción', 'metodología', 'resultados', 'conclusión', 'referencias'],
      business: ['executive', 'summary', 'report', 'analysis', 'strategy', 'proposal', 'budget', 'revenue', 'profit', 'ejecutivo', 'resumen', 'informe', 'análisis', 'estrategia', 'propuesta', 'presupuesto'],
      legal: ['contract', 'agreement', 'terms', 'conditions', 'liability', 'warranty', 'clause', 'contrato', 'acuerdo', 'términos', 'condiciones', 'responsabilidad', 'garantía', 'cláusula'],
      technical: ['specification', 'requirements', 'implementation', 'architecture', 'algorithm', 'database', 'interface', 'especificación', 'requisitos', 'implementación', 'arquitectura', 'algoritmo'],
      medical: ['patient', 'diagnosis', 'treatment', 'symptoms', 'therapy', 'medication', 'clinical', 'paciente', 'diagnóstico', 'tratamiento', 'síntomas', 'terapia', 'medicación', 'clínico'],
      financial: ['investment', 'portfolio', 'assets', 'liabilities', 'revenue', 'expenses', 'profit', 'loss', 'inversión', 'cartera', 'activos', 'pasivos', 'ingresos', 'gastos']
    };

    const textLower = text.toLowerCase();
    const scores = {};

    Object.keys(patterns).forEach(type => {
      scores[type] = 0;
      patterns[type].forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          scores[type] += matches.length;
        }
      });
    });

    // Encontrar el tipo con mayor puntuación
    const maxScore = Math.max(...Object.values(scores));
    const detectedType = maxScore > 0 ? Object.keys(scores).find(key => scores[key] === maxScore) : 'general';

    // Calcular confianza
    const totalMatches = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalMatches > 0 ? Math.round((maxScore / totalMatches) * 100) : 0;

    return {
      type: detectedType,
      confidence,
      scores,
      isPresentation: fileType === 'pptx',
      suggestedTitle: this.generateSuggestedTitle(text, detectedType)
    };
  }

  /**
   * Genera un título sugerido basado en el contenido
   * @param {string} text - Texto del documento
   * @param {string} documentType - Tipo de documento detectado
   * @returns {string} - Título sugerido
   */
  generateSuggestedTitle(text, documentType) {
    const firstParagraph = text.split('\n\n')[0] || '';
    const words = firstParagraph.split(/\s+/).filter(w => w.length > 3);
    
    if (words.length >= 3) {
      const titleWords = words.slice(0, 5).join(' ');
      const typePrefix = {
        academic: 'Informe Académico: ',
        business: 'Informe de Negocio: ',
        legal: 'Documento Legal: ',
        technical: 'Documento Técnico: ',
        medical: 'Informe Médico: ',
        financial: 'Informe Financiero: ',
        general: 'Documento: '
      };
      
      return typePrefix[documentType] + titleWords;
    }
    
    return `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document`;
  }

  /**
   * Extrae resumen automático del texto
   * @param {string} text - Texto a resumir
   * @param {number} maxSentences - Número máximo de oraciones en el resumen
   * @returns {Object} - Resumen y estadísticas
   */
  generateSummary(text, maxSentences = 3) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length <= maxSentences) {
      return {
        summary: sentences.join('. '),
        originalLength: sentences.length,
        summaryLength: sentences.length,
        compressionRatio: 1.0,
        method: 'complete'
      };
    }

    // Algoritmo simple de extracción de oraciones importantes
    const wordFreq = {};
    const words = text.toLowerCase().split(/\s+/);
    
    // Calcular frecuencia de palabras
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Puntuar oraciones
    const sentenceScores = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      let score = 0;
      
      sentenceWords.forEach(word => {
        if (wordFreq[word]) {
          score += wordFreq[word];
        }
      });
      
      // Bonus para oraciones más largas pero no demasiado
      const lengthBonus = Math.min(sentenceWords.length / 10, 1);
      score += lengthBonus;
      
      return { sentence: sentence.trim(), score, index };
    });

    // Seleccionar las mejores oraciones
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index);

    const summary = topSentences.map(item => item.sentence).join('. ');

    return {
      summary,
      originalLength: sentences.length,
      summaryLength: topSentences.length,
      compressionRatio: topSentences.length / sentences.length,
      method: 'extractive',
      topSentences: topSentences.map(item => ({
        sentence: item.sentence,
        score: Math.round(item.score * 100) / 100
      }))
    };
  }

  /**
   * Detecta posibles plagios (similitud de texto)
   * @param {string} text - Texto a analizar
   * @returns {Object} - Análisis de originalidad
   */
  detectPlagiarism(text) {
    // Dividir texto en fragmentos
    const fragments = text.split(/[.!?]+/).filter(s => s.trim().length > 50);
    
    // Patrones comunes que podrían indicar contenido no original
    const commonPhrases = [
      'en este documento',
      'en este informe',
      'como se puede ver',
      'es importante destacar',
      'en conclusión',
      'por otro lado',
      'sin embargo',
      'además de',
      'a pesar de',
      'con respecto a'
    ];

    let commonPhraseCount = 0;
    let repeatedFragments = 0;
    const fragmentFrequency = {};

    fragments.forEach(fragment => {
      const fragmentLower = fragment.toLowerCase().trim();
      
      // Contar frases comunes
      commonPhrases.forEach(phrase => {
        if (fragmentLower.includes(phrase)) {
          commonPhraseCount++;
        }
      });
      
      // Detectar fragmentos repetidos
      fragmentFrequency[fragmentLower] = (fragmentFrequency[fragmentLower] || 0) + 1;
    });

    Object.values(fragmentFrequency).forEach(count => {
      if (count > 1) {
        repeatedFragments += count - 1;
      }
    });

    const totalFragments = fragments.length;
    const originalityScore = Math.max(0, 100 - (commonPhraseCount / totalFragments * 20) - (repeatedFragments / totalFragments * 30));

    return {
      originalityScore: Math.round(originalityScore),
      commonPhrasesFound: commonPhraseCount,
      repeatedFragments: repeatedFragments,
      totalFragments: totalFragments,
      riskLevel: originalityScore > 80 ? 'Bajo' : originalityScore > 60 ? 'Medio' : 'Alto',
      recommendations: this.generateOriginalityRecommendations(commonPhraseCount, repeatedFragments, totalFragments)
    };
  }

  /**
   * Genera recomendaciones para mejorar la originalidad
   */
  generateOriginalityRecommendations(commonPhrases, repeatedFragments, totalFragments) {
    const recommendations = [];
    
    if (commonPhrases / totalFragments > 0.1) {
      recommendations.push('Considere reducir el uso de frases comunes y clichés');
    }
    
    if (repeatedFragments > 0) {
      recommendations.push('Evite repetir los mismos fragmentos de texto');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('El texto parece ser original');
    }
    
    return recommendations;
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
   * Análisis completo avanzado
   * @param {string} text - Texto a analizar
   * @param {string} fileType - Tipo de archivo
   * @returns {Object} - Análisis completo
   */
  performCompleteAnalysis(text, fileType) {
    return {
      sentiment: this.analyzeSentiment(text),
      entities: this.extractNamedEntities(text),
      complexity: this.analyzeComplexity(text),
      classification: this.classifyDocument(text, fileType),
      summary: this.generateSummary(text),
      originality: this.detectPlagiarism(text),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AdvancedAnalyzer();