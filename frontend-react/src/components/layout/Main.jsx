import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Memoizar el componente Main para evitar re-renders innecesarios
const Main = React.memo(({ children, sidebarOpen }) => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRate: 0,
    activeModels: 0,
    averageResponseTime: 0
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Page configuration
  const pageConfig = {
    '/documents': {
      title: 'Análisis de Documentos',
      subtitle: 'Analiza PDFs y extrae información inteligente',
      icon: '',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    '/ocr': {
      title: 'OCR y Reconocimiento',
      subtitle: 'Convierte imágenes en texto editable',
      icon: '',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    '/batch': {
      title: 'Procesamiento Batch',
      subtitle: 'Procesa múltiples documentos simultáneamente',
      icon: '',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    '/ai': {
      title: 'Inteligencia Artificial',
      subtitle: 'Modelos avanzados de análisis',
      icon: '',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    '/export': {
      title: 'Exportación',
      subtitle: 'Exporta tus resultados en múltiples formatos',
      icon: '',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    '/settings': {
      title: 'Configuración',
      subtitle: 'Personaliza tu experiencia',
      icon: '',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  };

  const currentPage = pageConfig[location.pathname] || {
    title: 'Editor PDF',
    subtitle: 'Plataforma de análisis de documentos inteligente',
    icon: '',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Breadcrumbs configuration
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [
      { label: 'Inicio', path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const segmentConfig = pageConfig[currentPath];
      if (segmentConfig) {
        breadcrumbs.push({
          label: segmentConfig.title.split(' ')[0],
          path: currentPath
        });
      }
    });

    return breadcrumbs;
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

  // Memoizar la función de carga de métricas para evitar re-creaciones
  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/metrics`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setMetrics({
          totalRequests: data.data.totalRequests || 0,
          successRate: data.data.successRate || 0,
          activeModels: data.data.activeModels || 0,
          averageResponseTime: data.data.averageResponseTime || 0
        });
      }
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Cargar métricas reales desde el servidor (optimizado)
  useEffect(() => {
    let timeoutId;
    let isCancelled = false;

    // Carga inicial con debounce
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        loadMetrics();
      }
    }, 1000);
    
    // Actualizar métricas cada 5 minutos
    const interval = setInterval(() => {
      if (!isCancelled) {
        loadMetrics();
      }
    }, 300000);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [loadMetrics]);

  // Memoizar los valores de métricas para evitar re-renders
  const memoizedMetrics = useMemo(() => ({
    totalRequests: metrics.totalRequests,
    successRate: metrics.successRate,
    activeModels: metrics.activeModels,
    averageResponseTime: metrics.averageResponseTime,
    loading: loadingMetrics
  }), [metrics, loadingMetrics]);

  const breadcrumbs = getBreadcrumbs();

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
            {/* Breadcrumbs */}
            <nav className="breadcrumbs-premium">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="breadcrumb-item-premium">
                  {index > 0 && (
                    <svg className="breadcrumb-separator" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  )}
                  <button 
                    className={`breadcrumb-link ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                    onClick={() => {
                      if (index < breadcrumbs.length - 1) {
                        window.location.href = crumb.path;
                      }
                    }}
                  >
                    {crumb.label}
                  </button>
                </div>
              ))}
            </nav>

            {/* Page Title Section */}
            <div className="page-title-section-premium">
              
              <div className="page-title-content-premium">
                <h1 className="page-title-premium">{currentPage.title}</h1>
                <p className="page-subtitle-premium">{currentPage.subtitle}</p>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-premium">
                <button className="quick-action-btn-premium primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>Nuevo Análisis</span>
                </button>
                
                <button className="quick-action-btn-premium secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span>Importar</span>
                </button>
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
                  <div className="stat-change neutral">Real</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : `${memoizedMetrics.successRate.toFixed(1)}%`}
                  </div>
                  <div className="stat-label">Precisión</div>
                  <div className="stat-change neutral">Real</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : memoizedMetrics.activeModels}
                  </div>
                  <div className="stat-label">Modelos IA Activos</div>
                  <div className="stat-change neutral">Real</div>
                </div>
              </div>

              <div className="stat-card-premium">
                <div className="stat-content">
                  <div className="stat-value">
                    {memoizedMetrics.loading ? '...' : `${memoizedMetrics.averageResponseTime.toFixed(1)}s`}
                  </div>
                  <div className="stat-label">Tiempo Promedio</div>
                  <div className="stat-change neutral">Real</div>
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
