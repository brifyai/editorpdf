import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    analysis: true,
    ocr: true,
    batch: false,
    ai: false,
    export: false,
    tools: false
  });

  const menuSections = [
    {
      id: 'analysis',
      title: 'Análisis de Documentos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2V8H20"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H9H8"/>
        </svg>
      ),
      items: [
        { id: 'documents', label: 'Análisis de PDFs', icon: '📄', path: '/documents', badge: null },
        { id: 'images', label: 'Análisis de Imágenes', icon: '🖼️', path: '/images', badge: null },
        { id: 'history', label: 'Historial de Análisis', icon: '📋', path: '/history', badge: null }
      ]
    },
    {
      id: 'ocr',
      title: 'OCR y Conversión',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      items: [
        { id: 'ocr-processing', label: 'OCR de Imágenes', icon: '🔍', path: '/ocr', badge: null },
        { id: 'pdf-conversion', label: 'Conversión a PDF', icon: '📄', path: '/ocr/convert', badge: null },
        { id: 'word-conversion', label: 'Conversión a Word', icon: '📝', path: '/word-convert', badge: null }
      ]
    },
    {
      id: 'batch',
      title: 'Procesamiento Batch',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <path d="M7.5 4.21L12 6.81l4.5-2.6"/>
          <path d="M12 22.81V12"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
          <path d="M12 8.52V22.81"/>
        </svg>
      ),
      items: [
        { id: 'batch-analysis', label: 'Análisis Múltiple', icon: '📦', path: '/batch', badge: null },
        { id: 'batch-tools', label: 'Herramientas Batch', icon: '🛠️', path: '/batch/tools', badge: null }
      ]
    },
    {
      id: 'ai',
      title: 'Inteligencia Artificial',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2z"/>
          <path d="M12 6a6 6 0 1 1-6 6"/>
          <path d="M12 22a10 10 0 0 1 0-20"/>
          <path d="M20 12a8 8 0 0 1-16 0"/>
        </svg>
      ),
      items: [
        { id: 'ai-config', label: 'Configuración de IA', icon: '⚙️', path: '/ai', badge: null },
        { id: 'ai-metrics', label: 'Métricas de IA', icon: '📊', path: '/ai/metrics', badge: null },
        { id: 'model-comparison', label: 'Comparación de Modelos', icon: '📈', path: '/ai/comparison', badge: null }
      ]
    },
    {
      id: 'export',
      title: 'Exportación',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <path d="M7 10l5 5 5-5"/>
          <path d="M12 15V3"/>
        </svg>
      ),
      items: [
        { id: 'export-tools', label: 'Exportación Avanzada', icon: '💾', path: '/export', badge: null },
        { id: 'statistics', label: 'Estadísticas', icon: '📊', path: '/statistics', badge: null }
      ]
    },
    {
      id: 'tools',
      title: 'Herramientas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      items: [
        { id: 'settings', label: 'Configuración', icon: '⚙️', path: '/settings', badge: null },
        { id: 'help', label: 'Ayuda y Soporte', icon: '❓', path: '/help', badge: null }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0 || !searchTerm);

  // Auto-expand sections on hover when sidebar is collapsed
  const [hoveredSection, setHoveredSection] = useState(null);

  return (
    <>
      <div className={`premium-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-backdrop-premium" onClick={onToggle}></div>
        
        <div className="sidebar-content">
          {/* Sidebar Header */}
          <div className="sidebar-header-premium">
            <div className="sidebar-logo-premium">
              <div className="logo-icon-premium">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                  <path d="M14 2V8H20"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H9H8"/>
                </svg>
              </div>
              <div className="logo-text-premium">
                <span className="logo-title-premium">Editor PDF</span>
                <span className="logo-version-premium">v2.0 Pro</span>
              </div>
            </div>
            
            <button
              className="sidebar-close-premium"
              onClick={onToggle}
              aria-label="Cerrar sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Dashboard Navigation */}
          <div className="sidebar-dashboard-nav">
            <button
              className="dashboard-nav-item"
              onClick={() => handleNavigation('/')}
            >
              <div className="dashboard-nav-icon">🏠</div>
              <span className="dashboard-nav-label">Dashboard Principal</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="sidebar-search-premium">
            <div className="search-container-premium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-sidebar-premium"
              />
              {searchTerm && (
                <button
                  className="search-clear-premium"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav-premium">
            <div className="nav-sections-premium">
              {filteredSections.map((section) => (
                <div 
                  key={section.id} 
                  className="nav-section-premium"
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <button
                    className="section-header-premium"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="section-info-premium">
                      <span className="section-icon-premium">{section.icon}</span>
                      <span className="section-title-premium">{section.title}</span>
                    </div>
                    <div className={`section-toggle-premium ${expandedSections[section.id] ? 'expanded' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`section-items-premium ${expandedSections[section.id] ? 'expanded' : ''}`}>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className="nav-item-premium"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <div className="nav-item-content-premium">
                          <div className="nav-item-icon-premium">{item.icon}</div>
                          <span className="nav-item-label-premium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="nav-item-badge-premium">{item.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
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

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="mobile-overlay-premium" onClick={onToggle}></div>
      )}
    </>
  );
};

export default Sidebar;
