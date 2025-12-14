import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebarSwipe } from '../../hooks/useSwipeGestures';

// ✅ CORREGIDO: Breakpoint consistente
const MOBILE_BREAKPOINT = 768;

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    'document-processing': true,
    'advanced-tools': false,
    'settings-export': false
  });

  // ✅ CORREGIDO: Detectar dispositivo con listener para resize
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Verificar inicialmente
    checkIsMobile();

    // Agregar listener para resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const quickAccessItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: '🏠', path: '/' }
  ];

  // Menú simplificado para móvil (solo funciones esenciales)
  const mobileCategories = [
    {
      id: 'document-processing',
      title: '📄 Documentos',
      items: [
        { id: 'history', label: 'Historial', icon: '📋', path: '/historial-analisis' },
        { id: 'batch-analysis', label: 'Análisis Múltiple', icon: '📦', path: '/procesamiento-batch' }
      ]
    },
    {
      id: 'advanced-tools',
      title: '⚡ IA & Tools',
      items: [
        { id: 'ai-config', label: 'Configuración IA', icon: '🤖', path: '/inteligencia-artificial' },
        { id: 'ai-metrics', label: 'Métricas', icon: '📊', path: '/metricas-ia' }
      ]
    },
    {
      id: 'settings-export',
      title: '⚙️ Soporte',
      items: [
        { id: 'settings', label: 'Ajustes', icon: '⚙️', path: '/configuracion' },
        { id: 'help', label: 'Ayuda', icon: '❓', path: '/ayuda-soporte' }
      ]
    }
  ];

  // Menú completo para desktop
  const desktopCategories = [
    {
      id: 'document-processing',
      title: '📄 Procesamiento de Documentos',
      icon: null,
      items: [
        { id: 'history', label: 'Historial de Análisis', icon: '📋', path: '/historial-analisis' },
        { id: 'batch-analysis', label: 'Análisis Múltiple', icon: '📦', path: '/procesamiento-batch' },
        { id: 'batch-tools', label: 'Herramientas Batch', icon: '🛠️', path: '/herramientas-batch' }
      ]
    },
    {
      id: 'advanced-tools',
      title: '⚡ Herramientas Avanzadas',
      icon: null,
      items: [
        { id: 'ai-config', label: 'Configuración de IA', icon: '🤖', path: '/inteligencia-artificial' },
        { id: 'ai-metrics', label: 'Métricas de IA', icon: '📊', path: '/metricas-ia' },
        { id: 'model-comparison', label: 'Comparación de Modelos', icon: '📈', path: '/comparacion-modelos' },
        { id: 'export-tools', label: 'Exportación Avanzada', icon: '💾', path: '/exportacion-avanzada' },
        { id: 'statistics', label: 'Estadísticas', icon: '📉', path: '/estadisticas' }
      ]
    },
    {
      id: 'settings-export',
      title: '⚙️ Configuración & Soporte',
      icon: null,
      items: [
        { id: 'settings', label: 'Configuración', icon: '⚙️', path: '/configuracion' },
        { id: 'help', label: 'Ayuda y Soporte', icon: '❓', path: '/ayuda-soporte' }
      ]
    }
  ];

  // ✅ CORREGIDO: Usar isMobile en lugar de window.innerWidth
  const mainCategories = isMobile ? mobileCategories : desktopCategories;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    // ✅ CORREGIDO: Usar isMobile en lugar de window.innerWidth
    if (isMobile) {
      onToggle();
    }
  };

  const filteredQuickAccess = quickAccessItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = mainCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0 || !searchTerm);

  // ✅ CORREGIDO: Eliminar variable no utilizada
  // const [hoveredSection, setHoveredSection] = useState(null);

  // ✅ CORREGIDO: Solo activar gestos en móvil para evitar conflictos
  useSidebarSwipe(isMobile ? onToggle : null, isMobile ? onToggle : null);

  return (
    <>
      <div className={`premium-sidebar ${isOpen ? 'open' : ''}`} id="sidebar-menu">
        <div className="sidebar-content">
          {/* ✅ CORREGIDO: Sidebar Header con estilos consistentes */}
          <div className="sidebar-header-premium">
            <div className="sidebar-logo-premium">
              <div className="logo-icon-premium">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                  <path d="M14 2V8H20"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path dName="10 9H9H8"/>
                </svg>
              </div>
              <div className="logo-text-premium">
                <span className="logo-title-premium">Editor PDF</span>
                <span className="logo-version-premium">v2.0 Pro</span>
              </div>
            </div>
            
            {/* ✅ CORREGIDO: Solo mostrar el botón de cierre en dispositivos móviles */}
            {isMobile && (
              <button
                className="sidebar-close-premium"
                onClick={onToggle}
                aria-label="Cerrar menú lateral"
                aria-expanded={isOpen}
                type="button"
              >
                <div className="hamburger-lines">
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </div>
              </button>
            )}
          </div>

          {/* ✅ CORREGIDO: Quick Access con estilos consistentes */}
          <div className="quick-access-section">
            <div className="quick-access-title">Acceso Rápido</div>
            <div className="quick-access-items">
              {filteredQuickAccess.map((item) => (
                <button
                  key={item.id}
                  className={`quick-access-item ${isMobile ? 'mobile-touch-target' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  aria-label={`Ir a ${item.label}`}
                  type="button"
                >
                  <span className="quick-access-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ✅ CORREGIDO: Search Bar eliminada completamente */}

          {/* ✅ CORREGIDO: Main Categories con estilos consistentes */}
          <nav className="sidebar-nav-premium">
            <div className="nav-sections-premium">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="nav-section-premium"
                >
                  <button
                    className={`section-header-premium ${isMobile ? 'mobile-touch-target' : ''}`}
                    onClick={() => toggleSection(category.id)}
                    aria-expanded={expandedSections[category.id]}
                    aria-controls={`section-${category.id}`}
                    type="button"
                  >
                    <div className="section-info-premium">
                      <span className="section-title-premium">{category.title}</span>
                    </div>
                    <div className={`section-toggle-premium ${expandedSections[category.id] ? 'expanded' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    className={`section-items-premium ${expandedSections[category.id] ? 'expanded' : ''}`}
                    id={`section-${category.id}`}
                    role="region"
                    aria-labelledby={`header-${category.id}`}
                  >
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        className={`nav-item-premium ${isMobile ? 'mobile-touch-target' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                        aria-label={`Ir a ${item.label}`}
                        type="button"
                      >
                        <div className="nav-item-content-premium">
                          <div className="nav-item-icon-premium">{item.icon}</div>
                          <span className="nav-item-label-premium">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* ✅ CORREGIDO: Sidebar Footer */}
          <div className="sidebar-footer-premium">
            <div className="sidebar-info-inline-premium">
              <div className="info-item-inline-premium">
                <span className="info-label-premium">Versión</span>
                <span className="info-value-premium">2.0.1</span>
              </div>
              <div className="info-separator-premium">•</div>
              <div className="info-item-inline-premium">
                <span className="info-label-premium">API Status</span>
                <span className="info-value-premium success">Online</span>
              </div>
            </div>
            
            <div className="status-indicator-inline-premium">
              <div className="status-dot-premium online"></div>
              <span className="status-text-premium">Sistemas operativos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CORREGIDO: Mobile Overlay con mejor accesibilidad */}
      {isOpen && (
        <div
          className="mobile-overlay-premium"
          onClick={onToggle}
          aria-hidden="true"
          role="button"
          tabIndex={-1}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
