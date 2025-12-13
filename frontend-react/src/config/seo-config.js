/**
 * Configuración SEO específica para cada ruta de la aplicación
 * Cada ruta tiene meta tags únicos para mejor posicionamiento
 */

export const seoConfig = {
  // Rutas principales
  '/': {
    title: 'Editor PDF Online Gratis | Analizador PDF con IA | EditorPDF Pro',
    description: 'Editor PDF online gratuito con IA. Convierte PDF a Word, Excel, PowerPoint. OCR inteligente, procesamiento batch, análisis con inteligencia artificial.',
    keywords: 'editor pdf, convertir pdf, pdf a word, ocr pdf, analizador pdf, herramientas pdf, procesamiento batch, ia pdf',
    ogTitle: 'Editor PDF Online Gratis con IA | EditorPDF Pro',
    ogDescription: 'Herramientas PDF profesionales con inteligencia artificial. Convierte, analiza y procesa documentos PDF online 100% gratis.',
    schemaType: 'WebApplication',
    schemaName: 'EditorPDF Pro - Plataforma Completa'
  },
  
  // Análisis y OCR
  '/analisis-documentos': {
    title: 'Analizar PDF Online con IA | Extraer Texto e Información Inteligente',
    description: 'Analiza documentos PDF con inteligencia artificial. Extrae texto, imágenes, tablas y obtén insights automatizados de tus documentos.',
    keywords: 'analizar pdf, extraer texto pdf, ia pdf, análisis documentos, pdf inteligente, procesar pdf',
    ogTitle: 'Analizador PDF con IA | Extrae Información Inteligente',
    ogDescription: 'Analiza documentos PDF con IA. Extrae texto, imágenes, tablas y obtén insights automatizados.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Analizador PDF con IA'
  },
  
  '/ocr-conversion': {
    title: 'OCR PDF Online Gratis | Convertir Imágenes a Texto Editable',
    description: 'Convierte documentos escaneados e imágenes a texto editable con OCR inteligente. Reconocimiento óptico de caracteres con 99% de precisión.',
    keywords: 'ocr pdf, convertir imagen a texto, pdf escaneado, reconocimiento óptico, extraer texto de pdf, ocr online',
    ogTitle: 'OCR PDF Online Gratis | Texto Editable en Segundos',
    ogDescription: 'Convierte documentos escaneados a texto editable con OCR inteligente. 99% de precisión.',
    schemaType: 'SoftwareApplication',
    schemaName: 'OCR PDF Online'
  },
  
  '/analisis-imagenes': {
    title: 'Analizar Imágenes con IA | Extraer Texto y Objetos de Fotos',
    description: 'Analiza imágenes con inteligencia artificial. Extrae texto, objetos, caras y obtén descripciones detalladas de fotografías.',
    keywords: 'analizar imagenes, ia imagenes, extraer texto de imagen, reconocimiento objetos, vision artificial',
    ogTitle: 'Analizar Imágenes con IA | Extrae Información Visual',
    ogDescription: 'Analiza imágenes con IA. Extrae texto, objetos y obtén descripciones detalladas.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Analizador de Imágenes con IA'
  },
  
  // Procesamiento Batch
  '/procesamiento-batch': {
    title: 'Procesamiento Batch PDF | Múltiples Documentos Simultáneamente',
    description: 'Procesa cientos de documentos PDF simultáneamente. Convierte, extrae, analiza y organiza archivos en batch automatizado.',
    keywords: 'procesamiento batch pdf, múltiples pdf, batch processing, automatizar pdf, procesar varios archivos',
    ogTitle: 'Procesamiento Batch PDF | Automatiza Documentos',
    ogDescription: 'Procesa cientos de PDFs simultáneamente. Convierte, extrae y analiza en batch.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Procesamiento Batch PDF'
  },
  
  '/herramientas-batch': {
    title: 'Herramientas Batch PDF | Automatización de Documentos',
    description: 'Herramientas profesionales para procesamiento batch de PDF. Automatiza conversiones, extracciones y análisis masivos.',
    keywords: 'herramientas batch, automatizar documentos, batch pdf, procesamiento masivo',
    ogTitle: 'Herramientas Batch PDF | Automatización Profesional',
    ogDescription: 'Automatiza procesamiento masivo de PDF. Herramientas profesionales en batch.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Herramientas Batch PDF'
  },
  
  // IA y Machine Learning
  '/inteligencia-artificial': {
    title: 'IA para PDF | Análisis Inteligente de Documentos',
    description: 'Analiza documentos PDF con modelos de IA avanzados. Extracción inteligente, clasificación automática y generación de insights.',
    keywords: 'ia pdf, inteligencia artificial documentos, analisis ia, machine learning pdf, automatizacion ia',
    ogTitle: 'IA para Análisis de PDF | Inteligencia Artificial',
    ogDescription: 'Analiza PDF con IA avanzada. Extracción inteligente y generación de insights.',
    schemaType: 'SoftwareApplication',
    schemaName: 'IA para Análisis de PDF'
  },
  
  '/metricas-ia': {
    title: 'Métricas de IA | Rendimiento y Precisión de Modelos',
    description: 'Monitorea métricas de rendimiento de IA. Precisión, velocidad, costos y eficiencia de modelos de machine learning.',
    keywords: 'metricas ia, rendimiento ia, precision modelos, monitoreo ia, analytics machine learning',
    ogTitle: 'Métricas de IA | Monitorea Rendimiento',
    ogDescription: 'Monitorea métricas de IA. Precisión, velocidad y eficiencia de modelos.',
    schemaType: 'WebPage',
    schemaName: 'Métricas de IA'
  },
  
  '/comparacion-modelos': {
    title: 'Comparar Modelos de IA | GPT-4, Claude, Gemini, Llama',
    description: 'Compara modelos de IA para análisis de documentos. GPT-4, Claude, Gemini, Llama. Rendimiento, precio y features.',
    keywords: 'comparar modelos ia, gpt-4 vs claude, mejor ia pdf, comparativa ia, elegir modelo',
    ogTitle: 'Comparar Modelos de IA | GPT-4 Claude Gemini',
    ogDescription: 'Compara GPT-4, Claude, Gemini para PDF. Rendimiento, precio y features.',
    schemaType: 'WebPage',
    schemaName: 'Comparación de Modelos IA'
  },
  
  // Conversiones PDF
  '/conversion-pdf': {
    title: 'Convertir a PDF Online | Word, Excel, PowerPoint, Imágenes',
    description: 'Convierte cualquier formato a PDF online. Word, Excel, PowerPoint, JPG, PNG, HTML a PDF con calidad profesional.',
    keywords: 'convertir a pdf, word a pdf, excel a pdf, imagen a pdf, html a pdf, crear pdf',
    ogTitle: 'Convertir a PDF Online | Todos los Formatos',
    ogDescription: 'Convierte Word, Excel, PowerPoint, imágenes a PDF online. Calidad profesional.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Convertir a PDF'
  },
  
  '/conversion-word': {
    title: 'PDF a Word Online | Convertir PDF a DOCX Editable',
    description: 'Convierte PDF a Word completamente editable. Conserva formato, imágenes y tablas. DOCX de alta calidad.',
    keywords: 'pdf a word, convertir pdf a word, pdf a docx, pdf editable, extraer texto pdf',
    ogTitle: 'PDF a Word Online | DOCX Editable Gratis',
    ogDescription: 'Convierte PDF a Word editable. Conserva formato, imágenes y tablas.',
    schemaType: 'SoftwareApplication',
    schemaName: 'PDF a Word Converter'
  },
  
  '/herramientas/pdf-a-excel': {
    title: 'PDF a Excel Online | Extraer Tablas a XLSX',
    description: 'Convierte PDF a Excel extrayendo tablas y datos. XLSX editable con formato conservado. OCR inteligente.',
    keywords: 'pdf a excel, convertir pdf a excel, extraer tablas pdf, pdf a xlsx, datos pdf a excel',
    ogTitle: 'PDF a Excel Online | Extrae Tablas y Datos',
    ogDescription: 'Convierte PDF a Excel extrayendo tablas. XLSX editable con OCR inteligente.',
    schemaType: 'SoftwareApplication',
    schemaName: 'PDF a Excel Converter'
  },
  
  '/herramientas/pdf-a-powerpoint': {
    title: 'PDF a PowerPoint | Convertir PDF a PPTX Editable',
    description: 'Convierte PDF a PowerPoint presentaciones editables. Conserva diseño, imágenes y formato de diapositivas.',
    keywords: 'pdf a powerpoint, convertir pdf a pptx, pdf a presentacion, diapositivas pdf',
    ogTitle: 'PDF a PowerPoint | PPTX Editable Gratis',
    ogDescription: 'Convierte PDF a PowerPoint editable. Conserva diseño y formato.',
    schemaType: 'SoftwareApplication',
    schemaName: 'PDF a PowerPoint Converter'
  },
  
  '/herramientas/pdf-a-imagenes': {
    title: 'PDF a Imágenes | Convertir PDF a JPG, PNG, SVG',
    description: 'Convierte PDF a imágenes JPG, PNG, SVG. Extrae todas las páginas o selecciona rangos específicos. Alta calidad.',
    keywords: 'pdf a imagen, pdf a jpg, pdf a png, extraer imagenes pdf, convertir paginas pdf',
    ogTitle: 'PDF a Imágenes | JPG PNG SVG Gratis',
    ogDescription: 'Convierte PDF a JPG, PNG, SVG. Extrae páginas con alta calidad.',
    schemaType: 'SoftwareApplication',
    schemaName: 'PDF a Imágenes Converter'
  },
  
  // Herramientas de edición PDF
  '/herramientas/editor-avanzado': {
    title: 'Editor PDF Online | Añadir Texto, Imágenes, Formas',
    description: 'Edita PDF online añadiendo texto, imágenes, formas y anotaciones. Editor profesional gratuito en tu navegador.',
    keywords: 'editor pdf, editar pdf online, modificar pdf, añadir texto pdf, anotaciones pdf',
    ogTitle: 'Editor PDF Online | Texto Imágenes Formas Gratis',
    ogDescription: 'Edita PDF online añadiendo texto, imágenes y formas. Editor profesional.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Editor PDF Online'
  },
  
  '/herramientas/firmar-documento': {
    title: 'Firmar PDF Online | Firma Electrónica Digital',
    description: 'Firma documentos PDF electrónicamente. Crea firma digital, dibuja firma o sube imagen. Legal y seguro.',
    keywords: 'firmar pdf, firma digital pdf, firma electronica, pdf firmado, documento firmado',
    ogTitle: 'Firmar PDF Online | Firma Electrónica Digital',
    ogDescription: 'Firma PDF electrónicamente. Firma digital legal y segura.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Firma PDF Online'
  },
  
  '/herramientas/proteger-contrasena': {
    title: 'Proteger PDF con Contraseña | Encriptar PDF Gratis',
    description: 'Protege PDF con contraseña y encriptación. Seguridad AES-256. Restringe impresión, copia y edición.',
    keywords: 'proteger pdf, contraseña pdf, encriptar pdf, seguridad pdf, pdf privado',
    ogTitle: 'Proteger PDF con Contraseña | Encriptación AES-256',
    ogDescription: 'Protege PDF con contraseña AES-256. Restringe impresión y copia.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Proteger PDF con Contraseña'
  },
  
  '/herramientas/desbloquear-pdf': {
    title: 'Desbloquear PDF | Quitar Contraseña de PDF Protegido',
    description: 'Quita contraseña de PDF protegido. Desbloquea restricciones de impresión, copia y edición. Rápido y seguro.',
    keywords: 'desbloquear pdf, quitar contraseña pdf, pdf protegido, desencriptar pdf',
    ogTitle: 'Desbloquear PDF | Quitar Contraseña y Restricciones',
    ogDescription: 'Desbloquea PDF quitando contraseña y restricciones. Rápido y seguro.',
    schemaType: 'SoftwareApplication',
    schemaName: 'Desbloquear PDF'
  },
  
  // Auth y configuración
  '/acceso': {
    title: 'Iniciar Sesión | EditorPDF Pro',
    description: 'Accede a tu cuenta de EditorPDF Pro. Inicia sesión para guardar historial, configuraciones y acceder a funciones premium.',
    keywords: 'iniciar sesion, login pdf, acceder editor pdf, cuenta pdf',
    ogTitle: 'Iniciar Sesión | EditorPDF Pro',
    ogDescription: 'Accede a tu cuenta de EditorPDF Pro. Guarda historial y configuraciones.',
    schemaType: 'WebPage',
    schemaName: 'Iniciar Sesión'
  },
  
  '/registro': {
    title: 'Crear Cuenta Gratis | EditorPDF Pro',
    description: 'Regístrate gratis en EditorPDF Pro. Guarda historial, accede a funciones premium y procesa documentos sin límites.',
    keywords: 'registrarse, crear cuenta, pdf gratis, cuenta pdf, registro editor pdf',
    ogTitle: 'Crear Cuenta Gratis | EditorPDF Pro',
    ogDescription: 'Regístrate gratis en EditorPDF Pro. Guarda historial y accede a premium.',
    schemaType: 'WebPage',
    schemaName: 'Registro de Usuario'
  },
  
  '/configuracion': {
    title: 'Configuración | Personaliza tu Experiencia',
    description: 'Configura tu cuenta de EditorPDF Pro. Personaliza preferencias, API keys y ajustes de procesamiento.',
    keywords: 'configuracion pdf, preferencias, ajustes, configurar editor pdf',
    ogTitle: 'Configuración | Personaliza EditorPDF Pro',
    ogDescription: 'Configura tu cuenta de EditorPDF Pro. Personaliza preferencias y ajustes.',
    schemaType: 'WebPage',
    schemaName: 'Configuración de Usuario'
  },
  
  // Default para rutas no especificadas
  default: {
    title: 'Editor PDF Online Gratis | Herramientas PDF Profesionales',
    description: 'Editor PDF online gratuito con herramientas profesionales. Convierte, edita, firma y protege documentos PDF fácilmente.',
    keywords: 'editor pdf, herramientas pdf, pdf online, pdf gratis, convertir pdf',
    ogTitle: 'Editor PDF Online Gratis | EditorPDF Pro',
    ogDescription: 'Herramientas PDF profesionales online. Convierte, edita, firma y protege PDFs.',
    schemaType: 'WebPage',
    schemaName: 'Editor PDF Online'
  }
};

// Helper para obtener configuración SEO por ruta
export const getSEOConfig = (pathname) => {
  return seoConfig[pathname] || seoConfig.default;
};

// Helper para generar Schema.org JSON-LD específico por ruta
export const generateSchemaJSONLD = (pathname, config) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': config.schemaType || 'WebPage',
    name: config.schemaName || config.title,
    description: config.description,
    url: `https://editorpdf.pro${pathname}`,
    applicationCategory: 'BusinessApplication'
  };

  if (config.schemaType === 'SoftwareApplication') {
    return {
      ...baseSchema,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250'
      },
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.'
    };
  }

  return baseSchema;
};