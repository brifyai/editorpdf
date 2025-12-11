import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSweetAlert } from '../hooks/useSweetAlert';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showInfo } = useSweetAlert();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const toolCategories = [
    {
      id: 'combine-organize',
      title: "Combinar y Organizar",
      description: "Gestiona múltiples documentos PDF de forma eficiente",
      icon: "📚",
      tools: [
        {
          id: 'merge-pdf',
          name: 'Unir Documentos',
          description: 'Combina varios PDFs en un solo archivo manteniendo el orden deseado',
          icon: '🔗',
          color: 'from-blue-500 to-blue-600'
        },
        {
          id: 'split-pdf',
          name: 'Separar Documentos',
          description: 'Extrae páginas específicas o divide cada página en archivos independientes',
          icon: '✂️',
          color: 'from-green-500 to-green-600'
        },
        {
          id: 'organize-pages',
          name: 'Organizar Páginas',
          description: 'Reordena, elimina o añade páginas según tus necesidades',
          icon: '📋',
          color: 'from-purple-500 to-purple-600'
        }
      ]
    },
    {
      id: 'optimize-compress',
      title: "Optimizar y Comprimir",
      description: "Mejora la calidad y reduce el tamaño de tus documentos",
      icon: "⚡",
      tools: [
        {
          id: 'compress-pdf',
          name: 'Optimizar Tamaño',
          description: 'Reduce el peso del documento manteniendo la máxima calidad posible',
          icon: '🗜️',
          color: 'from-orange-500 to-orange-600'
        },
        {
          id: 'repair-pdf',
          name: 'Restaurar Documento',
          description: 'Repara archivos PDF dañados y recupera datos perdidos',
          icon: '🔧',
          color: 'from-red-500 to-red-600'
        }
      ]
    },
    {
      id: 'convert-to-pdf',
      title: "Convertir a PDF",
      description: "Transforma otros formatos al estándar PDF",
      icon: "➡️",
      tools: [
        {
          id: 'word-to-pdf',
          name: 'Word a PDF',
          description: 'Convierte documentos DOCX a PDF manteniendo formato y calidad',
          icon: '📄',
          color: 'from-indigo-500 to-indigo-600'
        },
        {
          id: 'ppt-to-pdf',
          name: 'PowerPoint a PDF',
          description: 'Transforma presentaciones PPTX a PDF de alta calidad',
          icon: '📊',
          color: 'from-pink-500 to-pink-600'
        },
        {
          id: 'excel-to-pdf',
          name: 'Excel a PDF',
          description: 'Convierte hojas de cálculo a PDF con columnas ajustadas',
          icon: '📈',
          color: 'from-teal-500 to-teal-600'
        },
        {
          id: 'html-to-pdf',
          name: 'Web a PDF',
          description: 'Convierte páginas web HTML a PDF copiando la URL',
          icon: '🌐',
          color: 'from-cyan-500 to-cyan-600'
        },
        {
          id: 'image-to-pdf',
          name: 'Imágenes a PDF',
          description: 'Convierte imágenes JPG a PDF con orientación personalizable',
          icon: '🖼️',
          color: 'from-yellow-500 to-yellow-600'
        }
      ]
    },
    {
      id: 'convert-from-pdf',
      title: "Convertir desde PDF",
      description: "Extrae y convierte contenido de documentos PDF",
      icon: "⬅️",
      tools: [
        {
          id: 'pdf-to-word',
          name: 'PDF a Word',
          description: 'Convierte PDFs a documentos DOCX completamente editables',
          icon: '📝',
          color: 'from-blue-600 to-blue-700'
        },
        {
          id: 'pdf-to-ppt',
          name: 'PDF a PowerPoint',
          description: 'Transforma PDFs a presentaciones PPTX editables',
          icon: '🎯',
          color: 'from-purple-600 to-purple-700'
        },
        {
          id: 'pdf-to-excel',
          name: 'PDF a Excel',
          description: 'Extrae datos tabulares de PDF a hojas de cálculo Excel',
          icon: '📊',
          color: 'from-green-600 to-green-700'
        },
        {
          id: 'pdf-to-images',
          name: 'PDF a Imágenes',
          description: 'Extrae todas las imágenes o convierte cada página a JPG',
          icon: '🖼️',
          color: 'from-orange-600 to-orange-700'
        }
      ]
    },
    {
      id: 'edit-customize',
      title: "Editar y Personalizar",
      description: "Modifica y personaliza tus documentos PDF",
      icon: "✏️",
      tools: [
        {
          id: 'edit-pdf',
          name: 'Editor Avanzado',
          description: 'Añade texto, imágenes, formas y anotaciones personalizadas',
          icon: '🎨',
          color: 'from-pink-600 to-pink-700'
        },
        {
          id: 'sign-pdf',
          name: 'Firmar Documento',
          description: 'Aplica firmas electrónicas propias o solicita firmas de terceros',
          icon: '✍️',
          color: 'from-indigo-600 to-indigo-700'
        },
        {
          id: 'watermark',
          name: 'Marca de Agua',
          description: 'Inserta imágenes o texto con posición y transparencia personalizables',
          icon: '💧',
          color: 'from-teal-600 to-teal-700'
        },
        {
          id: 'rotate-pdf',
          name: 'Rotar Páginas',
          description: 'Rota documentos individuales o múltiples archivos simultáneamente',
          icon: '🔄',
          color: 'from-cyan-600 to-cyan-700'
        }
      ]
    },
    {
      id: 'security-management',
      title: "Gestión y Seguridad",
      description: "Controla el acceso y protección de tus documentos",
      icon: "🔒",
      tools: [
        {
          id: 'protect-pdf',
          name: 'Proteger con Contraseña',
          description: 'Encripta archivos PDF para evitar accesos no autorizados',
          icon: '🔐',
          color: 'from-red-600 to-red-700'
        },
        {
          id: 'unlock-pdf',
          name: 'Desbloquear PDF',
          description: 'Elimina contraseñas de PDF protegidos para uso libre',
          icon: '🔓',
          color: 'from-yellow-600 to-yellow-700'
        },
        {
          id: 'page-numbers',
          name: 'Numeración de Páginas',
          description: 'Añade números de página con posición y formato personalizable',
          icon: '#️⃣',
          color: 'from-purple-600 to-purple-700'
        },
        {
          id: 'crop-pdf',
          name: 'Recortar Documento',
          description: 'Elimina márgenes o selecciona áreas específicas para modificar',
          icon: '✂️',
          color: 'from-green-600 to-green-700'
        }
      ]
    },
    {
      id: 'specialized-processing',
      title: "Procesamiento Especializado",
      description: "Herramientas avanzadas para necesidades específicas",
      icon: "🔬",
      tools: [
        {
          id: 'ocr-pdf',
          name: 'Reconocimiento de Texto',
          description: 'Convierte PDF escaneados en documentos con texto seleccionable',
          icon: '👁️',
          color: 'from-blue-700 to-blue-800'
        },
        {
          id: 'scan-to-pdf',
          name: 'Escáner Móvil',
          description: 'Captura documentos desde móvil y los envía instantáneamente',
          icon: '📱',
          color: 'from-pink-700 to-pink-800'
        },
        {
          id: 'compare-pdf',
          name: 'Comparar Documentos',
          description: 'Compara dos archivos simultáneamente para identificar diferencias',
          icon: '⚖️',
          color: 'from-orange-700 to-orange-800'
        },
        {
          id: 'censor-pdf',
          name: 'Censurar Información',
          description: 'Elimina permanentemente texto y gráficos sensibles',
          icon: '🚫',
          color: 'from-red-700 to-red-800'
        }
      ]
    },
    {
      id: 'ai-analysis',
      title: "Análisis con Inteligencia Artificial",
      description: "Procesamiento inteligente de documentos con IA",
      icon: "🤖",
      tools: [
        {
          id: 'ai-analysis',
          name: 'Análisis Inteligente',
          description: 'Analiza documentos con IA para extraer insights y métricas avanzadas',
          icon: '🧠',
          color: 'from-violet-500 to-violet-600'
        },
        {
          id: 'ai-ocr',
          name: 'OCR Inteligente',
          description: 'Reconocimiento óptico con IA para máxima precisión en texto',
          icon: '🔍',
          color: 'from-emerald-500 to-emerald-600'
        },
        {
          id: 'ai-extract',
          name: 'Extracción Inteligente',
          description: 'Extrae datos específicos usando inteligencia artificial',
          icon: '🎯',
          color: 'from-amber-500 to-amber-600'
        }
      ]
    }
  ];

  const handleCategoryClick = (categoryId) => {
    console.log('Categoría seleccionada:', categoryId);
    
    if (selectedCategory === categoryId) {
      // Si ya está seleccionada, deseleccionar y mostrar todas
      setSelectedCategory(null);
    } else {
      // Si no está seleccionada, seleccionar para filtrar
      setSelectedCategory(categoryId);
    }
  };

  const handleToolClick = (toolId) => {
    console.log('Herramienta seleccionada:', toolId);
    
    // Mapeo de herramientas a URLs específicas únicas en español
    const toolRoutes = {
      // Combinar y Organizar
      'merge-pdf': '/herramientas/unir-documentos',
      'split-pdf': '/herramientas/separar-documentos',
      'organize-pages': '/herramientas/organizar-paginas',
      
      // Optimizar y Comprimir
      'compress-pdf': '/herramientas/optimizar-tamano',
      'repair-pdf': '/herramientas/restaurar-documento',
      
      // Convertir a PDF
      'word-to-pdf': '/herramientas/word-a-pdf',
      'ppt-to-pdf': '/herramientas/powerpoint-a-pdf',
      'excel-to-pdf': '/herramientas/excel-a-pdf',
      'html-to-pdf': '/herramientas/web-a-pdf',
      'image-to-pdf': '/herramientas/imagenes-a-pdf',
      
      // Convertir desde PDF
      'pdf-to-word': '/herramientas/pdf-a-word',
      'pdf-to-ppt': '/herramientas/pdf-a-powerpoint',
      'pdf-to-excel': '/herramientas/pdf-a-excel',
      'pdf-to-images': '/herramientas/pdf-a-imagenes',
      
      // Editar y Personalizar
      'edit-pdf': '/herramientas/editor-avanzado',
      'sign-pdf': '/herramientas/firmar-documento',
      'watermark': '/herramientas/marca-de-agua',
      'rotate-pdf': '/herramientas/rotar-paginas',
      
      // Gestión y Seguridad
      'protect-pdf': '/herramientas/proteger-contrasena',
      'unlock-pdf': '/herramientas/desbloquear-pdf',
      'page-numbers': '/herramientas/numeracion-paginas',
      'crop-pdf': '/herramientas/recortar-documento',
      
      // Procesamiento Especializado
      'ocr-pdf': '/herramientas/reconocimiento-texto',
      'scan-to-pdf': '/herramientas/escaner-movil',
      'compare-pdf': '/herramientas/comparar-documentos',
      'censor-pdf': '/herramientas/censurar-informacion',
      
      // Análisis con IA
      'ai-analysis': '/herramientas/analisis-inteligente',
      'ai-ocr': '/herramientas/ocr-inteligente',
      'ai-extract': '/herramientas/extraccion-inteligente'
    };
    
    const route = toolRoutes[toolId];
    
    if (route) {
      navigate(route);
    } else {
      // Si no hay ruta específica, mostrar mensaje informativo
      showInfo(
        'Funcionalidad en Desarrollo',
        `La herramienta "${toolId}" estará disponible próximamente. Redirigiendo a la sección más relacionada.`
      );
      navigate('/documents'); // Redirigir a documentos por defecto
    }
  };

  const displayedCategories = selectedCategory
    ? toolCategories.filter(category => category.id === selectedCategory)
    : toolCategories;

  return (
    <div className="dashboard-container">
      {/* Navegación Rápida de Categorías */}
      <div className="category-navigation">
        <div className="nav-buttons-container">
          <button className="nav-category-btn" onClick={() => handleCategoryClick('combine-organize')}>
            Combinar y Organizar
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('optimize-compress')}>
            Optimizar y Comprimir
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('convert-to-pdf')}>
            Convertir a PDF
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('convert-from-pdf')}>
            Convertir desde PDF
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('edit-customize')}>
            Editar y Personalizar
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('security-management')}>
            Gestión y Seguridad
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('specialized-processing')}>
            Procesamiento Especializado
          </button>
          <button className="nav-category-btn" onClick={() => handleCategoryClick('ai-analysis')}>
            Análisis con Inteligencia Artificial
          </button>
        </div>
      </div>

      {/* Grid de Herramientas */}
      <div className="dashboard-content">
        <div className="tools-grid-compact-all">
          {displayedCategories.map((category, categoryIndex) =>
            category.tools.map((tool, toolIndex) => (
              <div
                key={`${categoryIndex}-${toolIndex}`}
                className="tool-card-compact"
                onClick={() => handleToolClick(tool.id)}
              >
                <div className="tool-card-content-compact">
                  <div className="tool-icon-compact">{tool.icon}</div>
                  <div className="tool-info-compact">
                    <h3 className="tool-name-compact">{tool.name}</h3>
                    <p className="tool-description-compact">{tool.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer del Dashboard */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>EditorPDF Pro</h3>
            <p>La solución completa para el manejo profesional de documentos PDF</p>
          </div>
          <div className="footer-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Procesamiento Local</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Sin Límites de Tamaño</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Privacidad Garantizada</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Inteligencia Artificial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;