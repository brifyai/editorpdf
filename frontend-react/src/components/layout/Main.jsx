import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStatistics } from '../../contexts/StatisticsContext';

// Memoizar el componente Main para evitar re-renders innecesarios
const Main = React.memo(({ children, sidebarOpen }) => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const {
    documentsCount,
    successRate,
    activeModels,
    averageResponseTime,
    loading: loadingMetrics
  } = useStatistics();

  // Page configuration
  const pageConfig = {
    '/analisis-documentos': {
      title: 'Análisis de Documentos',
      subtitle: 'Analiza PDFs y extrae información inteligente',
      icon: '',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    '/herramientas/unir-documentos': {
      title: 'Unir Documentos PDF',
      subtitle: 'Combina varios archivos PDF en un solo documento',
      icon: '🔗',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    '/herramientas/separar-documentos': {
      title: 'Separar Documentos PDF',
      subtitle: 'Extrae páginas específicas o divide cada página en archivos independientes',
      icon: '✂️',
      gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
    },
    '/herramientas/organizar-paginas': {
      title: 'Organizar Páginas PDF',
      subtitle: 'Reordena, elimina o añade páginas según tus necesidades',
      icon: '📋',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)'
    },
    '/herramientas/optimizar-tamano': {
      title: 'Optimizar Tamaño PDF',
      subtitle: 'Reduce el peso del documento manteniendo la máxima calidad posible',
      icon: '🗜️',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
    },
    '/herramientas/restaurar-documento': {
      title: 'Restaurar Documento PDF',
      subtitle: 'Repara archivos PDF dañados y recupera datos perdidos',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
    },
    '/herramientas/word-a-pdf': {
      title: 'Word a PDF',
      subtitle: 'Convierte documentos DOCX a PDF manteniendo formato y calidad',
      icon: '📄',
      gradient: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)'
    },
    '/herramientas/powerpoint-a-pdf': {
      title: 'PowerPoint a PDF',
      subtitle: 'Transforma presentaciones PPTX a PDF de alta calidad',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)'
    },
    '/herramientas/excel-a-pdf': {
      title: 'Excel a PDF',
      subtitle: 'Convierte hojas de cálculo a PDF con columnas ajustadas',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #009688 0%, #00695c 100%)'
    },
    '/herramientas/web-a-pdf': {
      title: 'Web a PDF',
      subtitle: 'Convierte páginas web HTML a PDF copiando la URL',
      icon: '🌐',
      gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)'
    },
    '/herramientas/imagenes-a-pdf': {
      title: 'Imágenes a PDF',
      subtitle: 'Convierte imágenes JPG a PDF con orientación personalizable',
      icon: '🖼️',
      gradient: 'linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%)'
    },
    '/herramientas/pdf-a-word': {
      title: 'PDF a Word',
      subtitle: 'Convierte PDFs a documentos DOCX completamente editables',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)'
    },
    '/herramientas/pdf-a-powerpoint': {
      title: 'PDF a PowerPoint',
      subtitle: 'Transforma PDFs a presentaciones PPTX editables',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)'
    },
    '/herramientas/pdf-a-excel': {
      title: 'PDF a Excel',
      subtitle: 'Extrae datos tabulares de PDF a hojas de cálculo Excel',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)'
    },
    '/herramientas/pdf-a-imagenes': {
      title: 'PDF a Imágenes',
      subtitle: 'Extrae todas las imágenes o convierte cada página a JPG',
      icon: '🖼️',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)'
    },
    '/herramientas/editor-avanzado': {
      title: 'Editor Avanzado PDF',
      subtitle: 'Añade texto, imágenes, formas y anotaciones personalizadas',
      icon: '🎨',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)'
    },
    '/herramientas/firmar-documento': {
      title: 'Firmar Documento PDF',
      subtitle: 'Aplica firmas electrónicas propias o solicita firmas de terceros',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)'
    },
    '/herramientas/marca-de-agua': {
      title: 'Marca de Agua PDF',
      subtitle: 'Inserta imágenes o texto con posición y transparencia personalizables',
      icon: '💧',
      gradient: 'linear-gradient(135deg, #009688 0%, #00695c 100%)'
    },
    '/herramientas/rotar-paginas': {
      title: 'Rotar Páginas PDF',
      subtitle: 'Rota documentos individuales o múltiples archivos simultáneamente',
      icon: '🔄',
      gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)'
    },
    '/herramientas/proteger-contrasena': {
      title: 'Proteger con Contraseña',
      subtitle: 'Encripta archivos PDF para evitar accesos no autorizados',
      icon: '🔐',
      gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
    },
    '/herramientas/desbloquear-pdf': {
      title: 'Desbloquear PDF',
      subtitle: 'Elimina contraseñas de PDF protegidos para uso libre',
      icon: '🔓',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
    },
    '/herramientas/numeracion-paginas': {
      title: 'Numeración de Páginas',
      subtitle: 'Añade números de página con posición y formato personalizable',
      icon: '#️⃣',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)'
    },
    '/herramientas/recortar-documento': {
      title: 'Recortar Documento PDF',
      subtitle: 'Elimina márgenes o selecciona áreas específicas para modificar',
      icon: '✂️',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
    },
    '/herramientas/reconocimiento-texto': {
      title: 'Reconocimiento de Texto OCR',
      subtitle: 'Convierte PDF escaneados en documentos con texto seleccionable',
      icon: '👁️',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
    },
    '/herramientas/escaner-movil': {
      title: 'Escáner Móvil PDF',
      subtitle: 'Captura documentos desde móvil y los envía instantáneamente',
      icon: '📱',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)'
    },
    '/herramientas/comparar-documentos': {
      title: 'Comparar Documentos PDF',
      subtitle: 'Compara dos archivos simultáneamente para identificar diferencias',
      icon: '⚖️',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
    },
    '/herramientas/censurar-informacion': {
      title: 'Censurar Información PDF',
      subtitle: 'Elimina permanentemente texto y gráficos sensibles',
      icon: '🚫',
      gradient: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)'
    },
    '/herramientas/analisis-inteligente': {
      title: 'Análisis Inteligente con IA',
      subtitle: 'Analiza documentos con IA para extraer insights y métricas avanzadas',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
    },
    '/herramientas/ocr-inteligente': {
      title: 'OCR Inteligente con IA',
      subtitle: 'Reconocimiento óptico con IA para máxima precisión en texto',
      icon: '🔍',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
    },
    '/herramientas/extraccion-inteligente': {
      title: 'Extracción Inteligente con IA',
      subtitle: 'Extrae datos específicos usando inteligencia artificial',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
    },
    '/ocr-conversion': {
      title: 'OCR y Reconocimiento',
      subtitle: 'Convierte imágenes en texto editable',
      icon: '',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    '/procesamiento-batch': {
      title: 'Procesamiento Batch',
      subtitle: 'Procesa múltiples documentos simultáneamente',
      icon: '',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    '/inteligencia-artificial': {
      title: 'Inteligencia Artificial',
      subtitle: 'Modelos avanzados de análisis',
      icon: '',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    '/exportacion-avanzada': {
      title: 'Exportación',
      subtitle: 'Exporta tus resultados en múltiples formatos',
      icon: '',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    '/configuracion': {
      title: 'Configuración',
      subtitle: 'Personaliza tu experiencia',
      icon: '',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  };

  const currentPage = pageConfig[location.pathname] || {
    title: '¡Bienvenido a EditorPDF Pro! Camilo Alegria',
    subtitle: 'Plataforma de análisis de documentos inteligente',
    icon: '',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Scroll progress optimizado con useCallback
  const handleScroll = useCallback(() => {
    const mainElement = document.querySelector('.premium-main');
    if (!mainElement) return;

    const scrollTop = mainElement.scrollTop;
    const scrollHeight = mainElement.scrollHeight - mainElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector('.premium-main');
    if (!mainElement) return;

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Content visibility animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Memoizar los valores de métricas para evitar re-renders
  const memoizedMetrics = useMemo(() => ({
    totalRequests: documentsCount,
    successRate: successRate,
    activeModels: activeModels,
    averageResponseTime: averageResponseTime,
    loading: loadingMetrics
  }), [documentsCount, successRate, activeModels, averageResponseTime, loadingMetrics]);

  return (
    <>
      {/* Progress Bar */}
      <div className="progress-bar-premium">
        <div 
          className="progress-fill-premium"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Main Content Area */}
      <main className={`premium-main ${sidebarOpen ? 'sidebar-open' : ''} ${isContentVisible ? 'content-visible' : ''}`}>
        {/* Page Header */}
        <div className="page-header-premium">
          <div className="page-header-backdrop" style={{ background: currentPage.gradient }}></div>
          
          <div className="page-header-content">
            {/* Page Title Section */}
            <div className="page-title-section-premium">
              <div className="page-title-content-premium">
                <h1 className="page-title-premium">{currentPage.title}</h1>
                <p className="page-subtitle-premium">{currentPage.subtitle}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-container-premium">
              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : memoizedMetrics.totalRequests.toLocaleString()}
                  </div>
                  <div className="stat-label">Documentos Analizados</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : `${memoizedMetrics.successRate.toFixed(1)}%`}
                  </div>
                  <div className="stat-label">Precisión</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : memoizedMetrics.activeModels}
                  </div>
                  <div className="stat-label">Modelos IA Activos</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : `${memoizedMetrics.averageResponseTime.toFixed(1)}s`}
                  </div>
                  <div className="stat-label">Tiempo Promedio</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content-premium">
          <div className="content-wrapper-premium">
            {children}
          </div>
        </div>

        {/* Background Effects */}
        <div className="background-effects-premium">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
      </main>
    </>
  );
});

// Memoizar el componente para optimizar re-renders
export default React.memo(Main);
