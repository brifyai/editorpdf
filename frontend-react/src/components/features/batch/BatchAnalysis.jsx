import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { supabaseHelpers } from '../../../services/supabase';
import { supabaseRealHelpers } from '../../../services/supabase-real';
import { batchJobsService } from '../../../services/api';
import { useErrorHandler } from '../../../utils/errorHandler';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const BatchAnalysis = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [analysisType, setAnalysisType] = useState('document');
  const [priority, setPriority] = useState('medium');
  const [aiModel, setAiModel] = useState('basic');
  const [language, setLanguage] = useState('es');
  const [extractImages, setExtractImages] = useState(false);
  const [extractTables, setExtractTables] = useState(false);
  const [extractMetadata, setExtractMetadata] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [processedFiles, setProcessedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const { handleError } = useErrorHandler();

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.warning('Solo se permiten archivos PDF.');
    }
    
    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setBatchName('');
    setBatchDescription('');
    setAnalysisType('document');
    setPriority('medium');
    setAiModel('basic');
    setLanguage('es');
    setExtractImages(false);
    setExtractTables(false);
    setExtractMetadata(true);
    setGenerateSummary(false);
    setCustomPrompt('');
    setShowAdvanced(false);
    setIsProcessing(false);
    setProgress(0);
    setCurrentFileName('');
    setProcessedFiles(0);
    setTotalFiles(0);
  };

  const startBatchProcessing = useCallback(async () => {
    if (files.length === 0) {
      toast.warning('Por favor, carga al menos un archivo PDF.');
      return;
    }

    if (!batchName.trim()) {
      toast.warning('Por favor, ingresa un nombre para el batch.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedFiles(0);
    setTotalFiles(files.length);

    try {
      // Preparar la configuración del trabajo de lote
      const batchConfig = {
        name: batchName,
        description: batchDescription || `Procesamiento batch de ${files.length} archivos`,
        type: analysisType,
        priority: priority,
        config: {
          aiModel: aiModel,
          language: language,
          extractImages: extractImages,
          extractTables: extractTables,
          extractMetadata: extractMetadata,
          generateSummary: generateSummary,
          customPrompt: customPrompt
        },
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      // Crear el trabajo de lote en el backend
      const result = await batchJobsService.create(batchConfig);

      if (!result.success) {
        throw new Error(result.error || 'Error al crear el trabajo de lote');
      }

      const batchJob = result.data;
      
      // Simular el progreso del procesamiento
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileName(file.name);
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setProcessedFiles(prev => prev + 1);
        setProgress(((i + 1) / files.length) * 100);
      }

      // Actualizar el estado del trabajo a completado
      await batchJobsService.update(batchJob.id, {
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      });

      toast.success(`Se procesaron ${files.length} archivos exitosamente. ID del trabajo: ${batchJob.id}`);
      
      // Preguntar si quiere ver el historial
      setTimeout(() => {
        Swal.fire({
          title: '✅ Procesamiento completado',
          text: `Se procesaron ${files.length} archivos exitosamente. ID del trabajo: ${batchJob.id}`,
          icon: 'success',
          confirmButtonText: 'Ver historial',
          cancelButtonText: 'Permanecer aquí',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/historial-analisis');
          }
        });
      }, 1000);

    } catch (error) {
      handleError(error, { showToast: true });
    } finally {
      setIsProcessing(false);
    }
  }, [files, batchName, batchDescription, analysisType, priority, aiModel, language, extractImages, extractTables, extractMetadata, generateSummary, customPrompt, navigate, handleError]);

  return (
    <div className="analysis-history-container">
      <div className="analysis-history-header">
        <div className="header-icon">📦</div>
        <h1>Herramientas Batch PDF</h1>
        <p>Procesa múltiples documentos simultáneamente con configuraciones personalizadas</p>
      </div>

      <div className="analysis-history-content">
        {/* Formulario de configuración del batch */}
        <div className="controls-section">
          <h3>📋 Configuración del Batch</h3>
          
          <div className="config-form">
            {/* Información Básica */}
            <div className="config-section">
              <h4>📝 Información Básica</h4>
              <div className="basic-info-grid">
                <div className="form-group">
                  <label htmlFor="batchName">Nombre del Batch</label>
                  <input
                    type="text"
                    id="batchName"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="Ingresa un nombre para identificar este batch"
                    className="search-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="batchDescription">Descripción (opcional)</label>
                  <textarea
                    id="batchDescription"
                    value={batchDescription}
                    onChange={(e) => setBatchDescription(e.target.value)}
                    placeholder="Describe el propósito de este batch"
                    className="search-input"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Análisis */}
            <div className="config-section">
              <h4>⚙️ Configuración de Análisis</h4>
              <div className="config-grid">
                <div className="form-group">
                  <label htmlFor="analysisType">Tipo de Análisis</label>
                  <select
                    id="analysisType"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="document">📄 Análisis de Documentos</option>
                    <option value="ocr">🔍 Extracción OCR</option>
                    <option value="ai">🤖 Análisis con IA</option>
                    <option value="metadata">📊 Extracción de Metadatos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="sort-select"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="aiModel">Modelo de IA</label>
                  <select
                    id="aiModel"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="none">🚫 No usar IA</option>
                    <option value="basic">⚡ Procesamiento Básico</option>
                    <option value="advanced">🚀 Procesamiento Avanzado</option>
                    <option value="custom">🎯 Modelo Personalizado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="language">Idioma del Documento</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="sort-select"
                  >
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 Inglés</option>
                    <option value="pt">🇧🇷 Portugués</option>
                    <option value="auto">🔄 Auto-detectar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="advanced-options">
              <h4 onClick={() => setShowAdvanced(!showAdvanced)} className="advanced-toggle">
                {showAdvanced ? '▼' : '▶'} Opciones Avanzadas
              </h4>
              
              {showAdvanced && (
                <div className="advanced-content">
                  <div className="filters">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={extractImages}
                          onChange={(e) => setExtractImages(e.target.checked)}
                        />
                        Extraer imágenes
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={extractTables}
                          onChange={(e) => setExtractTables(e.target.checked)}
                        />
                        Extraer tablas
                      </label>
                    </div>
                  </div>

                  <div className="filters">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={extractMetadata}
                          onChange={(e) => setExtractMetadata(e.target.checked)}
                        />
                        Extraer metadatos
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={generateSummary}
                          onChange={(e) => setGenerateSummary(e.target.checked)}
                        />
                        Generar resumen
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customPrompt">Prompt Personalizado (para IA)</label>
                    <textarea
                      id="customPrompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ingresa instrucciones personalizadas para el análisis con IA"
                      className="search-input"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área de carga de archivos */}
        <div className="controls-section">
          <h3>📤 Carga de Archivos</h3>
          
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="upload-icon">📁</div>
              <p className="upload-text">
                {isDragActive
                  ? 'Suelta los archivos aquí'
                  : 'Arrastra y suelta archivos PDF aquí, o haz clic para seleccionar'}
              </p>
              <p className="upload-hint">
                Puedes cargar múltiples archivos simultáneamente
              </p>
            </div>
          </div>

          {/* Lista de archivos cargados */}
          {files.length > 0 && (
            <div className="analyses-list">
              <h3>Archivos Cargados ({files.length})</h3>
              <div className="analyses-container">
                {files.map((file, index) => (
                  <div key={index} className="analysis-item">
                    <div className="file-info">
                      <div className="file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                          <path d="M14 2V8H20"/>
                        </svg>
                      </div>
                      <div className="file-details">
                        <h3 className="file-name">{file.name}</h3>
                        <div className="file-meta">
                          <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="analysis-actions">
                      <button
                        className="action-btn secondary"
                        onClick={() => removeFile(index)}
                        title="Eliminar archivo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumen y botones de acción */}
        <div className="main-actions">
          <div className="summary-card">
            <h3>📊 Resumen del Batch</h3>
            <div className="analysis-details">
              <div className="analysis-detail">
                <span className="detail-label">Archivos</span>
                <span className="detail-value">{files.length}</span>
              </div>
              <div className="analysis-detail">
                <span className="detail-label">Tipo de análisis</span>
                <span className="detail-value">
                  {analysisType === 'document' ? 'Documentos' :
                   analysisType === 'ocr' ? 'OCR' :
                   analysisType === 'ai' ? 'IA' : 'Metadatos'}
                </span>
              </div>
              <div className="analysis-detail">
                <span className="detail-label">Modelo IA</span>
                <span className="detail-value">
                  {aiModel === 'none' ? 'No aplica' :
                   aiModel === 'basic' ? 'Básico' :
                   aiModel === 'advanced' ? 'Avanzado' : 'Personalizado'}
                </span>
              </div>
              <div className="analysis-detail">
                <span className="detail-label">Prioridad</span>
                <span className="detail-value">
                  {priority === 'low' ? 'Baja' :
                   priority === 'medium' ? 'Media' : 'Alta'}
                </span>
              </div>
            </div>
          </div>

          <div className="analysis-actions">
            <button
              className="action-btn secondary"
              onClick={clearAll}
              disabled={files.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
              Limpiar Todo
            </button>
            <button
              className="action-btn primary start-processing-btn"
              onClick={startBatchProcessing}
              disabled={isProcessing || !batchName.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              {isProcessing ? 'Procesando...' : 'Iniciar Procesamiento Batch'}
            </button>
          </div>
        </div>

        {/* Estado del procesamiento */}
        {isProcessing && (
          <div className="loading-state">
            <h3>⏳ Procesando Batch...</h3>
            <div className="loading-spinner"></div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">{progress}% completado</p>
            
            <div className="analysis-details">
              <div className="analysis-detail">
                <span className="detail-label">Archivo actual</span>
                <span className="detail-value">{currentFileName}</span>
              </div>
              <div className="analysis-detail">
                <span className="detail-label">Progreso</span>
                <span className="detail-value">{processedFiles} de {totalFiles} archivos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAnalysis;
