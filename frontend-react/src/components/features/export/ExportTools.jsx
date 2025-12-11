import React, { useState, useCallback } from 'react';
import './ExportTools.css';

const ExportTools = () => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [selectedTypes, setSelectedTypes] = useState(['analysis', 'ocr']);
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeImages: false,
    includeRawData: false,
    compressFiles: true,
    addTimestamp: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Reporte',
      description: 'Documento PDF con análisis completo',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      color: '#ef4444',
      estimatedSize: '2.5 MB',
      estimatedTime: '30s'
    },
    {
      id: 'excel',
      name: 'Excel Workbook',
      description: 'Hoja de cálculo con datos estructurados',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M9 9h6v6H9z"/>
          <path d="M21 15l-7-7-5 5"/>
        </svg>
      ),
      color: '#10b981',
      estimatedSize: '1.8 MB',
      estimatedTime: '20s'
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Datos estructurados en formato JSON',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      color: '#f59e0b',
      estimatedSize: '850 KB',
      estimatedTime: '15s'
    },
    {
      id: 'csv',
      name: 'CSV File',
      description: 'Archivo CSV para análisis en otras herramientas',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      color: '#8b5cf6',
      estimatedSize: '650 KB',
      estimatedTime: '12s'
    },
    {
      id: 'zip',
      name: 'ZIP Archive',
      description: 'Archivo comprimido con todos los recursos',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      color: '#06b6d4',
      estimatedSize: '3.2 MB',
      estimatedTime: '45s'
    },
    {
      id: 'xml',
      name: 'XML Export',
      description: 'Datos en formato XML estructurado',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4z"/>
          <path d="M8 8h8"/>
          <path d="M8 12h8"/>
          <path d="M8 16h8"/>
        </svg>
      ),
      color: '#84cc16',
      estimatedSize: '1.1 MB',
      estimatedTime: '18s'
    }
  ];

  const dataTypes = [
    { id: 'analysis', name: 'Análisis de Documentos', count: 247 },
    { id: 'ocr', name: 'Procesamiento OCR', count: 156 },
    { id: 'batch', name: 'Análisis por Lotes', count: 23 },
    { id: 'ai', name: 'Procesamiento IA', count: 89 },
    { id: 'conversion', name: 'Conversiones', count: 134 }
  ];

  const simulateExport = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setExportProgress(100);
      setIsExporting(false);
    }, 4000);
  }, []);

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const getSelectedFormat = () => {
    return exportFormats.find(format => format.id === selectedFormat);
  };

  const getTotalItems = () => {
    return selectedTypes.reduce((total, typeId) => {
      const type = dataTypes.find(t => t.id === typeId);
      return total + (type ? type.count : 0);
    }, 0);
  };

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="export-tools-container">
      <div className="export-tools-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Herramientas de Exportación</h1>
            <p>Exporta tus datos y análisis en múltiples formatos</p>
          </div>
        </div>
      </div>

      <div className="export-configuration">
        <div className="config-section">
          <h2>Formato de Exportación</h2>
          <div className="formats-grid">
            {exportFormats.map(format => (
              <div 
                key={format.id}
                className={`format-card ${selectedFormat === format.id ? 'selected' : ''}`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="format-icon" style={{ backgroundColor: `${format.color}20`, color: format.color }}>
                  {format.icon}
                </div>
                <div className="format-info">
                  <h3>{format.name}</h3>
                  <p>{format.description}</p>
                  <div className="format-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {format.estimatedSize}
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      {format.estimatedTime}
                    </span>
                  </div>
                </div>
                <div className="format-selection">
                  {selectedFormat === format.id && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h2>Rango de Fechas</h2>
          <div className="date-range-selector">
            <div className="date-input-group">
              <label htmlFor="start-date">Desde:</label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">Hasta:</label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="date-input"
              />
            </div>
            <div className="quick-ranges">
              <button 
                className="quick-range-btn"
                onClick={() => setDateRange({ start: '2024-12-01', end: '2024-12-31' })}
              >
                Este mes
              </button>
              <button 
                className="quick-range-btn"
                onClick={() => setDateRange({ start: '2024-01-01', end: '2024-12-31' })}
              >
                Este año
              </button>
              <button 
                className="quick-range-btn"
                onClick={() => setDateRange({ start: '2023-01-01', end: '2024-12-31' })}
              >
                Últimos 2 años
              </button>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Tipos de Datos</h2>
          <div className="data-types-grid">
            {dataTypes.map(type => (
              <div 
                key={type.id}
                className={`data-type-card ${selectedTypes.includes(type.id) ? 'selected' : ''}`}
                onClick={() => handleTypeToggle(type.id)}
              >
                <div className="type-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                  />
                </div>
                <div className="type-info">
                  <h4>{type.name}</h4>
                  <span className="type-count">{type.count} elementos</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h2>Opciones de Exportación</h2>
          <div className="options-grid">
            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                />
                <span className="option-text">
                  <strong>Incluir metadatos</strong>
                  <small>Agregar información adicional del documento</small>
                </span>
              </label>
            </div>

            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeImages}
                  onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
                />
                <span className="option-text">
                  <strong>Incluir imágenes originales</strong>
                  <small>Adjuntar las imágenes fuente al export</small>
                </span>
              </label>
            </div>

            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeRawData}
                  onChange={(e) => handleOptionChange('includeRawData', e.target.checked)}
                />
                <span className="option-text">
                  <strong>Incluir datos en bruto</strong>
                  <small>Agregar datos sin procesar</small>
                </span>
              </label>
            </div>

            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={exportOptions.compressFiles}
                  onChange={(e) => handleOptionChange('compressFiles', e.target.checked)}
                />
                <span className="option-text">
                  <strong>Comprimir archivos</strong>
                  <small>Reducir el tamaño del archivo final</small>
                </span>
              </label>
            </div>

            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={exportOptions.addTimestamp}
                  onChange={(e) => handleOptionChange('addTimestamp', e.target.checked)}
                />
                <span className="option-text">
                  <strong>Agregar timestamp</strong>
                  <small>Incluir fecha y hora en el nombre del archivo</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="export-preview">
        <div className="preview-header">
          <h2>Vista Previa de Exportación</h2>
          <p>Resumen de lo que se exportará</p>
        </div>

        <div className="preview-content">
          <div className="preview-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total de Elementos</h3>
                <div className="stat-value">{getTotalItems()}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Tamaño Estimado</h3>
                <div className="stat-value">{getSelectedFormat()?.estimatedSize}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Tiempo Estimado</h3>
                <div className="stat-value">{getSelectedFormat()?.estimatedTime}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Formato</h3>
                <div className="stat-value">{getSelectedFormat()?.name}</div>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button className="export-button" onClick={simulateExport} disabled={isExporting || getTotalItems() === 0}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {isExporting ? 'Exportando...' : 'Iniciar Exportación'}
            </button>
            
            <button className="preview-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Vista Previa
            </button>
          </div>
        </div>
      </div>

      {isExporting && (
        <div className="export-overlay">
          <div className="export-content">
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
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - exportProgress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                  className="progress-circle-animated"
                />
              </svg>
              <span className="progress-text">{Math.round(exportProgress)}%</span>
            </div>
            <p className="progress-message">Preparando exportación en formato {getSelectedFormat()?.name}...</p>
            <div className="export-details">
              <div className="detail-item">
                <span>Elementos:</span>
                <span>{getTotalItems()}</span>
              </div>
              <div className="detail-item">
                <span>Formato:</span>
                <span>{getSelectedFormat()?.name}</span>
              </div>
              <div className="detail-item">
                <span>Tamaño estimado:</span>
                <span>{getSelectedFormat()?.estimatedSize}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTools;
