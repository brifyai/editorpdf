const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const OCRProcessor = require('./ocrProcessor');

class ImageToPDFConverter {
    constructor() {
        this.ocrProcessor = new OCRProcessor();
        this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
    }

    /**
     * Convierte imagen a PDF editable con texto OCR
     */
    async convertToEditablePDF(imagePath, options = {}) {
        const {
            outputPath = null,
            includeOriginalImage = true,
            ocrLanguage = 'spa+eng',
            pdfOptions = {},
            ocrOptions = {}
        } = options;

        try {
            // Validar formato de imagen
            const ext = path.extname(imagePath).toLowerCase();
            if (!this.supportedImageFormats.includes(ext)) {
                throw new Error(`Formato de imagen no soportado: ${ext}`);
            }

            // Generar ruta de salida si no se especifica
            const finalOutputPath = outputPath || this.generateOutputPath(imagePath, 'pdf');

            // Realizar OCR para extraer texto
            console.log('🔍 Realizando OCR en la imagen...');
            const ocrResult = await this.ocrProcessor.performOCR(imagePath, {
                language: ocrLanguage,
                preprocess: true,
                confidence: 60,
                ...ocrOptions
            });

            // Obtener información de la imagen
            const imageInfo = await sharp(imagePath).metadata();
            
            // Crear PDF
            console.log('📄 Creando PDF editable...');
            const pdfDoc = new PDFDocument({
                size: [imageInfo.width, imageInfo.height],
                margins: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                },
                info: {
                    Title: 'Documento OCR',
                    Author: 'Document Analyzer',
                    Subject: 'PDF editable desde imagen',
                    Creator: 'ImageToPDFConverter',
                    Producer: 'Document Analyzer OCR',
                    CreationDate: new Date(),
                    ModDate: new Date()
                },
                ...pdfOptions
            });

            // Configurar fuentes para mejor compatibilidad
            pdfDoc.registerFont('Regular', 'Helvetica');
            pdfDoc.registerFont('Bold', 'Helvetica-Bold');
            pdfDoc.registerFont('Italic', 'Helvetica-Oblique');

            // Stream de salida
            const stream = fs.createWriteStream(finalOutputPath);
            pdfDoc.pipe(stream);

            // Agregar imagen original si se solicita
            if (includeOriginalImage) {
                pdfDoc.image(imagePath, 0, 0, {
                    width: imageInfo.width,
                    height: imageInfo.height,
                    align: 'center',
                    valign: 'center'
                });
            }

            // Agregar capa de texto OCR (invisible pero seleccionable)
            await this.addOCRTextLayer(pdfDoc, ocrResult, imageInfo);

            // Agregar metadatos del OCR
            this.addOCRMetadata(pdfDoc, ocrResult, imageInfo);

            // Finalizar PDF
            pdfDoc.end();

            // Esperar a que se complete la escritura
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            console.log('✅ PDF editable creado exitosamente');

            return {
                success: true,
                outputPath: finalOutputPath,
                ocrResult: ocrResult,
                imageInfo: imageInfo,
                pdfStats: {
                    pages: 1,
                    hasText: true,
                    hasImages: includeOriginalImage,
                    textSize: ocrResult.text.length,
                    wordCount: ocrResult.pageStats.words,
                    confidence: ocrResult.confidence
                }
            };

        } catch (error) {
            console.error('❌ Error convirtiendo imagen a PDF:', error);
            throw new Error(`Error en conversión a PDF: ${error.message}`);
        }
    }

    /**
     * Agrega capa de texto OCR al PDF
     */
    async addOCRTextLayer(pdfDoc, ocrResult, imageInfo) {
        const { words, lines, paragraphs } = ocrResult;
        
        // Configurar texto invisible pero seleccionable
        pdfDoc.fillOpacity(0.01); // Casi invisible pero seleccionable
        pdfDoc.fillColor('black');
        pdfDoc.fontSize(12);

        // Método 1: Agregar palabras individuales con posiciones aproximadas
        if (words && words.length > 0) {
            await this.addWordsAsText(pdfDoc, words, imageInfo);
        }

        // Método 2: Agregar líneas de texto
        if (lines && lines.length > 0) {
            await this.addLinesAsText(pdfDoc, lines, imageInfo);
        }

        // Método 3: Agregar párrafos completos
        if (paragraphs && paragraphs.length > 0) {
            await this.addParagraphsAsText(pdfDoc, paragraphs, imageInfo);
        }

        // Restaurar opacidad
        pdfDoc.fillOpacity(1);
    }

    /**
     * Agrega palabras individuales con posicionamiento
     */
    async addWordsAsText(pdfDoc, words, imageInfo) {
        const lineHeight = 14;
        let currentY = 50;
        let currentX = 50;
        const maxX = imageInfo.width - 100;
        const lineHeightOffset = 16;

        words.forEach((word, index) => {
            // Calcular posición aproximada
            const wordWidth = word.text.length * 7; // Estimación de ancho
            
            // Salto de línea si excede el ancho
            if (currentX + wordWidth > maxX) {
                currentX = 50;
                currentY += lineHeightOffset;
            }

            // Agregar palabra si tiene buena confianza
            if (word.confidence > 60) {
                pdfDoc.text(word.text, currentX, currentY, {
                    lineBreak: false,
                    wordSpacing: 0,
                    characterSpacing: 0
                });
            }

            currentX += wordWidth + 3; // Espacio entre palabras
        });
    }

    /**
     * Agrega líneas de texto
     */
    async addLinesAsText(pdfDoc, lines, imageInfo) {
        const lineHeight = 18;
        let currentY = 100;

        lines.forEach((line, index) => {
            if (line.text.trim() && line.confidence > 60) {
                pdfDoc.fontSize(12).text(line.text.trim(), 50, currentY, {
                    width: imageInfo.width - 100,
                    align: 'left',
                    lineGap: 2
                });
                currentY += lineHeight;
            }
        });
    }

    /**
     * Agrega párrafos completos
     */
    async addParagraphsAsText(pdfDoc, paragraphs, imageInfo) {
        const paragraphSpacing = 25;
        let currentY = 200;

        paragraphs.forEach((paragraph, index) => {
            if (paragraph.text.trim() && paragraph.confidence > 60) {
                pdfDoc.fontSize(11).text(paragraph.text.trim(), 50, currentY, {
                    width: imageInfo.width - 100,
                    align: 'justify',
                    lineGap: 3
                });
                currentY += paragraphSpacing;
            }
        });
    }

    /**
     * Agrega metadatos del OCR al PDF
     */
    addOCRMetadata(pdfDoc, ocrResult, imageInfo) {
        // Agregar metadatos personalizados
        const metadata = {
            'OCR Confidence': ocrResult.confidence.toFixed(2) + '%',
            'OCR Language': ocrResult.language,
            'Word Count': ocrResult.pageStats.words,
            'Line Count': ocrResult.pageStats.lines,
            'Paragraph Count': ocrResult.pageStats.paragraphs,
            'Image Width': imageInfo.width,
            'Image Height': imageInfo.height,
            'Processing Date': new Date().toISOString(),
            'OCR Engine': 'Tesseract.js',
            'Document Analyzer': 'v1.0.0'
        };

        // Agregar como metadatos del PDF
        for (const [key, value] of Object.entries(metadata)) {
            pdfDoc.info[key] = value.toString();
        }
    }

    /**
     * Convierte múltiples imágenes a un solo PDF
     */
    async convertMultipleToPDF(imagePaths, options = {}) {
        const {
            outputPath = null,
            combineIntoSingle = true,
            ocrLanguage = 'spa+eng'
        } = options;

        try {
            if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
                throw new Error('Se requiere un array de rutas de imágenes');
            }

            const results = [];

            if (combineIntoSingle) {
                // Combinar todas las imágenes en un solo PDF
                const finalOutputPath = outputPath || this.generateOutputPath('combined', 'pdf');
                
                const pdfDoc = new PDFDocument({
                    autoFirstPage: false,
                    info: {
                        Title: 'Documento OCR Múltiple',
                        Author: 'Document Analyzer',
                        CreationDate: new Date()
                    }
                });

                const stream = fs.createWriteStream(finalOutputPath);
                pdfDoc.pipe(stream);

                for (let i = 0; i < imagePaths.length; i++) {
                    const imagePath = imagePaths[i];
                    console.log(`📄 Procesando imagen ${i + 1}/${imagePaths.length}...`);

                    // Realizar OCR
                    const ocrResult = await this.ocrProcessor.performOCR(imagePath, {
                        language: ocrLanguage,
                        preprocess: true
                    });

                    // Agregar nueva página
                    pdfDoc.addPage();

                    // Agregar imagen y texto OCR
                    const imageInfo = await sharp(imagePath).metadata();
                    pdfDoc.image(imagePath, 0, 0, {
                        width: pdfDoc.page.width,
                        height: pdfDoc.page.height,
                        align: 'center',
                        valign: 'center'
                    });

                    await this.addOCRTextLayer(pdfDoc, ocrResult, imageInfo);

                    results.push({
                        imagePath,
                        ocrResult,
                        pageNumber: i + 1
                    });
                }

                pdfDoc.end();

                await new Promise((resolve, reject) => {
                    stream.on('finish', resolve);
                    stream.on('error', reject);
                });

                return {
                    success: true,
                    outputPath: finalOutputPath,
                    type: 'combined',
                    totalPages: imagePaths.length,
                    results: results
                };

            } else {
                // Crear PDF separado para cada imagen
                for (const imagePath of imagePaths) {
                    const result = await this.convertToEditablePDF(imagePath, options);
                    results.push(result);
                }

                return {
                    success: true,
                    type: 'separate',
                    results: results
                };
            }

        } catch (error) {
            console.error('❌ Error convirtiendo múltiples imágenes:', error);
            throw error;
        }
    }

    /**
     * Genera ruta de salida automática
     */
    generateOutputPath(inputPath, extension) {
        const dir = path.dirname(inputPath);
        const name = path.basename(inputPath, path.extname(inputPath));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return path.join(dir, `${name}_ocr_${timestamp}.${extension}`);
    }

    /**
     * Valida archivo de imagen
     */
    async validateImage(imagePath) {
        try {
            const stats = await fs.stat(imagePath);
            const imageInfo = await sharp(imagePath).metadata();
            
            return {
                exists: true,
                size: stats.size,
                format: imageInfo.format,
                width: imageInfo.width,
                height: imageInfo.height,
                hasAlpha: imageInfo.hasAlpha,
                channels: imageInfo.channels,
                density: imageInfo.density
            };
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }

    /**
     * Optimiza imagen para mejor OCR
     */
    async optimizeImageForOCR(imagePath, outputPath) {
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
                .png({ compressionLevel: 6 })
                .toFile(outputPath);

            return outputPath;
        } catch (error) {
            console.error('Error optimizando imagen:', error);
            throw error;
        }
    }

    /**
     * Obtiene información del conversor
     */
    getInfo() {
        return {
            supportedFormats: this.supportedImageFormats,
            features: [
                'Conversión a PDF editable',
                'Texto seleccionable mediante OCR',
                'Preservación de imagen original',
                'Metadatos OCR incluidos',
                'Múltiples imágenes en un PDF',
                'Optimización automática de imágenes',
                'Soporte multi-idioma',
                'Alta precisión de texto'
            ],
            ocrLanguages: this.ocrProcessor.languages
        };
    }

    /**
     * Limpia recursos
     */
    async cleanup() {
        await this.ocrProcessor.cleanup();
    }
}

module.exports = ImageToPDFConverter;