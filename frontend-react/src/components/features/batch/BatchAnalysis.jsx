import React, { useState, useRef, useCallback } from 'react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import './BatchAnalysis.css';

const BatchAnalysis = () => {
  const { showError, showSuccess, showWarning } = useSweetAlert();
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [batchName, setBatchName] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('comprehensive');
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/tiff'
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 50;

  const analysisTypes = [
    { 
      value: 'comprehensive', 
      label: 'Análisis Completo', 
      description: 'Extracción de texto, tablas, metadatos y análisis de contenido' 
    },
    { 
      value: 'text-extraction', 
      label: 'Solo Texto', 
      description: 'Extracción únicamente del contenido textual' 
    },
    { 
      value: 'table-detection', 
      label: 'Detección de Tablas', 
      description: 'Identificación y extracción de tablas y datos estructurados' 
    },
    { 
      value: 'metadata', 
      label: 'Solo Metadatos', 
      description: 'Extracción de información del documento y propiedades' 
    }
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((newFiles) => {
    if (files.length + newFiles.length > maxFiles) {
      showError('Límite excedido', `Máximo ${maxFiles} archivos permitidos por lote.`);
      return;
    }

    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        showError('Formato inválido', `El archivo ${file.name} no es un formato válido. Solo se permiten PDF, JPG, PNG, WebP y TIFF.`);
        return false;
      }
      if (file.size > maxFileSize) {
        showError('Archivo muy grande', `El archivo ${file.name} es demasiado grande. El tamaño máximo es 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      if (!batchName) {
        setBatchName(`Lote_${new Date().toISOString().slice(0, 10)}_${files.length + 1}`);
      }
    }
  }, [files.length, batchName]);

  const simulateProcessing = useCallback((filesToProcess) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }, filesToProcess.length * 4000);
  }, []);

  const startBatchProcessing = useCallback(() => {
    if (files.length === 0) {
      showWarning('Sin archivos', 'Por favor selecciona al menos un archivo para procesar.');
      return;
    }
    if (!batchName.trim()) {
      showWarning('Nombre requerido', 'Por favor ingresa un nombre para el lote.');
      return;
    }
    simulateProcessing(files);
  }, [files, batchName, simulateProcessing]);

  const removeFile = useCallback((indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    );
  };

  return (
    <div className="batch-analysis-container">
      <div className="batch-analysis-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path d="M7.5 4.21L12 6.81l4.5-2.6"/>
              <path d="M12 22.81V12"/>
              <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
              <path d="M12 8.52V22.81"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Análisis por Lotes</h1>
            <p>Procesa múltiples documentos simultáneamente con IA</p>
          </div>
        </div>
      </div>

      <div className="batch-configuration">
        <div className="config-section">
          <div className="input-group">
            <label htmlFor="batch-name">Nombre del lote:</label>
            <input
              id="batch-name"
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Ingresa un nombre descriptivo para el lote"
              className="batch-name-input"
              disabled={isProcessing}
            />
          </div>

          <div className="analysis-type-selector">
            <label>Tipo de análisis:</label>
            <div className="analysis-options">
              {analysisTypes.map(type => (
                <div 
                  key={type.value}
                  className={`analysis-option ${selectedAnalysisType === type.value ? 'selected' : ''}`}
                  onClick={() => setSelectedAnalysisType(type.value)}
                >
                  <div className="analysis-info">
                    <span className="analysis-label">{type.label}</span>
                    <span className="analysis-description">{type.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
          
          <div className="upload-content">
            {isProcessing ? (
              <div className="processing-progress">
                <div className="progress-circle">
                  <svg width="60" height="60" viewBox="0 0 60 60">
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
                <p className="progress-message">Procesando lote: {batchName}</p>
                <p className="progress-details">{files.length} archivos en procesamiento</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className="upload-text">
                  <h3>Arrastra archivos aquí para análisis por lotes</h3>
                  <p className="upload-formats">
                    <span className="formats-label">Formatos soportados:</span>
                    <span className="formats-list">PDF, JPG, PNG, WebP, TIFF</span>
                    <span className="formats-size">(máx. 10MB por archivo, {maxFiles} archivos máximo)</span>
                  </p>
                </div>
                <button className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  Seleccionar Archivos
                </button>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="batch-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Archivos:</span>
                <span className="stat-value">{files.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tamaño total:</span>
                <span className="stat-value">{formatFileSize(getTotalSize())}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Análisis:</span>
                <span className="stat-value">{analysisTypes.find(t => t.value === selectedAnalysisType)?.label}</span>
              </div>
            </div>
            <button 
              className="start-processing-btn"
              onClick={startBatchProcessing}
              disabled={isProcessing || !batchName.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Iniciar Procesamiento
            </button>
          </div>
        )}

        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos del lote ({files.length})</h3>
            <div className="files-grid">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button 
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="features-section">
        <h3>Características del Análisis por Lotes</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h4>Procesamiento Masivo</h4>
            <p>Analiza hasta 50 documentos simultáneamente con máxima eficiencia</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h4>Velocidad Optimizada</h4>
            <p>Procesamiento paralelo que reduce significativamente el tiempo total</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4>Múltiples Tipos</h4>
            <p>PDF, imágenes y documentos con análisis personalizable</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4>Reportes Detallados</h4>
            <p>Informes completos con resultados individuales y consolidados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchAnalysis;
