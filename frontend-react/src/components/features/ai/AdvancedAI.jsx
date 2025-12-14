import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, Brain, Zap, BarChart, Lightbulb } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './AdvancedAI.css';

const AdvancedAI = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const supportedFiles = newFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'text/plain' ||
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    });
    
    if (supportedFiles.length !== newFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, DOCX o XLSX');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const supportedFiles = droppedFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'text/plain' ||
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    });
    
    if (supportedFiles.length !== droppedFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, DOCX o XLSX');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setAiResults([]);
    }
  };

  const processWithAI = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo');
      return;
    }

    if (analysisType === 'custom' && !customPrompt.trim()) {
      showError('Por favor, ingresa un prompt personalizado');
      return;
    }

    setIsProcessing(true);
    setAiResults([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('model', selectedModel);
      formData.append('analysisType', analysisType);
      formData.append('customPrompt', customPrompt);
      formData.append('includeMetrics', includeMetrics);

      const response = await axios.post('/api/ai/advanced-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for AI processing (increased for Netlify)
      });

      if (response.data.success) {
        setAiResults(response.data.results);
        showSuccess('Análisis de IA completado correctamente');
      } else {
        showError(response.data.message || 'Error en el análisis de IA');
      }
    } catch (error) {
      console.error('Error processing with AI:', error);
      if (error.response) {
        showError(`Error del servidor: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        showError('No se pudo conectar con el servidor');
      } else {
        showError('Error al procesar la solicitud');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = (resultData, fileName) => {
    const link = document.createElement('a');
    link.href = resultData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllResults = () => {
    if (aiResults.length === 0) {
      showError('No hay resultados para descargar');
      return;
    }

    aiResults.forEach(result => {
      downloadResult(result.data, result.fileName);
    });
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los resultados de IA',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setAiResults([]);
        setCustomPrompt('');
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModelName = (model) => {
    const models = {
      'gpt-4': 'GPT-4 (Avanzado)',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo (Rápido)',
      'claude-3': 'Claude 3 (Preciso)',
      'llama-3': 'Llama 3 (Balanceado)'
    };
    return models[model] || model;
  };

  const getAnalysisTypeName = (type) => {
    const types = {
      'comprehensive': 'Análisis Integral',
      'summary': 'Resumen Ejecutivo',
      'extraction': 'Extracción de Datos',
      'sentiment': 'Análisis de Sentimiento',
      'custom': 'Análisis Personalizado'
    };
    return types[type] || type;
  };

  return (
    <div className="advanced-ai-container">
      <div className="advanced-ai-header">
        <Brain className="header-icon" size={48} />
        <div className="header-content">
          <h1>Análisis Avanzado con IA</h1>
          <p>Utiliza modelos de inteligencia artificial avanzados para analizar documentos</p>
        </div>
      </div>

      <div className="advanced-ai-content">
        {/* Upload Zone */}
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra y suelta archivos aquí</h3>
          <p>PDF, TXT, DOCX o XLSX</p>
          <button className="select-files-btn">Seleccionar archivos</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos seleccionados ({files.length})</h3>
            <div className="files-container">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                      title="Eliminar archivo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Configuration */}
        {files.length > 0 && (
          <div className="ai-configuration">
            <h3>Configuración de IA</h3>
            <div className="ai-options">
              <div className="option-group">
                <label>Modelo de IA</label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="gpt-4">GPT-4 (Avanzado)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</option>
                  <option value="claude-3">Claude 3 (Preciso)</option>
                  <option value="llama-3">Llama 3 (Balanceado)</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Tipo de análisis</label>
                <select 
                  value={analysisType} 
                  onChange={(e) => setAnalysisType(e.target.value)}
                >
                  <option value="comprehensive">Análisis Integral</option>
                  <option value="summary">Resumen Ejecutivo</option>
                  <option value="extraction">Extracción de Datos</option>
                  <option value="sentiment">Análisis de Sentimiento</option>
                  <option value="custom">Análisis Personalizado</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={includeMetrics}
                    onChange={(e) => setIncludeMetrics(e.target.checked)}
                  />
                  Incluir métricas de análisis
                </label>
                <small>Genera estadísticas y métricas detalladas</small>
              </div>
            </div>
            
            {analysisType === 'custom' && (
              <div className="custom-prompt-section">
                <label>Prompt personalizado</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe qué tipo de análisis quieres realizar..."
                  rows={4}
                />
              </div>
            )}
            
            <div className="ai-info">
              <div className="info-item">
                <strong>Modelo seleccionado</strong>
                <span>{getModelName(selectedModel)}</span>
              </div>
              <div className="info-item">
                <strong>Tipo de análisis</strong>
                <span>{getAnalysisTypeName(analysisType)}</span>
              </div>
              <div className="info-item">
                <strong>Incluir métricas</strong>
                <span>{includeMetrics ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>Archivos a procesar</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Results Preview */}
        {aiResults.length > 0 && (
          <div className="ai-results-preview">
            <h3>Resultados de IA ({aiResults.length})</h3>
            <div className="results-container">
              {aiResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <div className="result-info">
                      <Brain className="result-icon" size={20} />
                      <div className="result-details">
                        <span className="result-name">{result.fileName}</span>
                        <span className="result-model">Modelo: {getModelName(result.model)}</span>
                      </div>
                    </div>
                    <div className="result-metrics">
                      <div className="metric-item">
                        <BarChart size={16} />
                        <span>Precisión: {result.accuracy}%</span>
                      </div>
                      <div className="metric-item">
                        <Zap size={16} />
                        <span>Tiempo: {result.processingTime}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="result-content">
                    <div className="result-summary">
                      <Lightbulb size={16} />
                      <h4>Resumen</h4>
                      <p>{result.summary}</p>
                    </div>
                    <div className="result-insights">
                      <h4>Insights clave</h4>
                      <ul>
                        {result.insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button 
                      className="download-result-btn"
                      onClick={() => downloadResult(result.data, result.fileName)}
                      title="Descargar resultado"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ai-actions">
          {files.length > 0 && (
            <>
              <button 
                className="process-btn"
                onClick={processWithAI}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    Analizar con IA
                  </>
                )}
              </button>
              
              {aiResults.length > 0 && (
                <button 
                  className="download-all-btn"
                  onClick={downloadAllResults}
                >
                  <Download size={20} />
                  Descargar todos
                </button>
              )}
              
              <button 
                className="clear-btn"
                onClick={clearAll}
              >
                <X size={20} />
                Limpiar todo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAI;