const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { createWorker } = require('tesseract.js');

class OCRProcessor {
    constructor() {
        this.workers = new Map();
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
        this.languages = {
            'spa': 'Español',
            'eng': 'Inglés', 
            'fra': 'Francés',
            'deu': 'Alemán',
            'ita': 'Italiano',
            'por': 'Portugués',
            'chi_sim': 'Chino Simplificado',
            'jpn': 'Japonés',
            'kor': 'Coreano'
        };
    }

    /**
     * Preprocesa imagen para mejorar precisión del OCR
     */
    async preprocessImage(imagePath, outputPath) {
        try {
            await sharp(imagePath)
                .resize(null, 2000, { 
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .sharpen({
                    sigma: 1,
                    flat: 1.5,
                    jagged: 1.5
                })
                .normalize()
                .threshold(128)
                .grayscale()
                .toFile(outputPath);
            
            return outputPath;
        } catch (error) {
            console.error('Error preprocesando imagen:', error);
            throw error;
        }
    }

    /**
     * Crea o reutiliza un worker de Tesseract
     */
    async getWorker(language = 'spa+eng') {
        const workerKey = language;
        
        if (!this.workers.has(workerKey)) {
            const worker = await createWorker(language, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`Progreso OCR: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });
            
            // Configuración optimizada para mejor precisión
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúñÁÉÍÓÚÑüÜ.,;:!?()[]{}"\'-+*/=%@#&$€£¥¿¡<>',
                tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
                preserve_interword_spaces: '1',
                tessedit_create_hocr: '1',
                tessedit_create_tsv: '1'
            });
            
            this.workers.set(workerKey, worker);
        }
        
        return this.workers.get(workerKey);
    }

    /**
     * Realiza OCR con alta precisión
     */
    async performOCR(imagePath, options = {}) {
        const {
            language = 'spa+eng',
            preprocess = true,
            confidence = 60,
            outputFormat = 'text'
        } = options;

        let worker = null;
        let processedImagePath = imagePath;

        try {
            // Preprocesamiento para mejorar precisión
            if (preprocess) {
                const preprocessedPath = imagePath.replace(/\.[^/.]+$/, '_preprocessed.png');
                processedImagePath = await this.preprocessImage(imagePath, preprocessedPath);
            }

            worker = await this.getWorker(language);
            
            // Realizar OCR
            const { data } = await worker.recognize(processedImagePath);
            
            // Filtrar por confianza
            const filteredWords = data.words.filter(word => word.confidence >= confidence);
            const filteredText = filteredWords.map(word => word.text).join(' ');
            
            const result = {
                text: data.text,
                filteredText: filteredText,
                confidence: data.confidence,
                words: data.words,
                lines: data.lines,
                paragraphs: data.paragraphs,
                blocks: data.blocks,
                pageStats: {
                    words: filteredWords.length,
                    lines: data.lines.length,
                    paragraphs: data.paragraphs.length,
                    blocks: data.blocks.length
                },
                language: language,
                processingTime: Date.now()
            };

            // Formatos adicionales
            if (outputFormat === 'hocr') {
                result.hocr = data.hocr;
            }
            if (outputFormat === 'tsv') {
                result.tsv = data.tsv;
            }

            return result;

        } catch (error) {
            console.error('Error en OCR:', error);
            throw new Error(`Error procesando OCR: ${error.message}`);
        } finally {
            // Limpiar archivo preprocesado en cualquier caso
            if (preprocess && processedImagePath !== imagePath) {
                try {
                    await fs.unlink(processedImagePath);
                } catch (cleanupError) {
                    console.warn('Error limpiando archivo preprocesado:', cleanupError);
                }
            }
        }
    }

    /**
     * OCR con múltiples lenguajes simultáneamente
     */
    async multiLanguageOCR(imagePath, languages = ['spa', 'eng']) {
        const results = {};
        
        for (const lang of languages) {
            try {
                const result = await this.performOCR(imagePath, {
                    language: lang,
                    preprocess: true,
                    confidence: 50
                });
                results[lang] = result;
            } catch (error) {
                console.error(`Error OCR con lenguaje ${lang}:`, error);
                results[lang] = { error: error.message };
            }
        }

        // Seleccionar mejor resultado basado en confianza
        let bestResult = null;
        let bestConfidence = 0;
        
        for (const [lang, result] of Object.entries(results)) {
            if (result.confidence > bestConfidence) {
                bestConfidence = result.confidence;
                bestResult = { ...result, detectedLanguage: lang };
            }
        }

        return {
            bestResult,
            allResults: results,
            detectedLanguage: bestResult?.detectedLanguage || 'unknown'
        };
    }

    /**
     * OCR con detección automática de lenguaje
     */
    async autoDetectOCR(imagePath) {
        const commonLanguages = ['spa', 'eng', 'fra', 'deu', 'ita', 'por'];
        return await this.multiLanguageOCR(imagePath, commonLanguages);
    }

    /**
     * OCR para documentos estructurados (facturas, formularios, etc.)
     */
    async structuredOCR(imagePath, documentType = 'auto') {
        const result = await this.performOCR(imagePath, {
            language: 'spa+eng',
            preprocess: true,
            confidence: 50
        });

        // Análisis estructural basado en el tipo de documento
        const structuredData = this.analyzeDocumentStructure(result.text, documentType);
        
        return {
            ...result,
            structuredData,
            documentType
        };
    }

    /**
     * Analiza estructura del documento
     */
    analyzeDocumentStructure(text, documentType) {
        const lines = text.split('\n').filter(line => line.trim());
        const structure = {
            headers: [],
            paragraphs: [],
            lists: [],
            tables: [],
            keyValues: {},
            dates: [],
            numbers: [],
            emails: [],
            phones: []
        };

        // Patrones de detección
        const patterns = {
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            date: /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/g,
            number: /\b\d+([.,]\d+)?\b/g,
            currency: /\$?\s?\d+([.,]\d+)?\s?(€|USD|EUR|GBP|MXN|ARS)?/g,
            url: /https?:\/\/[^\s]+/g
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Detectar encabezados (líneas cortas o en mayúsculas)
            if (trimmedLine.length < 50 && trimmedLine === trimmedLine.toUpperCase()) {
                structure.headers.push({ text: trimmedLine, line: index });
            }
            // Detectar listas (líneas que comienzan con viñetas o números)
            else if (/^[•\-\*\d+\.\)]\s/.test(trimmedLine)) {
                structure.lists.push({ text: trimmedLine, line: index });
            }
            // Detectar párrafos
            else if (trimmedLine.length > 20) {
                structure.paragraphs.push({ text: trimmedLine, line: index });
            }

            // Extraer patrones específicos
            const emails = trimmedLine.match(patterns.email);
            if (emails) structure.emails.push(...emails);

            const phones = trimmedLine.match(patterns.phone);
            if (phones) structure.phones.push(...phones);

            const dates = trimmedLine.match(patterns.date);
            if (dates) structure.dates.push(...dates);

            const numbers = trimmedLine.match(patterns.number);
            if (numbers) structure.numbers.push(...numbers);

            const urls = trimmedLine.match(patterns.url);
            if (urls) structure.urls = structure.urls || [];
            if (urls) structure.urls.push(...urls);
        });

        // Análisis específico por tipo de documento
        if (documentType === 'invoice' || documentType === 'factura') {
            structure.keyValues = this.extractInvoiceData(text);
        } else if (documentType === 'form' || documentType === 'formulario') {
            structure.keyValues = this.extractFormData(text);
        }

        return structure;
    }

    /**
     * Extrae datos de facturas
     */
    extractInvoiceData(text) {
        const data = {};
        
        // Patrones para facturas
        const patterns = {
            invoiceNumber: /(?:factura|invoice|n[°º]\s*)(?:n[°º\s]*)?(\w+[-\d]*)/i,
            total: /(?:total|importe|amount)\s*[:\$]?\s*(\d+[.,]\d{2})/i,
            subtotal: /(?:subtotal|base)\s*[:\$]?\s*(\d+[.,]\d{2})/i,
            tax: /(?:iva|tax|impuesto)\s*[:\$]?\s*(\d+[.,]\d{2})/i,
            date: /(?:fecha|date)\s*[:]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
            client: /(?:cliente|customer)\s*[:]\s*([^\n]+)/i,
            company: /(?:empresa|company)\s*[:]\s*([^\n]+)/i
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[key] = match[1].trim();
            }
        }

        return data;
    }

    /**
     * Extrae datos de formularios
     */
    extractFormData(text) {
        const data = {};
        const lines = text.split('\n');
        
        lines.forEach(line => {
            // Buscar pares clave:valor
            const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
            if (colonMatch) {
                data[colonMatch[1].trim()] = colonMatch[2].trim();
            }
        });

        return data;
    }

    /**
     * Libera recursos de los workers
     */
    async cleanup() {
        for (const [key, worker] of this.workers) {
            await worker.terminate();
        }
        this.workers.clear();
    }

    /**
     * Obtiene información del procesador OCR
     */
    getInfo() {
        return {
            supportedFormats: this.supportedFormats,
            availableLanguages: this.languages,
            activeWorkers: this.workers.size,
            features: [
                'Preprocesamiento de imágenes',
                'Multi-idioma simultáneo',
                'Detección automática de lenguaje',
                'Análisis estructural de documentos',
                'Extracción de datos específicos',
                'Múltiples formatos de salida',
                'Optimización de precisión'
            ]
        };
    }
    /**
     * OCR con Google Cloud Vision API
     */
    async performGoogleVisionOCR(imagePath, options = {}) {
        const {
            languages = ['es'],
            confidence = 75,
            preprocessing = {}
        } = options;

        try {
            const axios = require('axios');
            const fs = require('fs');

            // Convertir imagen a base64
            const imageBuffer = await fs.readFile(imagePath);
            const base64Image = imageBuffer.toString('base64');

            const requestBody = {
                requests: [{
                    image: {
                        content: base64Image
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                            maxResults: 10
                        },
                        {
                            type: 'DOCUMENT_TEXT_DETECTION',
                            maxResults: 10
                        }
                    ],
                    imageContext: {
                        languageHints: languages
                    }
                }]
            };

            const apiKey = options.cloudAPIs?.googleVision?.apiKey;
            if (!apiKey) {
                throw new Error('API key de Google Vision no configurada');
            }

            const endpoint = options.cloudAPIs?.googleVision?.endpoint || 'https://vision.googleapis.com/v1/images:annotate';
            const url = `${endpoint}?key=${apiKey}`;

            const response = await axios.post(url, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const annotation = response.data.responses[0];
            const text = annotation.fullTextAnnotation?.text || '';
            const pages = annotation.fullTextAnnotation?.pages || [];

            // Procesar resultados
            const words = [];
            const lines = [];
            const paragraphs = [];

            if (annotation.textAnnotations) {
                annotation.textAnnotations.slice(1).forEach((item, index) => {
                    if (item.description) {
                        words.push({
                            text: item.description,
                            confidence: 0.95, // Google Vision no proporciona confianza por palabra
                            bbox: item.boundingPoly?.vertices || []
                        });
                    }
                });
            }

            return {
                text: text,
                filteredText: text,
                confidence: 0.95,
                words: words,
                lines: lines,
                paragraphs: paragraphs,
                blocks: [],
                pageStats: {
                    words: words.length,
                    lines: lines.length,
                    paragraphs: paragraphs.length,
                    blocks: 0
                },
                language: languages.join('+'),
                processingTime: Date.now(),
                engine: 'google',
                pages: pages.length,
                resolution: pages[0]?.width ? { width: pages[0].width, height: pages[0].height } : null,
                preprocessing: preprocessing
            };

        } catch (error) {
            console.error('Error en Google Vision OCR:', error);
            throw new Error(`Error en Google Vision OCR: ${error.message}`);
        }
    }

    /**
     * OCR con Azure Computer Vision
     */
    async performAzureOCR(imagePath, options = {}) {
        const {
            language = 'es',
            confidence = 75,
            preprocessing = {}
        } = options;

        try {
            const axios = require('axios');
            const fs = require('fs');

            // Convertir imagen a buffer
            const imageBuffer = await fs.readFile(imagePath);

            const apiKey = options.cloudAPIs?.azureComputerVision?.apiKey;
            if (!apiKey) {
                throw new Error('API key de Azure Computer Vision no configurada');
            }

            const endpoint = options.cloudAPIs?.azureComputerVision?.endpoint || 'https://api.cognitive.microsoft.com/beta/vision.0/ocr';
            const url = `${endpoint}?language=${language}&detectOrientation=true`;

            const response = await axios.post(url, imageBuffer, {
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Content-Type': 'application/octet-stream'
                }
            });

            const result = response.data;
            const text = result.regions?.map(region =>
                region.lines?.map(line => line.words?.map(word => word.text).join(' ')).join('\n')
            ).join('\n\n') || '';

            // Procesar palabras y líneas
            const words = [];
            const lines = [];

            if (result.regions) {
                result.regions.forEach(region => {
                    region.lines?.forEach((line, lineIndex) => {
                        const lineText = line.words?.map(word => word.text).join(' ') || '';
                        lines.push({
                            text: lineText,
                            bbox: line.boundingBox,
                            words: line.words?.length || 0
                        });

                        line.words?.forEach(word => {
                            words.push({
                                text: word.text,
                                confidence: 0.90, // Azure no proporciona confianza por palabra
                                bbox: word.boundingBox
                            });
                        });
                    });
                });
            }

            return {
                text: text,
                filteredText: text,
                confidence: 0.90,
                words: words,
                lines: lines,
                paragraphs: [],
                blocks: [],
                pageStats: {
                    words: words.length,
                    lines: lines.length,
                    paragraphs: 0,
                    blocks: 0
                },
                language: language,
                processingTime: Date.now(),
                engine: 'azure',
                pages: 1,
                resolution: null,
                preprocessing: preprocessing,
                language: result.language || language,
                textAngle: result.textAngle || 0,
                orientation: result.orientation
            };

        } catch (error) {
            console.error('Error en Azure OCR:', error);
            throw new Error(`Error en Azure OCR: ${error.message}`);
        }
    }

    /**
     * OCR con AWS Textract
     */
    async performAWSTextractOCR(imagePath, options = {}) {
        const {
            confidence = 75,
            preprocessing = {}
        } = options;

        try {
            const AWS = require('aws-sdk');
            const fs = require('fs');

            const accessKey = options.cloudAPIs?.awsTextract?.accessKey;
            const secretKey = options.cloudAPIs?.awsTextract?.secretKey;
            const region = options.cloudAPIs?.awsTextract?.region || 'us-east-1';

            if (!accessKey || !secretKey) {
                throw new Error('Credenciales de AWS Textract no configuradas');
            }

            // Configurar AWS SDK
            AWS.config.update({
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                region: region
            });

            const textract = new AWS.Textract();

            // Convertir imagen a buffer
            const imageBuffer = await fs.readFile(imagePath);

            const params = {
                Document: {
                    Bytes: imageBuffer
                },
                FeatureTypes: ['TABLES', 'FORMS']
            };

            const result = await textract.analyzeDocument(params).promise();

            // Extraer texto de los bloques
            const textBlocks = result.Blocks?.filter(block => block.BlockType === 'LINE') || [];
            const wordBlocks = result.Blocks?.filter(block => block.BlockType === 'WORD') || [];
            
            const text = textBlocks.map(block => block.Text).join('\n');
            
            const words = wordBlocks.map(word => ({
                text: word.Text,
                confidence: word.Confidence || 0,
                bbox: word.Geometry?.BoundingBox
            }));

            const lines = textBlocks.map(line => ({
                text: line.Text,
                confidence: line.Confidence || 0,
                bbox: line.Geometry?.BoundingBox
            }));

            // Detectar tablas y formularios
            const tables = result.Blocks?.filter(block => block.BlockType === 'TABLE') || [];
            const forms = result.Blocks?.filter(block => block.BlockType === 'KEY_VALUE_SET') || [];

            return {
                text: text,
                filteredText: text,
                confidence: words.length > 0 ? words.reduce((sum, word) => sum + word.confidence, 0) / words.length : 0,
                words: words,
                lines: lines,
                paragraphs: [],
                blocks: result.Blocks || [],
                pageStats: {
                    words: words.length,
                    lines: lines.length,
                    paragraphs: 0,
                    blocks: result.Blocks?.length || 0
                },
                language: 'auto',
                processingTime: Date.now(),
                engine: 'aws',
                pages: 1,
                resolution: null,
                preprocessing: preprocessing,
                tables: tables.length,
                forms: forms.length,
                documentMetadata: result.DocumentMetadata || {}
            };

        } catch (error) {
            console.error('Error en AWS Textract OCR:', error);
            throw new Error(`Error en AWS Textract OCR: ${error.message}`);
        }
    }

    /**
     * Aplica preprocesamiento avanzado según configuración
     */
    async applyAdvancedPreprocessing(imagePath, preprocessingOptions = {}) {
        const {
            autoRotate = true,
            deskew = true,
            denoise = false,
            enhanceContrast = true,
            binarize = false,
            normalizeLighting = true,
            sharpen = false,
            removeBackground = false
        } = preprocessingOptions;

        try {
            let image = sharp(imagePath);
            const metadata = await image.metadata();

            // Aplicar preprocesamiento según opciones
            if (autoRotate) {
                // Auto-rotación basada en metadatos EXIF
                image = image.rotate();
            }

            if (deskew) {
                // Corrección de inclinación (simplificada)
                image = image.sharpen({ sigma: 0.5, flat: 1, jagged: 1 });
            }

            if (denoise) {
                // Reducción de ruido
                image = image.median(3);
            }

            if (enhanceContrast) {
                // Mejora de contraste
                image = image.normalize();
            }

            if (normalizeLighting) {
                // Normalización de iluminación
                image = image.linear(1.2, 0);
            }

            if (sharpen) {
                // Enfoque
                image = image.sharpen({ sigma: 1, flat: 1.5, jagged: 1.5 });
            }

            if (removeBackground) {
                // Eliminación de fondo (simplificada)
                image = image.threshold(128);
            }

            if (binarize) {
                // Binarización
                image = image.threshold(128).grayscale();
            } else {
                // Convertir a escala de grises para OCR
                image = image.grayscale();
            }

            // Redimensionar si es muy grande
            if (metadata.width > 3000 || metadata.height > 3000) {
                image = image.resize(3000, 3000, {
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }

            // Generar archivo preprocesado
            const outputPath = imagePath.replace(/\.[^/.]+$/, '_preprocessed.png');
            await image.toFile(outputPath);

            return outputPath;

        } catch (error) {
            console.error('Error en preprocesamiento avanzado:', error);
            throw new Error(`Error en preprocesamiento: ${error.message}`);
        }
    }

    /**
     * OCR con configuración personalizada completa
     */
    async performCustomOCR(imagePath, config = {}) {
        const {
            engine = 'tesseract',
            languages = ['spa'],
            confidence = 75,
            preprocessing = {},
            pageSegmentation = 'auto',
            detailLevel = 'standard',
            minTextSize = 12,
            outputFormat = 'text',
            cloudAPIs = {}
        } = config;

        try {
            let processedImagePath = imagePath;
            const preprocessingInfo = {};

            // Aplicar preprocesamiento si está habilitado
            if (Object.values(preprocessing).some(enabled => enabled)) {
                processedImagePath = await this.applyAdvancedPreprocessing(imagePath, preprocessing);
                preprocessingInfo.applied = true;
                preprocessingInfo.options = preprocessing;
            }

            let result;

            // Ejecutar OCR según el motor seleccionado
            switch (engine) {
                case 'google':
                    result = await this.performGoogleVisionOCR(processedImagePath, {
                        languages,
                        confidence,
                        preprocessing: preprocessingInfo,
                        cloudAPIs
                    });
                    break;
                case 'azure':
                    result = await this.performAzureOCR(processedImagePath, {
                        language: languages[0] || 'es',
                        confidence,
                        preprocessing: preprocessingInfo,
                        cloudAPIs
                    });
                    break;
                case 'aws':
                    result = await this.performAWSTextractOCR(processedImagePath, {
                        confidence,
                        preprocessing: preprocessingInfo,
                        cloudAPIs
                    });
                    break;
                case 'tesseract':
                default:
                    result = await this.performOCR(processedImagePath, {
                        language: languages.join('+'),
                        preprocess: false, // Ya se aplicó preprocesamiento
                        confidence,
                        outputFormat
                    });
                    result.engine = 'tesseract';
                    break;
            }

            // Limpiar archivo preprocesado si es diferente
            if (processedImagePath !== imagePath) {
                await fs.unlink(processedImagePath);
            }

            // Aplicar filtros adicionales según configuración
            if (minTextSize > 0) {
                result.words = result.words.filter(word =>
                    word.text && word.text.length >= minTextSize
                );
            }

            // Filtrar por confianza
            const filteredWords = result.words.filter(word => word.confidence >= confidence);
            result.filteredText = filteredWords.map(word => word.text).join(' ');
            result.pageStats.filteredWords = filteredWords.length;

            // Agregar metadatos de configuración
            result.config = {
                engine,
                languages,
                confidence,
                pageSegmentation,
                detailLevel,
                minTextSize,
                preprocessing: preprocessingInfo
            };

            return result;

        } catch (error) {
            console.error('Error en OCR personalizado:', error);
            throw new Error(`Error en OCR personalizado: ${error.message}`);
        }
    }

    /**
     * Valida configuración OCR
     */
    validateConfig(config = {}) {
        const errors = [];

        // Validar motor
        if (!config.engine || !['tesseract', 'google', 'azure', 'aws'].includes(config.engine)) {
            errors.push('Motor OCR no válido');
        }

        // Validar idiomas
        if (!config.languages || !Array.isArray(config.languages) || config.languages.length === 0) {
            errors.push('Se requiere al menos un idioma');
        }

        // Validar confianza
        if (config.confidence && (config.confidence < 0 || config.confidence > 100)) {
            errors.push('La confianza debe estar entre 0 y 100');
        }

        // Validar configuración de API si es motor en la nube
        if (config.engine !== 'tesseract') {
            const cloudConfig = config.cloudAPIs?.[`${config.engine}Vision`] ||
                                config.cloudAPIs?.[`${config.engine}Textract`] ||
                                config.cloudAPIs?.[config.engine];
            if (!cloudConfig || !cloudConfig.enabled || !cloudConfig.apiKey) {
                errors.push(`Se requiere configuración de API para ${config.engine}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = OCRProcessor;