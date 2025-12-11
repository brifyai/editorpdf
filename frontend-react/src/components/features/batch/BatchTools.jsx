import React, { useState, useRef, useCallback } from 'react';
import './BatchTools.css';

const BatchTools = () => {
  const [selectedTool, setSelectedTool] = useState('consolidate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [batchJobs, setBatchJobs] = useState([
    {
      id: 1,
      name: 'Análisis Documentos Q4',
      type: 'Análisis Completo',
      status: 'completado',
      files: 25,
      created: '2024-12-10',
      duration: '2m 34s'
    },
    {
      id: 2,
      name: 'OCR Imágenes Enero',
      type: 'Solo Texto',
      status: 'procesando',
      files: 18,
      created: '2024-12-10',
      duration: 'En progreso'
    },
    {
      id: 3,
      name: 'Extracción Tablas',
      type: 'Detección de Tablas',
      status: 'pendiente',
      files: 12,
      created: '2024-12-09',
      duration: 'Pendiente'
    }
  ]);

  const tools = [
    {
      id: 'consolidate',
      name: 'Consolidar Resultados',
      description: 'Combina múltiples análisis en un solo reporte',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      color: '#3b82f6'
    },
    {
      id: 'export',
      name: 'Exportar Masivo',
      description: 'Exporta todos los resultados en diferentes formatos',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      id: 'schedule',
      name: 'Programar Lotes',
      description: 'Automatiza el procesamiento de documentos',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: '#f59e0b'
    },
    {
      id: 'template',
      name: 'Plantillas de Análisis',
      description: 'Crea y reutiliza configuraciones de análisis',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M9 9h6v6H9z"/>
          <path d="M21 15l-7-7-5 5"/>
        </svg>
      ),
      color: '#8b5cf6'
    },
    {
      id: 'analytics',
      name: 'Análisis de Rendimiento',
      description: 'Estadísticas y métricas de procesamiento',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      ),
      color: '#ef4444'
    },
    {
      id: 'cleanup',
      name: 'Limpiar Cache',
      description: 'Gestiona el almacenamiento y elimina archivos temporales',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      ),
      color: '#6b7280'
    }
  ];

  const simulateProcessing = useCallback(() => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }, 4000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado': return '#10b981';
      case 'procesando': return '#f59e0b';
      case 'pendiente': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completado':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      case 'procesando':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        );
      case 'pendiente':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="batch-tools-container">
      <div className="batch-tools-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14,2 14,8 20,8"/>
              <path d="M8 13h2"/>
              <path d="M8 17h2"/>
              <path d="M14 13h2"/>
              <path d="M14 17h2"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Herramientas de Lotes</h1>
            <p>Gestiona y optimiza tus procesos de análisis masivo</p>
          </div>
        </div>
      </div>

      <div className="tools-grid">
        {tools.map(tool => (
          <div 
            key={tool.id}
            className={`tool-card ${selectedTool === tool.id ? 'selected' : ''}`}
            onClick={() => setSelectedTool(tool.id)}
          >
            <div className="tool-icon" style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
              {tool.icon}
            </div>
            <div className="tool-info">
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>
            <div className="tool-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="tool-details">
        <div className="details-header">
          <h2>{tools.find(t => t.id === selectedTool)?.name}</h2>
          <p>{tools.find(t => t.id === selectedTool)?.description}</p>
        </div>

        {selectedTool === 'consolidate' && (
          <div className="tool-content">
            <div className="action-section">
              <h3>Consolidar Análisis Existentes</h3>
              <p>Selecciona múltiples análisis para combinar en un reporte unificado.</p>
              
              <div className="consolidation-options">
                <div className="option-group">
                  <label>Formato de salida:</label>
                  <select className="format-select">
                    <option value="pdf">PDF Reporte</option>
                    <option value="excel">Excel con Tablas</option>
                    <option value="json">JSON Estructurado</option>
                    <option value="markdown">Markdown</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label>Incluir en el reporte:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Resumen ejecutivo</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Detalles por documento</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Estadísticas de calidad</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Anexos y metadatos</span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="action-button" onClick={simulateProcessing} disabled={isProcessing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                </svg>
                {isProcessing ? 'Consolidando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        )}

        {selectedTool === 'export' && (
          <div className="tool-content">
            <div className="action-section">
              <h3>Exportación Masiva</h3>
              <p>Descarga todos los resultados de análisis en el formato que prefieras.</p>
              
              <div className="export-options">
                <div className="option-group">
                  <label>Rango de fechas:</label>
                  <div className="date-range">
                    <input type="date" className="date-input" />
                    <span>a</span>
                    <input type="date" className="date-input" />
                  </div>
                </div>
                
                <div className="option-group">
                  <label>Tipos de análisis:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Análisis de texto</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Extracción de tablas</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Procesamiento OCR</span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="action-button" onClick={simulateProcessing} disabled={isProcessing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {isProcessing ? 'Exportando...' : 'Iniciar Exportación'}
              </button>
            </div>
          </div>
        )}

        {selectedTool === 'schedule' && (
          <div className="tool-content">
            <div className="action-section">
              <h3>Programar Procesamiento</h3>
              <p>Configura tareas automáticas para procesar documentos regularmente.</p>
              
              <div className="schedule-options">
                <div className="option-group">
                  <label>Frecuencia:</label>
                  <select className="frequency-select">
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label>Hora de ejecución:</label>
                  <input type="time" className="time-input" defaultValue="09:00" />
                </div>
                
                <div className="option-group">
                  <label>Configuración de análisis:</label>
                  <select className="config-select">
                    <option value="full">Análisis Completo</option>
                    <option value="text">Solo Texto</option>
                    <option value="tables">Detección de Tablas</option>
                  </select>
                </div>
              </div>

              <button className="action-button" onClick={simulateProcessing} disabled={isProcessing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {isProcessing ? 'Programando...' : 'Crear Programación'}
              </button>
            </div>
          </div>
        )}

        {(selectedTool === 'template' || selectedTool === 'analytics' || selectedTool === 'cleanup') && (
          <div className="tool-content">
            <div className="action-section">
              <h3>Funcionalidad en Desarrollo</h3>
              <p>Esta herramienta estará disponible próximamente. ¡Mantente atento a las actualizaciones!</p>
              
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <p>Próximamente disponible</p>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-content">
              <div className="progress-circle">
                <svg width="80" height="80" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 25}`}
                    strokeDashoffset={`${2 * Math.PI * 25 * (1 - processingProgress / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                    className="progress-circle-animated"
                  />
                </svg>
                <span className="progress-text">{Math.round(processingProgress)}%</span>
              </div>
              <p className="progress-message">Procesando {tools.find(t => t.id === selectedTool)?.name.toLowerCase()}...</p>
            </div>
          </div>
        )}
      </div>

      <div className="batch-jobs-section">
        <div className="section-header">
          <h2>Trabajos de Lote Recientes</h2>
          <p>Historial de procesamiento y estado actual</p>
        </div>

        <div className="jobs-list">
          {batchJobs.map(job => (
            <div key={job.id} className="job-item">
              <div className="job-status" style={{ color: getStatusColor(job.status) }}>
                {getStatusIcon(job.status)}
              </div>
              <div className="job-info">
                <h4>{job.name}</h4>
                <div className="job-details">
                  <span className="job-type">{job.type}</span>
                  <span className="job-files">{job.files} archivos</span>
                  <span className="job-date">{job.created}</span>
                </div>
              </div>
              <div className="job-duration">
                <span>{job.duration}</span>
              </div>
              <div className="job-actions">
                <button className="job-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button className="job-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchTools;
