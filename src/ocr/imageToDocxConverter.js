const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const OCRProcessor = require('./ocrProcessor');

class ImageToDocxConverter {
    constructor() {
        this.ocrProcessor = new OCRProcessor();
        this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
    }

    /**
     * Convierte imagen a DOCX editable con formato profesional
     */
    async convertToEditableDocx(imagePath, options = {}) {
        const {
            outputPath = null,
            includeOriginalImage = true,
            ocrLanguage = 'spa+eng',
            formatting = 'professional',
            preserveLayout = true,
            ocrOptions = {}
        } = options;

        try {
            // Validar formato de imagen
            const ext = path.extname(imagePath).toLowerCase();
            if (!this.supportedImageFormats.includes(ext)) {
                throw new Error(`Formato de imagen no soportado: ${ext}`);
            }

            // Generar ruta de salida si no se especifica
            const finalOutputPath = outputPath || this.generateOutputPath(imagePath, 'docx');

            // Realizar OCR con alta precisión
            console.log('🔍 Realizando OCR en la imagen...');
            const ocrResult = await this.ocrProcessor.performOCR(imagePath, {
                language: ocrLanguage,
                preprocess: true,
                confidence: 60,
                ...ocrOptions
            });

            // Obtener información de la imagen
            const imageInfo = await sharp(imagePath).metadata();

            // Crear documento DOCX
            console.log('📄 Creando DOCX editable...');
            const doc = await this.createDocument(ocrResult, imageInfo, {
                includeOriginalImage,
                formatting,
                preserveLayout,
                imagePath
            });

            // Generar buffer del documento
            const buffer = await Packer.toBuffer(doc);

            // Guardar archivo
            await fs.writeFile(finalOutputPath, buffer);

            console.log('✅ DOCX editable creado exitosamente');

            return {
                success: true,
                outputPath: finalOutputPath,
                ocrResult: ocrResult,
                imageInfo: imageInfo,
                docxStats: {
                    paragraphs: ocrResult.pageStats.paragraphs,
                    words: ocrResult.pageStats.words,
                    lines: ocrResult.pageStats.lines,
                    hasImages: includeOriginalImage,
                    textSize: ocrResult.text.length,
                    confidence: ocrResult.confidence,
                    formatting: formatting
                }
            };

        } catch (error) {
            console.error('❌ Error convirtiendo imagen a DOCX:', error);
            throw new Error(`Error en conversión a DOCX: ${error.message}`);
        }
    }

    /**
     * Crea documento DOCX con formato profesional
     */
    async createDocument(ocrResult, imageInfo, options) {
        const { includeOriginalImage, formatting, preserveLayout, imagePath } = options;
        const { text, words, lines, paragraphs, blocks, structuredData } = ocrResult;

        // Crear secciones del documento
        const sections = [];

        // Sección principal con encabezado
        const mainSection = {
            properties: {
                page: {
                    margin: {
                        top: 720,    // 0.5 pulgada
                        right: 720,
                        bottom: 720,
                        left: 720
                    }
                }
            },
            children: []
        };

        // Agregar encabezado del documento
        mainSection.children.push(...this.createHeader(ocrResult, imageInfo));

        // Agregar imagen original si se solicita
        if (includeOriginalImage && imagePath) {
            mainSection.children.push(await this.createImageSection(imagePath, imageInfo));
        }

        // Agregar contenido OCR según formato
        if (formatting === 'professional') {
            mainSection.children.push(...this.createProfessionalContent(ocrResult));
        } else if (formatting === 'structured') {
            mainSection.children.push(...this.createStructuredContent(ocrResult));
        } else if (formatting === 'raw') {
            mainSection.children.push(...this.createRawContent(ocrResult));
        }

        // Agregar pie de página
        mainSection.children.push(...this.createFooter(ocrResult));

        sections.push(mainSection);

        // Crear documento
        return new Document({
            sections: sections,
            creator: 'Document Analyzer',
            title: 'Documento OCR',
            subject: 'DOCX editable desde imagen',
            description: `Documento procesado con OCR - Confianza: ${ocrResult.confidence.toFixed(2)}%`,
            keywords: 'OCR, imagen, texto, conversión',
            category: 'Documento Procesado',
            comments: `Procesado el ${new Date().toISOString()}`
        });
    }

    /**
     * Crea encabezado del documento
     */
    createHeader(ocrResult, imageInfo) {
        const header = [];

        // Título principal
        header.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "DOCUMENTO PROCESADO CON OCR",
                        bold: true,
                        size: 32,
                        color: "2E74B5"
                    })
                ],
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        // Información del procesamiento
        header.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Fecha de procesamiento: `,
                        bold: true
                    }),
                    new TextRun({
                        text: new Date().toLocaleString('es-ES')
                    })
                ],
                spacing: { after: 100 }
            })
        );

        header.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Confianza del OCR: `,
                        bold: true
                    }),
                    new TextRun({
                        text: `${ocrResult.confidence.toFixed(2)}%`,
                        color: ocrResult.confidence > 80 ? "00B050" : ocrResult.confidence > 60 ? "FFC000" : "FF0000"
                    })
                ],
                spacing: { after: 100 }
            })
        );

        header.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Dimensiones de imagen: `,
                        bold: true
                    }),
                    new TextRun({
                        text: `${imageInfo.width} × ${imageInfo.height} píxeles`
                    })
                ],
                spacing: { after: 100 }
            })
        );

        // Línea separadora
        header.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "─".repeat(50),
                        color: "D9D9D9"
                    })
                ],
                spacing: { after: 300 }
            })
        );

        return header;
    }

    /**
     * Crea sección de imagen
     */
    async createImageSection(imagePath, imageInfo) {
        try {
            // Leer imagen como buffer
            const imageBuffer = await fs.readFile(imagePath);

            return [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "IMAGEN ORIGINAL",
                            bold: true,
                            size: 24,
                            color: "2E74B5"
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: imageBuffer,
                            transformation: {
                                width: Math.min(imageInfo.width, 600),
                                height: Math.min(imageInfo.height, 400)
                            }
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                })
            ];
        } catch (error) {
            console.error('Error agregando imagen:', error);
            return [];
        }
    }

    /**
     * Crea contenido con formato profesional
     */
    createProfessionalContent(ocrResult) {
        const content = [];
        const { paragraphs, lines, structuredData } = ocrResult;

        // Título de contenido
        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "CONTENIDO EXTRAÍDO",
                        bold: true,
                        size: 24,
                        color: "2E74B5"
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            })
        );

        // Agregar párrafos con formato
        if (paragraphs && paragraphs.length > 0) {
            paragraphs.forEach((paragraph, index) => {
                if (paragraph.text.trim() && paragraph.confidence > 60) {
                    content.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: paragraph.text.trim(),
                                    size: 22
                                })
                            ],
                            spacing: { after: 200 },
                            indent: { left: 720 }
                        })
                    );
                }
            });
        } else if (lines && lines.length > 0) {
            // Si no hay párrafos, usar líneas
            lines.forEach((line, index) => {
                if (line.text.trim() && line.confidence > 60) {
                    content.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.text.trim(),
                                    size: 22
                                })
                            ],
                            spacing: { after: 120 }
                        })
                    );
                }
            });
        }

        // Agregar datos estructurados si existen
        if (structuredData && Object.keys(structuredData).length > 0) {
            content.push(...this.createStructuredDataSection(structuredData));
        }

        return content;
    }

    /**
     * Crea contenido estructurado
     */
    createStructuredContent(ocrResult) {
        const content = [];
        const { structuredData, paragraphs, lines } = ocrResult;

        // Título
        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "CONTENIDO ESTRUCTURADO",
                        bold: true,
                        size: 24,
                        color: "2E74B5"
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            })
        );

        // Datos clave-valor
        if (structuredData.keyValues && Object.keys(structuredData.keyValues).length > 0) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "DATOS EXTRAÍDOS",
                            bold: true,
                            size: 20,
                            color: "4472C4"
                        })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            );

            for (const [key, value] of Object.entries(structuredData.keyValues)) {
                content.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${key}: `,
                                bold: true
                            }),
                            new TextRun({
                                text: value
                            })
                        ],
                        spacing: { after: 100 }
                    })
                );
            }
        }

        // Fechas encontradas
        if (structuredData.dates && structuredData.dates.length > 0) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "FECHAS ENCONTRADAS",
                            bold: true,
                            size: 20,
                            color: "4472C4"
                        })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            );

            structuredData.dates.forEach(date => {
                content.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${date}`
                            })
                        ],
                        spacing: { after: 100 }
                    })
                );
            });
        }

        // Emails encontrados
        if (structuredData.emails && structuredData.emails.length > 0) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "CORREOS ELECTRÓNICOS",
                            bold: true,
                            size: 20,
                            color: "4472C4"
                        })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            );

            structuredData.emails.forEach(email => {
                content.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${email}`
                            })
                        ],
                        spacing: { after: 100 }
                    })
                );
            });
        }

        // Teléfonos encontrados
        if (structuredData.phones && structuredData.phones.length > 0) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "TELÉFONOS",
                            bold: true,
                            size: 20,
                            color: "4472C4"
                        })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            );

            structuredData.phones.forEach(phone => {
                content.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${phone}`
                            })
                        ],
                        spacing: { after: 100 }
                    })
                );
            });
        }

        return content;
    }

    /**
     * Crea contenido raw sin formato
     */
    createRawContent(ocrResult) {
        const content = [];
        const { text } = ocrResult;

        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "TEXTO COMPLETO (RAW)",
                        bold: true,
                        size: 24,
                        color: "2E74B5"
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            })
        );

        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        font: "Courier New",
                        size: 20
                    })
                ],
                spacing: { after: 200 }
            })
        );

        return content;
    }

    /**
     * Crea sección de datos estructurados
     */
    createStructuredDataSection(structuredData) {
        const content = [];

        // Estadísticas del documento
        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "ESTADÍSTICAS DEL DOCUMENTO",
                        bold: true,
                        size: 20,
                        color: "4472C4"
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 }
            })
        );

        const stats = [
            `Palabras: ${structuredData.numbers ? structuredData.numbers.length : 0}`,
            `Líneas: ${structuredData.paragraphs ? structuredData.paragraphs.length : 0}`,
            `Encabezados: ${structuredData.headers ? structuredData.headers.length : 0}`,
            `Listas: ${structuredData.lists ? structuredData.lists.length : 0}`
        ];

        stats.forEach(stat => {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `• ${stat}`
                        })
                    ],
                    spacing: { after: 100 }
                })
            );
        });

        return content;
    }

    /**
     * Crea pie de página
     */
    createFooter(ocrResult) {
        const footer = [];

        // Línea separadora
        footer.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "─".repeat(50),
                        color: "D9D9D9"
                    })
                ],
                spacing: { before: 400, after: 200 }
            })
        );

        // Información del procesamiento
        footer.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Documento procesado con ",
                        italics: true,
                        size: 18
                    }),
                    new TextRun({
                        text: "Document Analyzer v1.0.0",
                        bold: true,
                        italics: true,
                        size: 18,
                        color: "2E74B5"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            })
        );

        footer.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Motor OCR: Tesseract.js | Lenguaje: ${ocrResult.language} | Confianza: ${ocrResult.confidence.toFixed(2)}%`,
                        italics: true,
                        size: 16,
                        color: "666666"
                    })
                ],
                alignment: AlignmentType.CENTER
            })
        );

        return footer;
    }

    /**
     * Convierte múltiples imágenes a un solo DOCX
     */
    async convertMultipleToDocx(imagePaths, options = {}) {
        const {
            outputPath = null,
            combineIntoSingle = true,
            ocrLanguage = 'spa+eng',
            formatting = 'professional'
        } = options;

        try {
            if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
                throw new Error('Se requiere un array de rutas de imágenes');
            }

            const results = [];

            if (combineIntoSingle) {
                // Combinar todas las imágenes en un solo DOCX
                const finalOutputPath = outputPath || this.generateOutputPath('combined', 'docx');
                
                const sections = [];

                for (let i = 0; i < imagePaths.length; i++) {
                    const imagePath = imagePaths[i];
                    console.log(`📄 Procesando imagen ${i + 1}/${imagePaths.length}...`);

                    // Realizar OCR
                    const ocrResult = await this.ocrProcessor.performOCR(imagePath, {
                        language: ocrLanguage,
                        preprocess: true
                    });

                    const imageInfo = await sharp(imagePath).metadata();

                    // Crear sección para cada imagen
                    const section = await this.createDocument(ocrResult, imageInfo, {
                        includeOriginalImage: true,
                        formatting: formatting,
                        preserveLayout: true,
                        imagePath: imagePath
                    });

                    sections.push(...section.sections);

                    results.push({
                        imagePath,
                        ocrResult,
                        pageNumber: i + 1
                    });
                }

                // Crear documento combinado
                const combinedDoc = new Document({
                    sections: sections,
                    creator: 'Document Analyzer',
                    title: 'Documento OCR Combinado'
                });

                const buffer = await Packer.toBuffer(combinedDoc);
                await fs.writeFile(finalOutputPath, buffer);

                return {
                    success: true,
                    outputPath: finalOutputPath,
                    type: 'combined',
                    totalImages: imagePaths.length,
                    results: results
                };

            } else {
                // Crear DOCX separado para cada imagen
                for (const imagePath of imagePaths) {
                    const result = await this.convertToEditableDocx(imagePath, options);
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
     * Obtiene información del conversor
     */
    getInfo() {
        return {
            supportedFormats: this.supportedImageFormats,
            features: [
                'Conversión a DOCX editable',
                'Formato profesional',
                'Texto estructurado',
                'Preservación de imagen original',
                'Múltiples imágenes en un DOCX',
                'Metadatos completos',
                'Soporte multi-idioma',
                'Alta precisión de formato'
            ],
            formattingOptions: [
                'professional - Formato profesional con encabezados',
                'structured - Contenido estructurado por tipo',
                'raw - Texto sin formato adicional'
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

module.exports = ImageToDocxConverter;