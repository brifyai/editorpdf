/**
 * AI Enhanced Analyzer - Sistema de análisis avanzado con IA mejorada
 * Proporciona funcionalidades inteligentes para análisis profundo de documentos
 */

class AIEnhancedAnalyzer {
    constructor() {
        this.models = {
            groq: {
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                models: {
                    fast: 'llama-3.1-8b-instant',
                    balanced: 'llama-3.3-70b-versatile',
                    accurate: 'mixtral-8x7b-32768'
                }
            },
            chutes: {
                endpoint: 'https://api.chutes.ai/v1/analyze',
                specialized: 'chutes-specialized-ocr'
            }
        };
        
        this.analysisTypes = {
            basic: {
                name: 'Análisis Básico',
                description: 'Extracción de texto y metadatos fundamentales',
                features: ['text_extraction', 'metadata', 'structure'],
                estimatedTime: '5-10 segundos'
            },
            comprehensive: {
                name: 'Análisis Integral',
                description: 'Análisis completo con múltiples perspectivas',
                features: ['text_extraction', 'sentiment', 'entities', 'keywords', 'summary', 'structure'],
                estimatedTime: '15-30 segundos'
            },
            specialized: {
                name: 'Análisis Especializado',
                description: 'Análisis profundo para dominios específicos',
                features: ['domain_analysis', 'expert_insights', 'recommendations', 'quality_assessment'],
                estimatedTime: '30-60 segundos'
            },
            comparative: {
                name: 'Análisis Comparativo',
                description: 'Compara con documentos similares o estándares',
                features: ['similarity_analysis', 'benchmarking', 'gap_analysis', 'recommendations'],
                estimatedTime: '45-90 segundos'
            }
        };
        
        this.domainSpecializations = {
            legal: {
                name: 'Documentos Legales',
                keywords: ['contrato', 'ley', 'jurídico', 'cláusula', 'artículo', 'reglamento'],
                analysis: ['clause_extraction', 'risk_assessment', 'compliance_check'],
                confidence: 0.95
            },
            financial: {
                name: 'Documentos Financieros',
                keywords: ['balance', 'ingresos', 'gastos', 'inversión', 'rentabilidad', 'activo'],
                analysis: ['financial_ratios', 'trend_analysis', 'risk_indicators'],
                confidence: 0.92
            },
            medical: {
                name: 'Documentos Médicos',
                keywords: ['paciente', 'diagnóstico', 'tratamiento', 'medicación', 'síntomas', 'historial'],
                analysis: ['medical_entities', 'drug_interactions', 'treatment_recommendations'],
                confidence: 0.90
            },
            academic: {
                name: 'Documentos Académicos',
                keywords: ['investigación', 'estudio', 'análisis', 'conclusión', 'metodología', 'resultados'],
                analysis: ['citation_analysis', 'methodology_review', 'impact_assessment'],
                confidence: 0.88
            },
            technical: {
                name: 'Documentos Técnicos',
                keywords: ['especificación', 'técnico', 'procedimiento', 'manual', 'implementación', 'sistema'],
                analysis: ['technical_feasibility', 'implementation_complexity', 'resource_requirements'],
                confidence: 0.91
            }
        };
        
        this.qualityMetrics = {
            readability: {
                name: 'Legibilidad',
                description: 'Claridad y facilidad de lectura del texto',
                calculation: 'flesch_kincaid',
                thresholds: { excellent: 90, good: 70, fair: 50, poor: 30 }
            },
            coherence: {
                name: 'Coherencia',
                description: 'Conexión lógica entre ideas',
                calculation: 'semantic_cohesion',
                thresholds: { excellent: 85, good: 70, fair: 55, poor: 40 }
            },
            completeness: {
                name: 'Completitud',
                description: 'Presencia de elementos esperados',
                calculation: 'structure_analysis',
                thresholds: { excellent: 95, good: 80, fair: 65, poor: 50 }
            },
            accuracy: {
                name: 'Precisión',
                description: 'Corrección factual y gramatical',
                calculation: 'fact_checking',
                thresholds: { excellent: 95, good: 85, fair: 70, poor: 55 }
            }
        };
        
        this.cache = new Map();
        this.analysisQueue = [];
        this.isProcessing = false;
    }

    /**
     * Analiza un documento con IA mejorada
     * @param {Object} documentData - Datos del documento
     * @param {Object} options - Opciones de análisis
     * @returns {Promise<Object>} Resultados del análisis
     */
    async analyzeDocument(documentData, options = {}) {
        const {
            analysisType = 'comprehensive',
            domain = 'auto',
            language = 'es',
            detailLevel = 'medium',
            includeRecommendations = true,
            comparativeAnalysis = false
        } = options;

        try {
            console.log(`🧠 Iniciando análisis ${analysisType} con IA mejorada...`);
            
            // Generar ID de análisis
            const analysisId = this.generateAnalysisId();
            
            // Detectar dominio automáticamente si es necesario
            const detectedDomain = domain === 'auto' 
                ? await this.detectDomain(documentData.text) 
                : domain;
            
            // Seleccionar modelo óptimo
            const selectedModel = this.selectOptimalModel(analysisType, detectedDomain, detailLevel);
            
            // Preparar prompts especializados
            const prompts = this.prepareSpecializedPrompts(analysisType, detectedDomain, language);
            
            // Ejecutar análisis principal
            const mainAnalysis = await this.executeMainAnalysis(
                documentData, 
                prompts, 
                selectedModel, 
                analysisType
            );
            
            // Análisis de calidad
            const qualityAnalysis = await this.analyzeQuality(documentData, detectedDomain);
            
            // Análisis de dominio específico
            const domainAnalysis = await this.performDomainAnalysis(
                documentData, 
                detectedDomain, 
                selectedModel
            );
            
            // Análisis comparativo si se solicita
            let comparativeResults = null;
            if (comparativeAnalysis) {
                comparativeResults = await this.performComparativeAnalysis(
                    documentData, 
                    detectedDomain
                );
            }
            
            // Generar recomendaciones
            let recommendations = null;
            if (includeRecommendations) {
                recommendations = await this.generateRecommendations(
                    mainAnalysis, 
                    qualityAnalysis, 
                    domainAnalysis,
                    detectedDomain
                );
            }
            
            // Compilar resultados finales
            const results = {
                analysisId,
                timestamp: new Date().toISOString(),
                analysisType,
                domain: detectedDomain,
                model: selectedModel,
                language,
                detailLevel,
                main: mainAnalysis,
                quality: qualityAnalysis,
                domain: domainAnalysis,
                comparative: comparativeResults,
                recommendations,
                metadata: {
                    processingTime: Date.now(),
                    confidence: this.calculateOverallConfidence(mainAnalysis, qualityAnalysis),
                    wordCount: documentData.text.split(/\s+/).length,
                    complexity: this.calculateComplexity(documentData.text)
                }
            };
            
            // Cachear resultados
            this.cache.set(analysisId, results);
            
            console.log(`✅ Análisis ${analysisId} completado exitosamente`);
            
            return results;
            
        } catch (error) {
            console.error('❌ Error en análisis con IA mejorada:', error);
            throw new Error(`Error en análisis avanzado: ${error.message}`);
        }
    }

    /**
     * Detecta automáticamente el dominio del documento
     * @param {string} text - Texto del documento
     * @returns {Promise<string>} Dominio detectado
     */
    async detectDomain(text) {
        const textLower = text.toLowerCase();
        const domainScores = {};
        
        // Calcular puntuación para cada dominio
        for (const [domainKey, domainInfo] of Object.entries(this.domainSpecializations)) {
            let score = 0;
            let matches = 0;
            
            for (const keyword of domainInfo.keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const keywordMatches = (textLower.match(regex) || []).length;
                if (keywordMatches > 0) {
                    matches++;
                    score += keywordMatches * keyword.length; // Ponderar por longitud de keyword
                }
            }
            
            // Normalizar puntuación
            domainScores[domainKey] = matches > 0 ? score / domainInfo.keywords.length : 0;
        }
        
        // Encontrar dominio con mayor puntuación
        const bestDomain = Object.entries(domainScores)
            .sort(([,a], [,b]) => b - a)[0];
        
        // Si no hay coincidencias claras, devolver 'general'
        if (bestDomain[1] < 0.5) {
            return 'general';
        }
        
        console.log(`🎯 Dominio detectado: ${this.domainSpecializations[bestDomain[0]].name}`);
        return bestDomain[0];
    }

    /**
     * Selecciona el modelo óptimo para el análisis
     * @param {string} analysisType - Tipo de análisis
     * @param {string} domain - Dominio del documento
     * @param {string} detailLevel - Nivel de detalle
     * @returns {Object} Modelo seleccionado
     */
    selectOptimalModel(analysisType, domain, detailLevel) {
        const modelSelection = {
            basic: {
                low: { provider: 'groq', model: 'fast' },
                medium: { provider: 'groq', model: 'fast' },
                high: { provider: 'groq', model: 'balanced' }
            },
            comprehensive: {
                low: { provider: 'groq', model: 'balanced' },
                medium: { provider: 'groq', model: 'balanced' },
                high: { provider: 'groq', model: 'accurate' }
            },
            specialized: {
                low: { provider: 'groq', model: 'balanced' },
                medium: { provider: 'groq', model: 'accurate' },
                high: { provider: 'chutes', model: 'specialized' }
            },
            comparative: {
                low: { provider: 'groq', model: 'balanced' },
                medium: { provider: 'groq', model: 'accurate' },
                high: { provider: 'chutes', model: 'specialized' }
            }
        };
        
        const selected = modelSelection[analysisType]?.[detailLevel] || 
                        modelSelection.comprehensive.medium;
        
        console.log(`🤖 Modelo seleccionado: ${selected.provider}/${selected.model}`);
        return selected;
    }

    /**
     * Prepara prompts especializados según tipo y dominio
     * @param {string} analysisType - Tipo de análisis
     * @param {string} domain - Dominio del documento
     * @param {string} language - Idioma del análisis
     * @returns {Object} Prompts preparados
     */
    prepareSpecializedPrompts(analysisType, domain, language) {
        const basePrompts = {
            es: {
                summary: 'Proporciona un resumen ejecutivo conciso pero completo del siguiente documento, destacando los puntos más importantes y conclusiones clave.',
                entities: 'Extrae y clasifica todas las entidades importantes mencionadas en el documento (personas, organizaciones, lugares, fechas, conceptos clave).',
                sentiment: 'Analiza el sentimiento general del documento y identifica las emociones predominantes.',
                keywords: 'Identifica las palabras clave y conceptos más relevantes del documento.',
                structure: 'Analiza la estructura del documento y describe su organización lógica.',
                quality: 'Evalúa la calidad del documento en términos de claridad, coherencia y completitud.'
            },
            en: {
                summary: 'Provide a concise yet comprehensive executive summary of the following document, highlighting the most important points and key conclusions.',
                entities: 'Extract and classify all important entities mentioned in the document (people, organizations, places, dates, key concepts).',
                sentiment: 'Analyze the overall sentiment of the document and identify predominant emotions.',
                keywords: 'Identify the most relevant keywords and concepts from the document.',
                structure: 'Analyze the document structure and describe its logical organization.',
                quality: 'Evaluate the document quality in terms of clarity, coherence, and completeness.'
            }
        };
        
        const domainPrompts = {
            legal: {
                es: 'Este es un documento legal. Identifica cláusulas importantes, obligaciones, derechos y posibles riesgos legales.',
                en: 'This is a legal document. Identify important clauses, obligations, rights, and potential legal risks.'
            },
            financial: {
                es: 'Este es un documento financiero. Analiza indicadores financieros, tendencias y riesgos económicos.',
                en: 'This is a financial document. Analyze financial indicators, trends, and economic risks.'
            },
            medical: {
                es: 'Este es un documento médico. Identifica diagnósticos, tratamientos, medicamentos y recomendaciones de salud.',
                en: 'This is a medical document. Identify diagnoses, treatments, medications, and health recommendations.'
            }
        };
        
        const prompts = basePrompts[language] || basePrompts.es;
        
        // Agregar contexto de dominio si existe
        if (domainPrompts[domain]) {
            prompts.domain_context = domainPrompts[domain][language] || domainPrompts[domain].en;
        }
        
        return prompts;
    }

    /**
     * Ejecuta el análisis principal
     * @param {Object} documentData - Datos del documento
     * @param {Object} prompts - Prompts preparados
     * @param {Object} model - Modelo a usar
     * @param {string} analysisType - Tipo de análisis
     * @returns {Promise<Object>} Resultados del análisis principal
     */
    async executeMainAnalysis(documentData, prompts, model, analysisType) {
        const features = this.analysisTypes[analysisType].features;
        const results = {};
        
        // Análisis de texto básico
        if (features.includes('text_extraction')) {
            results.textExtraction = {
                originalText: documentData.text,
                cleanedText: this.cleanText(documentData.text),
                wordCount: documentData.text.split(/\s+/).length,
                characterCount: documentData.text.length,
                language: await this.detectLanguage(documentData.text)
            };
        }
        
        // Resumen
        if (features.includes('summary')) {
            results.summary = await this.generateSummary(documentData.text, prompts.summary, model);
        }
        
        // Entidades
        if (features.includes('entities')) {
            results.entities = await this.extractEntities(documentData.text, prompts.entities, model);
        }
        
        // Sentimiento
        if (features.includes('sentiment')) {
            results.sentiment = await this.analyzeSentiment(documentData.text, prompts.sentiment, model);
        }
        
        // Palabras clave
        if (features.includes('keywords')) {
            results.keywords = await this.extractKeywords(documentData.text, prompts.keywords, model);
        }
        
        // Estructura
        if (features.includes('structure')) {
            results.structure = await this.analyzeStructure(documentData.text, prompts.structure, model);
        }
        
        // Análisis de dominio
        if (features.includes('domain_analysis')) {
            results.domainAnalysis = await this.performDomainSpecificAnalysis(
                documentData.text, 
                prompts.domain_context, 
                model
            );
        }
        
        return results;
    }

    /**
     * Genera resumen del documento
     * @param {string} text - Texto del documento
     * @param {string} prompt - Prompt para el resumen
     * @param {Object} model - Modelo a usar
     * @returns {Promise<Object>} Resumen generado
     */
    async generateSummary(text, prompt, model) {
        try {
            const truncatedText = text.substring(0, 8000); // Limitar para API
            const fullPrompt = `${prompt}\n\nDocumento:\n${truncatedText}`;
            
            const response = await this.callAIModel(fullPrompt, model);
            
            return {
                summary: response.content,
                keyPoints: this.extractKeyPoints(response.content),
                length: response.content.length,
                confidence: this.calculateConfidence(response)
            };
        } catch (error) {
            console.error('Error generando resumen:', error);
            return {
                summary: 'No se pudo generar el resumen.',
                keyPoints: [],
                error: error.message
            };
        }
    }

    /**
     * Extrae entidades del texto
     * @param {string} text - Texto del documento
     * @param {string} prompt - Prompt para extracción
     * @param {Object} model - Modelo a usar
     * @returns {Promise<Object>} Entidades extraídas
     */
    async extractEntities(text, prompt, model) {
        try {
            const truncatedText = text.substring(0, 6000);
            const fullPrompt = `${prompt}\n\nTexto:\n${truncatedText}\n\nResponde en formato JSON con categorías: personas, organizaciones, lugares, fechas, conceptos.`;
            
            const response = await this.callAIModel(fullPrompt, model);
            
            // Intentar parsear JSON
            let entities = {};
            try {
                entities = JSON.parse(response.content);
            } catch {
                // Si no es JSON, extraer manualmente
                entities = this.parseEntitiesManually(response.content);
            }
            
            return {
                entities,
                totalEntities: Object.values(entities).flat().length,
                confidence: this.calculateConfidence(response)
            };
        } catch (error) {
            console.error('Error extrayendo entidades:', error);
            return {
                entities: {},
                totalEntities: 0,
                error: error.message
            };
        }
    }

    /**
     * Analiza sentimiento del texto
     * @param {string} text - Texto del documento
     * @param {string} prompt - Prompt para análisis
     * @param {Object} model - Modelo a usar
     * @returns {Promise<Object>} Análisis de sentimiento
     */
    async analyzeSentiment(text, prompt, model) {
        try {
            const truncatedText = text.substring(0, 4000);
            const fullPrompt = `${prompt}\n\nTexto:\n${truncatedText}\n\nResponde con sentimiento (positivo/negativo/neutro), puntuación (-1 a 1), y emociones principales.`;
            
            const response = await this.callAIModel(fullPrompt, model);
            
            const sentiment = this.parseSentimentResponse(response.content);
            
            return {
                ...sentiment,
                confidence: this.calculateConfidence(response),
                analysis: response.content
            };
        } catch (error) {
            console.error('Error analizando sentimiento:', error);
            return {
                sentiment: 'neutral',
                score: 0,
                emotions: [],
                confidence: 0,
                error: error.message
            };
        }
    }

    /**
     * Extrae palabras clave
     * @param {string} text - Texto del documento
     * @param {string} prompt - Prompt para extracción
     * @param {Object} model - Modelo a usar
     * @returns {Promise<Object>} Palabras clave extraídas
     */
    async extractKeywords(text, prompt, model) {
        try {
            const truncatedText = text.substring(0, 6000);
            const fullPrompt = `${prompt}\n\nTexto:\n${truncatedText}\n\nLista las 15-20 palabras clave más importantes, una por línea.`;
            
            const response = await this.callAIModel(fullPrompt, model);
            
            const keywords = this.parseKeywords(response.content);
            
            return {
                keywords,
                count: keywords.length,
                confidence: this.calculateConfidence(response)
            };
        } catch (error) {
            console.error('Error extrayendo palabras clave:', error);
            return {
                keywords: [],
                count: 0,
                error: error.message
            };
        }
    }

    /**
     * Analiza estructura del documento
     * @param {string} text - Texto del documento
     * @param {string} prompt - Prompt para análisis
     * @param {Object} model - Modelo a usar
     * @returns {Promise<Object>} Análisis de estructura
     */
    async analyzeStructure(text, prompt, model) {
        try {
            const truncatedText = text.substring(0, 8000);
            const fullPrompt = `${prompt}\n\nTexto:\n${truncatedText}\n\nAnaliza la estructura: introducción, desarrollo, conclusiones, secciones principales.`;
            
            const response = await this.callAIModel(fullPrompt, model);
            
            const structure = this.parseStructureResponse(response.content);
            
            return {
                ...structure,
                confidence: this.calculateConfidence(response),
                analysis: response.content
            };
        } catch (error) {
            console.error('Error analizando estructura:', error);
            return {
                sections: [],
                hasIntroduction: false,
                hasConclusion: false,
                logicalFlow: 'unknown',
                confidence: 0,
                error: error.message
            };
        }
    }

    /**
     * Llama al modelo de IA
     * @param {string} prompt - Prompt a enviar
     * @param {Object} model - Configuración del modelo
     * @returns {Promise<Object>} Respuesta del modelo
     */
    async callAIModel(prompt, model) {
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                let response;
                
                if (model.provider === 'groq') {
                    response = await this.callGroqAPI(prompt, model.model);
                } else if (model.provider === 'chutes') {
                    response = await this.callChutesAPI(prompt, model.model);
                } else {
                    throw new Error(`Proveedor no soportado: ${model.provider}`);
                }
                
                return response;
                
            } catch (error) {
                lastError = error;
                console.warn(`Intento ${attempt} fallido:`, error.message);
                
                if (attempt < maxRetries) {
                    // Esperar antes de reintentar (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Llama a la API de Groq
     * @param {string} prompt - Prompt a enviar
     * @param {string} model - Modelo de Groq
     * @returns {Promise<Object>} Respuesta de la API
     */
    async callGroqAPI(prompt, model) {
        const apiKey = localStorage.getItem('groqApiKey') || 
                      document.getElementById('groqApiKey')?.value;
        
        if (!apiKey) {
            throw new Error('API Key de Groq no configurada');
        }
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.models.groq.models[model],
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un analista experto en documentos. Proporciona análisis precisos y bien estructurados.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error API Groq: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
            content: data.choices[0].message.content,
            usage: data.usage,
            model: data.model,
            provider: 'groq'
        };
    }

    /**
     * Llama a la API de Chutes
     * @param {string} prompt - Prompt a enviar
     * @param {string} model - Modelo de Chutes
     * @returns {Promise<Object>} Respuesta de la API
     */
    async callChutesAPI(prompt, model) {
        const apiKey = localStorage.getItem('chutesApiKey') || 
                      document.getElementById('chutesApiKey')?.value;
        
        if (!apiKey) {
            throw new Error('API Key de Chutes no configurada');
        }
        
        const response = await fetch('https://api.chutes.ai/v1/analyze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                temperature: 0.2,
                max_tokens: 1500
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error API Chutes: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
            content: data.response,
            usage: data.usage,
            model: data.model,
            provider: 'chutes'
        };
    }

    /**
     * Analiza calidad del documento
     * @param {Object} documentData - Datos del documento
     * @param {string} domain - Dominio del documento
     * @returns {Promise<Object>} Análisis de calidad
     */
    async analyzeQuality(documentData, domain) {
        const qualityResults = {};
        const text = documentData.text;
        
        // Análisis de legibilidad
        qualityResults.readability = this.calculateReadability(text);
        
        // Análisis de coherencia
        qualityResults.coherence = await this.analyzeCoherence(text);
        
        // Análisis de completitud
        qualityResults.completeness = this.analyzeCompleteness(text, domain);
        
        // Análisis de precisión gramatical
        qualityResults.accuracy = await this.analyzeAccuracy(text);
        
        // Calcular puntuación general
        qualityResults.overall = this.calculateOverallQuality(qualityResults);
        
        return qualityResults;
    }

    /**
     * Calcula legibilidad del texto
     * @param {string} text - Texto a analizar
     * @returns {Object} Métricas de legibilidad
     */
    calculateReadability(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
        
        // Fórmula de Flesch-Kincaid adaptada para español
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        // Fórmula simplificada (la real es más compleja para español)
        const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        let level;
        if (fleschScore >= 90) level = 'Muy fácil';
        else if (fleschScore >= 80) level = 'Fácil';
        else if (fleschScore >= 70) level = 'Bastante fácil';
        else if (fleschScore >= 60) level = 'Estándar';
        else if (fleschScore >= 50) level = 'Bastante difícil';
        else if (fleschScore >= 30) level = 'Difícil';
        else level = 'Muy difícil';
        
        return {
            score: Math.max(0, Math.min(100, fleschScore)),
            level,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
            sentences: sentences.length,
            words: words.length
        };
    }

    /**
     * Cuenta sílabas en una palabra (simplificado)
     * @param {string} word - Palabra a analizar
     * @returns {number} Número de sílabas
     */
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        // Reglas simplificadas para español
        const vowels = 'aeiouáéíóúü';
        let syllableCount = 0;
        let previousWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }
            previousWasVowel = isVowel;
        }
        
        // Ajustes especiales
        if (word.endsWith('es') || word.endsWith('el') || word.endsWith('en')) {
            syllableCount = Math.max(1, syllableCount - 1);
        }
        
        return Math.max(1, syllableCount);
    }

    /**
     * Genera ID único para análisis
     * @returns {string} ID generado
     */
    generateAnalysisId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpia y normaliza texto
     * @param {string} text - Texto original
     * @returns {string} Texto limpio
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ') // Normalizar espacios
            .replace(/\n\s*\n/g, '\n') // Eliminar líneas vacías múltiples
            .trim();
    }

    /**
     * Calcula confianza de la respuesta
     * @param {Object} response - Respuesta del modelo
     * @returns {number} Puntuación de confianza (0-1)
     */
    calculateConfidence(response) {
        // Heurística simple basada en longitud y estructura
        const content = response.content || '';
        const length = content.length;
        
        let confidence = 0.5; // Base
        
        // Ajustar por longitud apropiada
        if (length > 100 && length < 2000) {
            confidence += 0.2;
        }
        
        // Ajustar por estructura (si tiene párrafos bien formados)
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        if (paragraphs.length >= 2) {
            confidence += 0.1;
        }
        
        // Ajustar por uso de puntuación
        const punctuation = content.match(/[.,;:!?]/g);
        if (punctuation && punctuation.length > 5) {
            confidence += 0.1;
        }
        
        return Math.min(1, confidence);
    }

    /**
     * Parsea respuesta de sentimiento
     * @param {string} response - Respuesta del modelo
     * @returns {Object} Sentimiento parseado
     */
    parseSentimentResponse(response) {
        const lower = response.toLowerCase();
        
        let sentiment = 'neutral';
        let score = 0;
        const emotions = [];
        
        // Detectar sentimiento principal
        if (lower.includes('positivo') || lower.includes('positive')) {
            sentiment = 'positive';
            score = 0.5;
        } else if (lower.includes('negativo') || lower.includes('negative')) {
            sentiment = 'negative';
            score = -0.5;
        } else if (lower.includes('neutro') || lower.includes('neutral')) {
            sentiment = 'neutral';
            score = 0;
        }
        
        // Extraer puntuación numérica si existe
        const scoreMatch = response.match(/(-?\d+\.?\d*)/);
        if (scoreMatch) {
            score = Math.max(-1, Math.min(1, parseFloat(scoreMatch[1])));
        }
        
        // Extraer emociones básicas
        const emotionKeywords = {
            'alegría': 'joy',
            'felicidad': 'joy',
            'tristeza': 'sadness',
            'enojo': 'anger',
            'ira': 'anger',
            'miedo': 'fear',
            'sorpresa': 'surprise',
            'confianza': 'trust'
        };
        
        for (const [keyword, emotion] of Object.entries(emotionKeywords)) {
            if (lower.includes(keyword)) {
                emotions.push(emotion);
            }
        }
        
        return { sentiment, score, emotions };
    }

    /**
     * Parsea palabras clave de la respuesta
     * @param {string} response - Respuesta del modelo
     * @returns {Array} Lista de palabras clave
     */
    parseKeywords(response) {
        // Dividir por líneas y limpiar
        const lines = response.split('\n')
            .map(line => line.replace(/^[-*•]\s*/, '').trim())
            .filter(line => line.length > 2);
        
        // Eliminar duplicados y limitar a 20
        return [...new Set(lines)].slice(0, 20);
    }

    /**
     * Parsea entidades manualmente
     * @param {string} response - Respuesta del modelo
     * @returns {Object} Entidades parseadas
     */
    parseEntitiesManually(response) {
        const entities = {
            personas: [],
            organizaciones: [],
            lugares: [],
            fechas: [],
            conceptos: []
        };
        
        const lines = response.split('\n');
        
        for (const line of lines) {
            const lower = line.toLowerCase();
            
            if (lower.includes('persona') || lower.includes('person')) {
                const match = line.match(/[:]\s*(.+)/);
                if (match) entities.personas.push(match[1].trim());
            } else if (lower.includes('organización') || lower.includes('organization')) {
                const match = line.match(/[:]\s*(.+)/);
                if (match) entities.organizaciones.push(match[1].trim());
            } else if (lower.includes('lugar') || lower.includes('place')) {
                const match = line.match(/[:]\s*(.+)/);
                if (match) entidades.lugares.push(match[1].trim());
            } else if (lower.includes('fecha') || lower.includes('date')) {
                const match = line.match(/[:]\s*(.+)/);
                if (match) entities.fechas.push(match[1].trim());
            } else if (lower.includes('concepto') || lower.includes('concept')) {
                const match = line.match(/[:]\s*(.+)/);
                if (match) entities.conceptos.push(match[1].trim());
            }
        }
        
        return entities;
    }

    /**
     * Parsea respuesta de estructura
     * @param {string} response - Respuesta del modelo
     * @returns {Object} Estructura parseada
     */
    parseStructureResponse(response) {
        const sections = [];
        const lines = response.split('\n');
        let currentSection = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.match(/^(introducción|inicial|inicio)/i)) {
                currentSection = { type: 'introduction', content: trimmed };
                sections.push(currentSection);
            } else if (trimmed.match(/^(desarrollo|cuerpo|análisis)/i)) {
                currentSection = { type: 'development', content: trimmed };
                sections.push(currentSection);
            } else if (trimmed.match(/^(conclusión|final|resumen)/i)) {
                currentSection = { type: 'conclusion', content: trimmed };
                sections.push(currentSection);
            } else if (currentSection && trimmed.length > 0) {
                currentSection.content += ' ' + trimmed;
            }
        }
        
        return {
            sections,
            hasIntroduction: sections.some(s => s.type === 'introduction'),
            hasConclusion: sections.some(s => s.type === 'conclusion'),
            logicalFlow: sections.length >= 2 ? 'good' : 'needs_improvement'
        };
    }

    /**
     * Extrae puntos clave del resumen
     * @param {string} summary - Resumen del documento
     * @returns {Array} Puntos clave extraídos
     */
    extractKeyPoints(summary) {
        const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 5).map(s => s.trim());
    }

    /**
     * Calcula complejidad del texto
     * @param {string} text - Texto a analizar
     * @returns {string} Nivel de complejidad
     */
    calculateComplexity(text) {
        const words = text.split(/\s+/);
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        
        if (avgWordLength > 6 && avgWordsPerSentence > 20) return 'high';
        if (avgWordLength > 5 && avgWordsPerSentence > 15) return 'medium';
        return 'low';
    }

    /**
     * Calcula confianza general del análisis
     * @param {Object} mainAnalysis - Análisis principal
     * @param {Object} qualityAnalysis - Análisis de calidad
     * @returns {number} Confianza general (0-1)
     */
    calculateOverallConfidence(mainAnalysis, qualityAnalysis) {
        const confidences = [];
        
        // Extraer confianzas de diferentes componentes
        if (mainAnalysis.summary?.confidence) confidences.push(mainAnalysis.summary.confidence);
        if (mainAnalysis.entities?.confidence) confidences.push(mainAnalysis.entities.confidence);
        if (mainAnalysis.sentiment?.confidence) confidences.push(mainAnalysis.sentiment.confidence);
        if (mainAnalysis.keywords?.confidence) confidences.push(mainAnalysis.keywords.confidence);
        if (mainAnalysis.structure?.confidence) confidences.push(mainAnalysis.structure.confidence);
        
        if (confidences.length === 0) return 0.5;
        
        const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        
        // Ajustar por calidad general
        const qualityBonus = qualityAnalysis.overall?.score ? qualityAnalysis.overall.score / 100 * 0.1 : 0;
        
        return Math.min(1, avgConfidence + qualityBonus);
    }

    // Métodos placeholder para funcionalidades futuras
    async analyzeCoherence(text) {
        // Implementación futura con análisis semántico
        return { score: 0.8, analysis: 'Análisis de coherencia no implementado aún' };
    }

    analyzeCompleteness(text, domain) {
        // Implementación básica basada en estructura
        const hasIntro = text.match(/^(introducción|inicio|presentación)/i);
        const hasConclusion = text.match(/^(conclusión|final|resumen)/i);
        const hasDevelopment = text.length > 500;
        
        let score = 0.5;
        if (hasIntro) score += 0.2;
        if (hasDevelopment) score += 0.2;
        if (hasConclusion) score += 0.1;
        
        return { score, hasIntro: !!hasIntro, hasConclusion: !!hasConclusion };
    }

    async analyzeAccuracy(text) {
        // Implementación futura con checking gramatical y factual
        return { score: 0.85, errors: [], analysis: 'Análisis de precisión no implementado aún' };
    }

    calculateOverallQuality(qualityResults) {
        const scores = Object.values(qualityResults)
            .filter(result => result.score)
            .map(result => result.score);
        
        if (scores.length === 0) return { score: 0.5, level: 'Estándar' };
        
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        let level;
        if (avgScore >= 0.9) level = 'Excelente';
        else if (avgScore >= 0.8) level = 'Bueno';
        else if (avgScore >= 0.7) level = 'Aceptable';
        else if (avgScore >= 0.6) level = 'Necesita Mejoras';
        else level = 'Pobre';
        
        return { score: avgScore, level };
    }

    async performDomainAnalysis(documentData, detectedDomain, selectedModel) {
        // Implementación futura para análisis específico de dominio
        return {
            domain: detectedDomain,
            analysis: 'Análisis de dominio específico no implementado aún',
            confidence: 0.8
        };
    }

    async performComparativeAnalysis(documentData, detectedDomain) {
        // Implementación futura para análisis comparativo
        return {
            comparison: 'Análisis comparativo no implementado aún',
            similarities: [],
            differences: [],
            recommendations: []
        };
    }

    async generateRecommendations(mainAnalysis, qualityAnalysis, domainAnalysis, detectedDomain) {
        // Implementación futura para generación de recomendaciones
        return {
            general: ['Mejorar la estructura del documento', 'Revisar ortografía y gramática'],
            specific: [],
            priority: 'medium'
        };
    }

    async performDomainSpecificAnalysis(text, contextPrompt, model) {
        // Implementación futura para análisis de dominio específico
        return {
            domainSpecific: 'Análisis de dominio específico no implementado aún',
            insights: []
        };
    }

    async detectLanguage(text) {
        // Implementación simple de detección de idioma
        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'];
        const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'you', 'that'];
        
        const words = text.toLowerCase().split(/\s+/).slice(0, 100);
        const spanishCount = words.filter(w => spanishWords.includes(w)).length;
        const englishCount = words.filter(w => englishWords.includes(w)).length;
        
        if (spanishCount > englishCount) return 'es';
        if (englishCount > spanishCount) return 'en';
        return 'unknown';
    }

    async extractKeyPoints(summary) {
        const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 5).map(s => s.trim());
    }
}

// Exportar para uso global
window.AIEnhancedAnalyzer = AIEnhancedAnalyzer;