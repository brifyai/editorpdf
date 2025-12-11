# 📖 Guía Completa de OCR - Document Analyzer

## 🎯 Overview

El módulo OCR de **Document Analyzer** ofrece capacidades avanzadas de reconocimiento de texto con conversión a formatos editables. Utiliza la tecnología **Tesseract.js** para proporcionar resultados de alta precisión con múltiples opciones de procesamiento y conversión.

## ✨ Características Principales

### 🔍 **Reconocimiento de Texto Avanzado**
- **Multi-idioma**: Soporte para español, inglés, francés, alemán, italiano, portugués, chino, japonés y coreano
- **Detección automática de idioma**: Identificación automática del idioma del texto
- **Preprocesamiento inteligente**: Optimización automática de imágenes para mejor precisión
- **Análisis estructural**: Extracción de datos estructurados (fechas, emails, teléfonos, etc.)

### 🔄 **Conversión a Formatos Editables**
- **PDF Editable**: Texto seleccionable con capa OCR invisible
- **DOCX Profesional**: Documentos Word con formato profesional y estructurado
- **Preservación de imagen**: Mantiene la imagen original como referencia
- **Metadatos completos**: Información del proceso OCR integrada

### 📊 **Análisis Inteligente**
- **Detección de tipos de documento**: Facturas, formularios, recibos, documentos generales
- **Extracción de datos clave-valor**: Identificación automática de campos importantes
- **Estadísticas detalladas**: Métricas de confianza, conteo de elementos, tiempo de procesamiento

## 🚀 Guía Rápida de Uso

### 1. **Uso Básico vía Web**

```bash
# Iniciar el servidor
npm start

# Acceder a http://localhost:3000
# Arrastrar una imagen con texto
# Configurar opciones OCR
# Descargar resultados
```

### 2. **Uso Programático**

```javascript
const OCRProcessor = require('./src/ocr/ocrProcessor');
const ImageToPDFConverter = require('./src/ocr/imageToPDFConverter');
const ImageToDocxConverter = require('./src/ocr/imageToDocxConverter');

// Inicializar procesadores
const ocrProcessor = new OCRProcessor();
const pdfConverter = new ImageToPDFConverter();
const docxConverter = new ImageToDocxConverter();

// OCR básico
const result = await ocrProcessor.performOCR('imagen.jpg', {
    language: 'spa+eng',
    preprocess: true,
    confidence: 60
});

// Conversión a PDF
const pdfResult = await pdfConverter.convertToEditablePDF('imagen.jpg', {
    includeOriginalImage: true,
    ocrLanguage: 'spa+eng'
});

// Conversión a DOCX
const docxResult = await docxConverter.convertToEditableDocx('imagen.jpg', {
    formatting: 'professional',
    includeOriginalImage: true
});
```

## 📋 Formatos Soportados

### 🖼️ **Formatos de Imagen**
- **JPEG/JPG** - Recomendado para fotografías
- **PNG** - Ideal para imágenes con texto nítido
- **BMP** - Formato sin pérdida
- **TIFF/TIF** - Alta calidad para documentos escaneados
- **WebP** - Formato moderno optimizado

### 📄 **Formatos de Salida**
- **PDF Editable** - Con texto seleccionable
- **DOCX** - Documento Word con formato
- **JSON** - Datos estructurados del OCR
- **TXT** - Texto plano extraído

## ⚙️ Configuración Avanzada

### 🔧 **Opciones de OCR**

| Opción | Valores | Descripción |
|--------|---------|-------------|
| `language` | 'spa', 'eng', 'spa+eng', etc. | Idioma(s) del texto |
| `preprocess` | true/false | Preprocesar imagen |
| `confidence` | 30-90 | Confianza mínima (%) |
| `documentType` | 'auto', 'invoice', 'form', etc. | Tipo de documento |
| `outputFormat` | 'text', 'hocr', 'tsv' | Formato de salida |

### 🎨 **Opciones de Formato DOCX**

| Formato | Descripción | Uso Recomendado |
|---------|-------------|------------------|
| `professional` | Formato corporativo con encabezados | Documentos formales |
| `structured` | Datos organizados por tipo | Facturas, formularios |
| `raw` | Texto sin formato adicional | Procesamiento rápido |

### 📊 **Niveles de Confianza**

- **90-100%**: Excelente calidad de texto
- **70-89%**: Buena calidad, usable
- **50-69%**: Calidad moderada, requiere revisión
- **30-49%**: Baja calidad, puede tener errores

## 🎯 Casos de Uso Recomendados

### 📄 **Digitalización de Documentos**
```javascript
// Para documentos importantes
const result = await pdfConverter.convertToEditablePDF('documento.jpg', {
    includeOriginalImage: true,
    ocrLanguage: 'spa+eng',
    ocrOptions: {
        preprocess: true,
        confidence: 80
    }
});
```

### 💼 **Procesamiento de Facturas**
```javascript
// Para extracción de datos estructurados
const result = await ocrProcessor.structuredOCR('factura.jpg', 'invoice');
console.log(result.structuredData.keyValues);
// Salida: { invoiceNumber: "F001-2024", total: "1500.00", date: "15/01/2024" }
```

### 📝 **Conversión de Formularios**
```javascript
// Para formularios con campos específicos
const result = await docxConverter.convertToEditableDocx('formulario.png', {
    formatting: 'structured',
    documentType: 'form',
    ocrLanguage: 'spa'
});
```

### 🌍 **Documentos Multi-idioma**
```javascript
// Detección automática de idioma
const result = await ocrProcessor.autoDetectOCR('documento_multilang.jpg');
console.log(`Idioma detectado: ${result.detectedLanguage}`);
console.log(`Mejor confianza: ${result.bestResult.confidence}%`);
```

## 🔧 API Endpoints

### **POST /api/ocr**
Realiza OCR en una imagen.

```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "image=@documento.jpg" \
  -F "language=spa+eng" \
  -F "confidence=70" \
  -F "preprocess=true"
```

### **POST /api/convert-to-pdf**
Convierte imagen a PDF editable.

```bash
curl -X POST http://localhost:3000/api/convert-to-pdf \
  -F "image=@documento.jpg" \
  -F "ocrLanguage=spa+eng" \
  -F "includeOriginalImage=true"
```

### **POST /api/convert-to-docx**
Convierte imagen a DOCX editable.

```bash
curl -X POST http://localhost:3000/api/convert-to-docx \
  -F "image=@documento.jpg" \
  -F "ocrLanguage=spa+eng" \
  -F "formatting=professional"
```

### **POST /api/batch-convert**
Procesa múltiples imágenes.

```bash
curl -X POST http://localhost:3000/api/batch-convert \
  -F "images=@img1.jpg" \
  -F "images=@img2.png" \
  -F "convertTo=pdf" \
  -F "combineIntoSingle=true"
```

## 📈 Optimización y Mejores Prácticas

### 🎯 **Para Mejores Resultados**

1. **Calidad de Imagen**
   - Resolución mínima: 300 DPI
   - Texto nítido y claro
   - Buena iluminación
   - Sin sombras o reflejos

2. **Preprocesamiento**
   ```javascript
   // Habilitar preprocesamiento automático
   const result = await ocrProcessor.performOCR('imagen.jpg', {
       preprocess: true,
       confidence: 70
   });
   ```

3. **Selección de Idioma**
   ```javascript
   // Para documentos bilingües
   const result = await ocrProcessor.performOCR('imagen.jpg', {
       language: 'spa+eng'  // Español + Inglés
   });
   ```

### ⚡ **Optimización de Rendimiento**

```javascript
// Para procesamiento rápido
const quickResult = await ocrProcessor.performOCR('imagen.jpg', {
    language: 'eng',
    preprocess: false,
    confidence: 50
});

// Para máxima precisión
const detailedResult = await ocrProcessor.performOCR('imagen.jpg', {
    language: 'spa+eng',
    preprocess: true,
    confidence: 80
});
```

## 🛠️ Solución de Problemas

### ❌ **Errores Comunes**

#### **Baja Confianza (< 50%)**
```javascript
// Solución: Mejorar imagen y ajustar parámetros
const result = await ocrProcessor.performOCR('imagen.jpg', {
    preprocess: true,  // Habilitar preprocesamiento
    confidence: 40     // Reducir umbral temporalmente
});
```

#### **Texto No Detectado**
```javascript
// Solución: Probar múltiples idiomas
const result = await ocrProcessor.autoDetectOCR('imagen.jpg');
```

#### **Formato No Soportado**
```javascript
// Verificar formato antes de procesar
const supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];
const ext = path.extname(imagePath).toLowerCase();
if (!supportedFormats.includes(ext)) {
    throw new Error('Formato no soportado');
}
```

### 🔍 **Depuración**

```javascript
// Habilitar logging detallado
const result = await ocrProcessor.performOCR('imagen.jpg', {
    language: 'spa+eng',
    preprocess: true,
    confidence: 60,
    outputFormat: 'hocr'  // Para análisis detallado
});

console.log('Palabras detectadas:', result.words.length);
console.log('Confianza promedio:', result.confidence);
console.log('Bloques de texto:', result.blocks.length);
```

## 📚 Ejemplos Avanzados

### 🏢 **Procesamiento de Documentos Corporativos**

```javascript
class CorporateDocumentProcessor {
    constructor() {
        this.ocrProcessor = new OCRProcessor();
        this.pdfConverter = new ImageToPDFConverter();
        this.docxConverter = new ImageToDocxConverter();
    }

    async processInvoice(imagePath) {
        // OCR especializado para facturas
        const ocrResult = await this.ocrProcessor.structuredOCR(imagePath, 'invoice');
        
        // Extraer datos clave
        const invoiceData = ocrResult.structuredData.keyValues;
        
        // Generar PDF editable
        const pdfResult = await this.pdfConverter.convertToEditablePDF(imagePath, {
            includeOriginalImage: true,
            ocrLanguage: 'spa+eng'
        });
        
        return {
            extractedData: invoiceData,
            editablePDF: pdfResult.outputPath,
            confidence: ocrResult.confidence
        };
    }

    async processBatchDocuments(imagePaths) {
        // Procesamiento por lotes optimizado
        const results = [];
        
        for (const imagePath of imagePaths) {
            try {
                const result = await this.processDocument(imagePath);
                results.push({ success: true, ...result });
            } catch (error) {
                results.push({ success: false, error: error.message, imagePath });
            }
        }
        
        return results;
    }
}
```

### 🌐 **API REST Completa**

```javascript
// Ejemplo de servidor Express con OCR
app.post('/api/advanced-ocr', upload.single('image'), async (req, res) => {
    try {
        const { processingType, options } = req.body;
        
        let result;
        switch (processingType) {
            case 'basic':
                result = await ocrProcessor.performOCR(req.file.path, options);
                break;
            case 'structured':
                result = await ocrProcessor.structuredOCR(req.file.path, options.documentType);
                break;
            case 'multilang':
                result = await ocrProcessor.autoDetectOCR(req.file.path);
                break;
            default:
                throw new Error('Tipo de procesamiento no válido');
        }
        
        res.json({
            success: true,
            result: result,
            processingTime: Date.now() - startTime
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

## 📊 Métricas y Estadísticas

### 📈 **Indicadores de Calidad**

```javascript
// Función para evaluar calidad del OCR
function evaluateOCRQuality(result) {
    const confidence = result.confidence;
    const wordCount = result.pageStats.words;
    const textLength = result.text.length;
    
    let quality = 'Poor';
    if (confidence > 80 && wordCount > 10) quality = 'Excellent';
    else if (confidence > 70 && wordCount > 5) quality = 'Good';
    else if (confidence > 50) quality = 'Fair';
    
    return {
        quality,
        confidence,
        wordCount,
        textLength,
        recommendation: getRecommendation(quality)
    };
}

function getRecommendation(quality) {
    switch (quality) {
        case 'Excellent': 'Resultado listo para uso profesional';
        case 'Good': 'Requiere revisión mínima';
        case 'Fair': 'Requiere revisión manual';
        case 'Poor': 'Considerar mejorar calidad de imagen';
    }
}
```

## 🎯 Conclusión

El módulo OCR de **Document Analyzer** proporciona una solución completa y profesional para el reconocimiento de texto y conversión de documentos. Con capacidades avanzadas de procesamiento, múltiples formatos de salida y optimización automática, es ideal para:

- 🏢 **Empresas**: Digitalización de documentos y facturas
- 📚 **Educación**: Conversión de materiales didácticos
- 💼 **Profesionales**: Procesamiento de documentos legales y médicos
- 🔬 **Investigación**: Análisis de documentos históricos

**Características destacadas:**
- ✅ Alta precisión con Tesseract.js
- ✅ Soporte multi-idioma
- ✅ Conversión a formatos editables
- ✅ Procesamiento por lotes
- ✅ API REST completa
- ✅ Interfaz web intuitiva

**Lista para producción y uso empresarial.**