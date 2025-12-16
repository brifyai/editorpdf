import React, { useState, useRef, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { batchJobsService } from '../../../services/api';
import { useErrorHandler } from '../../../utils/errorHandler';
import toast from 'react-hot-toast';
import './BatchTools.css';

const BatchTools = () => {
  const [selectedTool, setSelectedTool] = useState('consolidate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [batchJobs, setBatchJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const { handleError } = useErrorHandler();

  // Cargar trabajos de lote desde el backend
  const loadBatchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await batchJobsService.getBatchJobs();
      if (response.success) {
        setBatchJobs(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar trabajos de lote');
      }
    } catch (error) {
      handleError(error, { showToast: true });
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Cargar trabajos de lote al montar el componente
  useEffect(() => {
    loadBatchJobs();
  }, [loadBatchJobs]);

  const executeTool = useCallback(async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simular progreso mientras procesamos
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      let result;
      const toolName = tools.find(t => t.id === selectedTool)?.name;

      switch (selectedTool) {
        case 'consolidate':
          // Crear un trabajo de lote para consolidación
          result = await batchJobsService.createBatchJob({
            name: `Consolidación - ${new Date().toLocaleDateString()}`,
            type: 'consolidation',
            config: {
              format: 'pdf',
              includeSummary: true,
              includeDetails: true,
              includeStats: false,
              includeMetadata: true
            }
          });
          break;
        
        case 'export':
          // Crear un trabajo de lote para exportación
          result = await batchJobsService.createBatchJob({
            name: `Exportación Masiva - ${new Date().toLocaleDateString()}`,
            type: 'export',
            config: {
              formats: ['pdf', 'excel'],
              dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              analysisTypes: ['text', 'tables']
            }
          });
          break;
        
        case 'schedule':
          // Crear un trabajo de lote programado
          result = await batchJobsService.createBatchJob({
            name: `Procesamiento Programado - ${new Date().toLocaleDateString()}`,
            type: 'scheduled',
            config: {
              frequency: 'daily',
              time: '09:00',
              analysisType: 'full'
            }
          });
          break;
        
        default:
          throw new Error('Herramienta no implementada');
      }

      clearInterval(interval);
      setProcessingProgress(100);

      if (result.success) {
        // Recargar la lista de trabajos
        await loadBatchJobs();
        
        toast.success(`La herramienta ${toolName} se ha ejecutado exitosamente. ID del trabajo: ${result.data.id}`);
      } else {
        throw new Error(result.error || 'Error al ejecutar la herramienta');
      }
    } catch (error) {
      handleError(error, { showToast: true });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [selectedTool, loadBatchJobs, handleError]);

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
    <div className="analysis-history-container">
      <div className="analysis-history-header">
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
            <h1>Herramientas Batch PDF</h1>
            <p>Automatización de documentos y procesamiento eficiente en lote</p>
          </div>
        </div>
      </div>

      <div className="analysis-history-content">
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

              <button className="action-button" onClick={executeTool} disabled={isProcessing}>
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

              <button className="action-button" onClick={executeTool} disabled={isProcessing}>
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

              <button className="action-button" onClick={executeTool} disabled={isProcessing}>
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
          {loading ? (
            <div className="loading-jobs">
              <div className="loading-spinner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </div>
              <p>Cargando trabajos de lote...</p>
            </div>
          ) : batchJobs.length === 0 ? (
            <div className="no-jobs">
              <div className="no-jobs-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p>No hay trabajos de lote recientes</p>
              <button className="refresh-button" onClick={loadBatchJobs}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6"/>
                  <path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Actualizar
              </button>
            </div>
          ) : (
            batchJobs.map(job => (
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
                <button
                  className="job-action-btn"
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: 'Detalles del Trabajo',
                      html: `
                        <div style="text-align: left; font-size: 14px;">
                          <p><strong>Nombre:</strong> ${job.name}</p>
                          <p><strong>Tipo:</strong> ${job.type}</p>
                          <p><strong>Estado:</strong> ${job.status}</p>
                          <p><strong>Archivos:</strong> ${job.files}</p>
                          <p><strong>Creado:</strong> ${job.created}</p>
                          <p><strong>Duración:</strong> ${job.duration}</p>
                        </div>
                      `,
                      background: '#ffffff',
                      color: '#374151',
                      confirmButtonColor: '#3b82f6',
                      confirmButtonText: 'Cerrar'
                    });
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button
                  className="job-action-btn"
                  onClick={() => {
                    Swal.fire({
                      icon: 'question',
                      title: 'Descargar Resultados',
                      text: '¿Deseas descargar los resultados de este trabajo?',
                      background: '#ffffff',
                      color: '#374151',
                      confirmButtonColor: '#3b82f6',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: 'Descargar',
                      cancelButtonText: 'Cancelar',
                      showCancelButton: true
                    }).then((result) => {
                      if (result.isConfirmed) {
                        Swal.fire({
                          icon: 'success',
                          title: 'Descarga Iniciada',
                          text: 'La descarga de resultados ha comenzado.',
                          background: '#ffffff',
                          color: '#374151',
                          confirmButtonColor: '#3b82f6',
                          confirmButtonText: 'Perfecto',
                          timer: 2000,
                          timerProgressBar: true
                        });
                      }
                    });
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default BatchTools;
