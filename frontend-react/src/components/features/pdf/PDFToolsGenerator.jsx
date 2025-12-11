import React from 'react';
import PDFToolBase from './PDFToolBase';

// Configuraciones para todas las herramientas PDF
const TOOL_CONFIGS = {
  // Convertir a PDF
  'powerpoint-a-pdf': {
    title: 'PowerPoint a PDF',
    subtitle: 'Transforma presentaciones PPTX a PDF de alta calidad',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
    accept: 'pptx',
    maxFiles: 10,
    options: [
      {
        key: 'slideQuality',
        label: 'Calidad de diapositivas:',
        type: 'select',
        default: 'high',
        values: [
          { value: 'standard', label: 'Estándar' },
          { value: 'high', label: 'Alta' },
          { value: 'maximum', label: 'Máxima' }
        ]
      }
    ]
  },
  'excel-a-pdf': {
    title: 'Excel a PDF',
    subtitle: 'Convierte hojas de cálculo a PDF con columnas ajustadas',
    icon: '📈',
    gradient: 'linear-gradient(135deg, #009688 0%, #00695c 100%)',
    accept: 'xlsx',
    maxFiles: 10,
    options: [
      {
        key: 'pageOrientation',
        label: 'Orientación:',
        type: 'select',
        default: 'landscape',
        values: [
          { value: 'portrait', label: 'Vertical' },
          { value: 'landscape', label: 'Horizontal' }
        ]
      }
    ]
  },
  'web-a-pdf': {
    title: 'Web a PDF',
    subtitle: 'Convierte páginas web HTML a PDF copiando la URL',
    icon: '🌐',
    gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
    accept: 'url',
    maxFiles: 1,
    options: [
      {
        key: 'url',
        label: 'URL de la página web:',
        type: 'text',
        placeholder: 'https://ejemplo.com'
      },
      {
        key: 'includeImages',
        label: 'Incluir imágenes',
        type: 'checkbox',
        default: true
      }
    ]
  },
  'imagenes-a-pdf': {
    title: 'Imágenes a PDF',
    subtitle: 'Convierte imágenes JPG a PDF con orientación personalizable',
    icon: '🖼️',
    gradient: 'linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%)',
    accept: 'image',
    maxFiles: 50,
    options: [
      {
        key: 'imageQuality',
        label: 'Calidad de imagen:',
        type: 'select',
        default: 'high',
        values: [
          { value: 'standard', label: 'Estándar' },
          { value: 'high', label: 'Alta' },
          { value: 'maximum', label: 'Máxima' }
        ]
      },
      {
        key: 'pageSize',
        label: 'Tamaño de página:',
        type: 'select',
        default: 'auto',
        values: [
          { value: 'auto', label: 'Automático' },
          { value: 'a4', label: 'A4' },
          { value: 'letter', label: 'Carta' }
        ]
      }
    ]
  },

  // Convertir desde PDF
  'pdf-a-word': {
    title: 'PDF a Word',
    subtitle: 'Convierte PDFs a documentos DOCX completamente editables',
    icon: '📝',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
    accept: 'pdf',
    maxFiles: 10,
    options: [
      {
        key: 'preserveFormatting',
        label: 'Preservar formato',
        type: 'checkbox',
        default: true
      }
    ]
  },
  'pdf-a-powerpoint': {
    title: 'PDF a PowerPoint',
    subtitle: 'Transforma PDFs a presentaciones PPTX editables',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: []
  },
  'pdf-a-excel': {
    title: 'PDF a Excel',
    subtitle: 'Extrae datos tabulares de PDF a hojas de cálculo Excel',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: []
  },
  'pdf-a-imagenes': {
    title: 'PDF a Imágenes',
    subtitle: 'Extrae todas las imágenes o convierte cada página a JPG',
    icon: '🖼️',
    gradient: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: [
      {
        key: 'imageFormat',
        label: 'Formato de imagen:',
        type: 'select',
        default: 'jpg',
        values: [
          { value: 'jpg', label: 'JPG' },
          { value: 'png', label: 'PNG' },
          { value: 'gif', label: 'GIF' }
        ]
      }
    ]
  },

  // Editar y Personalizar
  'editor-avanzado': {
    title: 'Editor Avanzado PDF',
    subtitle: 'Añade texto, imágenes, formas y anotaciones personalizadas',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'addText',
        label: 'Añadir texto',
        type: 'checkbox',
        default: true
      },
      {
        key: 'addImages',
        label: 'Añadir imágenes',
        type: 'checkbox',
        default: true
      },
      {
        key: 'addShapes',
        label: 'Añadir formas',
        type: 'checkbox',
        default: false
      }
    ]
  },
  'firmar-documento': {
    title: 'Firmar Documento PDF',
    subtitle: 'Aplica firmas electrónicas propias o solicita firmas de terceros',
    icon: '✍️',
    gradient: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'signatureType',
        label: 'Tipo de firma:',
        type: 'select',
        default: 'digital',
        values: [
          { value: 'digital', label: 'Firma digital' },
          { value: 'electronic', label: 'Firma electrónica' },
          { value: 'handwritten', label: 'Firma manuscrita' }
        ]
      }
    ]
  },
  'marca-de-agua': {
    title: 'Marca de Agua PDF',
    subtitle: 'Inserta imágenes o texto con posición y transparencia personalizables',
    icon: '💧',
    gradient: 'linear-gradient(135deg, #009688 0%, #00695c 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'watermarkType',
        label: 'Tipo de marca:',
        type: 'select',
        default: 'text',
        values: [
          { value: 'text', label: 'Texto' },
          { value: 'image', label: 'Imagen' }
        ]
      },
      {
        key: 'position',
        label: 'Posición:',
        type: 'select',
        default: 'center',
        values: [
          { value: 'center', label: 'Centro' },
          { value: 'top-left', label: 'Superior izquierda' },
          { value: 'top-right', label: 'Superior derecha' },
          { value: 'bottom-left', label: 'Inferior izquierda' },
          { value: 'bottom-right', label: 'Inferior derecha' }
        ]
      }
    ]
  },
  'rotar-paginas': {
    title: 'Rotar Páginas PDF',
    subtitle: 'Rota documentos individuales o múltiples archivos simultáneamente',
    icon: '🔄',
    gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: [
      {
        key: 'rotation',
        label: 'Rotación:',
        type: 'select',
        default: '90',
        values: [
          { value: '90', label: '90° (derecha)' },
          { value: '180', label: '180° (invertido)' },
          { value: '270', label: '270° (izquierda)' }
        ]
      }
    ]
  },

  // Gestión y Seguridad
  'proteger-contrasena': {
    title: 'Proteger con Contraseña',
    subtitle: 'Encripta archivos PDF para evitar accesos no autorizados',
    icon: '🔐',
    gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'password',
        label: 'Contraseña:',
        type: 'password',
        placeholder: 'Ingresa una contraseña segura'
      },
      {
        key: 'encryptionLevel',
        label: 'Nivel de encriptación:',
        type: 'select',
        default: 'high',
        values: [
          { value: 'low', label: 'Básico (128-bit)' },
          { value: 'medium', label: 'Medio (256-bit)' },
          { value: 'high', label: 'Alto (AES-256)' }
        ]
      }
    ]
  },
  'desbloquear-pdf': {
    title: 'Desbloquear PDF',
    subtitle: 'Elimina contraseñas de PDF protegidos para uso libre',
    icon: '🔓',
    gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'password',
        label: 'Contraseña actual:',
        type: 'password',
        placeholder: 'Ingresa la contraseña del PDF'
      }
    ]
  },
  'numeracion-paginas': {
    title: 'Numeración de Páginas',
    subtitle: 'Añade números de página con posición y formato personalizable',
    icon: '#️⃣',
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'position',
        label: 'Posición:',
        type: 'select',
        default: 'bottom-center',
        values: [
          { value: 'top-left', label: 'Superior izquierda' },
          { value: 'top-center', label: 'Superior centro' },
          { value: 'top-right', label: 'Superior derecha' },
          { value: 'bottom-left', label: 'Inferior izquierda' },
          { value: 'bottom-center', label: 'Inferior centro' },
          { value: 'bottom-right', label: 'Inferior derecha' }
        ]
      },
      {
        key: 'format',
        label: 'Formato:',
        type: 'select',
        default: 'number',
        values: [
          { value: 'number', label: 'Número simple (1, 2, 3...)' },
          { value: 'page-x', label: 'Página X (Página 1, Página 2...)' },
          { value: 'x-of-y', label: 'X de Y (1 de 10, 2 de 10...)' }
        ]
      }
    ]
  },
  'recortar-documento': {
    title: 'Recortar Documento PDF',
    subtitle: 'Elimina márgenes o selecciona áreas específicas para modificar',
    icon: '✂️',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'cropMode',
        label: 'Modo de recorte:',
        type: 'select',
        default: 'margins',
        values: [
          { value: 'margins', label: 'Eliminar márgenes' },
          { value: 'custom', label: 'Área personalizada' },
          { value: 'page-size', label: 'Ajustar a tamaño de página' }
        ]
      }
    ]
  },

  // Procesamiento Especializado
  'reconocimiento-texto': {
    title: 'Reconocimiento de Texto OCR',
    subtitle: 'Convierte PDF escaneados en documentos con texto seleccionable',
    icon: '👁️',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: [
      {
        key: 'language',
        label: 'Idioma:',
        type: 'select',
        default: 'es',
        values: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'fr', label: 'Francés' },
          { value: 'de', label: 'Alemán' }
        ]
      },
      {
        key: 'accuracy',
        label: 'Precisión:',
        type: 'select',
        default: 'high',
        values: [
          { value: 'standard', label: 'Estándar (más rápido)' },
          { value: 'high', label: 'Alta (mejor calidad)' },
          { value: 'maximum', label: 'Máxima (mejor resultado)' }
        ]
      }
    ]
  },
  'escaner-movil': {
    title: 'Escáner Móvil PDF',
    subtitle: 'Captura documentos desde móvil y los envía instantáneamente',
    icon: '📱',
    gradient: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
    accept: 'image',
    maxFiles: 10,
    options: [
      {
        key: 'enhancement',
        label: 'Mejora automática:',
        type: 'checkbox',
        default: true
      },
      {
        key: 'deskew',
        label: 'Corregir inclinación',
        type: 'checkbox',
        default: true
      }
    ]
  },
  'comparar-documentos': {
    title: 'Comparar Documentos PDF',
    subtitle: 'Compara dos archivos simultáneamente para identificar diferencias',
    icon: '⚖️',
    gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    accept: 'pdf',
    maxFiles: 2,
    options: [
      {
        key: 'comparisonType',
        label: 'Tipo de comparación:',
        type: 'select',
        default: 'content',
        values: [
          { value: 'content', label: 'Contenido de texto' },
          { value: 'visual', label: 'Diferencias visuales' },
          { value: 'both', label: 'Contenido y visual' }
        ]
      }
    ]
  },
  'censurar-informacion': {
    title: 'Censurar Información PDF',
    subtitle: 'Elimina permanentemente texto y gráficos sensibles',
    icon: '🚫',
    gradient: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
    accept: 'pdf',
    maxFiles: 1,
    options: [
      {
        key: 'censoringMethod',
        label: 'Método de censura:',
        type: 'select',
        default: 'black-box',
        values: [
          { value: 'black-box', label: 'Caja negra' },
          { value: 'white-box', label: 'Caja blanca' },
          { value: 'blur', label: 'Desenfoque' },
          { value: 'remove', label: 'Eliminar completamente' }
        ]
      }
    ]
  },

  // Análisis con IA
  'analisis-inteligente': {
    title: 'Análisis Inteligente con IA',
    subtitle: 'Analiza documentos con IA para extraer insights y métricas avanzadas',
    icon: '🧠',
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: [
      {
        key: 'analysisType',
        label: 'Tipo de análisis:',
        type: 'select',
        default: 'comprehensive',
        values: [
          { value: 'summary', label: 'Resumen ejecutivo' },
          { value: 'keywords', label: 'Palabras clave' },
          { value: 'sentiment', label: 'Análisis de sentimiento' },
          { value: 'comprehensive', label: 'Análisis completo' }
        ]
      }
    ]
  },
  'ocr-inteligente': {
    title: 'OCR Inteligente con IA',
    subtitle: 'Reconocimiento óptico con IA para máxima precisión en texto',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    accept: 'image',
    maxFiles: 10,
    options: [
      {
        key: 'aiEnhancement',
        label: 'Mejora con IA:',
        type: 'checkbox',
        default: true
      },
      {
        key: 'handwriting',
        label: 'Reconocer escritura a mano',
        type: 'checkbox',
        default: false
      }
    ]
  },
  'extraccion-inteligente': {
    title: 'Extracción Inteligente con IA',
    subtitle: 'Extrae datos específicos usando inteligencia artificial',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    accept: 'pdf',
    maxFiles: 5,
    options: [
      {
        key: 'dataType',
        label: 'Tipo de datos:',
        type: 'select',
        default: 'tables',
        values: [
          { value: 'tables', label: 'Tablas y datos estructurados' },
          { value: 'forms', label: 'Formularios y campos' },
          { value: 'signatures', label: 'Firmas y sellos' },
          { value: 'custom', label: 'Datos personalizados' }
        ]
      }
    ]
  }
};

// Componente generador dinámico
const PDFToolGenerator = ({ toolId }) => {
  const config = TOOL_CONFIGS[toolId];
  
  if (!config) {
    return (
      <div className="pdf-tool-container">
        <div className="pdf-tool-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="header-icon">❓</div>
          <div className="header-content">
            <h1>Herramienta no encontrada</h1>
            <p>La herramienta solicitada no está disponible</p>
          </div>
        </div>
      </div>
    );
  }

  const toolConfig = {
    accept: config.accept,
    minFiles: 1,
    maxFiles: config.maxFiles || 1,
    actionButton: config.title,
    successMessage: `${config.title} completado correctamente`,
    errorMessage: `No se pudo completar ${config.title}`,
    options: config.options
  };

  const handleProcess = async (files, config) => {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const outputExtension = config.accept === 'pdf' ? 'pdf' : 
                           config.accept === 'docx' ? 'docx' :
                           config.accept === 'pptx' ? 'pptx' :
                           config.accept === 'xlsx' ? 'xlsx' : 'pdf';
    
    for (const file of files) {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const processedFile = new Blob([`Archivo procesado simulado - ${fileName}`], { 
        type: `application/${outputExtension}` 
      });
      const url = URL.createObjectURL(processedFile);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_procesado.${outputExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <PDFToolBase
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      gradient={config.gradient}
      toolConfig={toolConfig}
      onProcess={handleProcess}
    />
  );
};

export default PDFToolGenerator;