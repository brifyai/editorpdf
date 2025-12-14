import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './AIAnalysis.css';

const AIAnalysis = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [analysisDepth, setAnalysisDepth] = useState('standard'); // basic, standard, deep
  const [focusAreas, setFocusAreas] = useState({
    content: true,
    structure: true,
    sentiment: false,
    keywords: true,
    summary: true
  });
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
      setAnalysisResults([]);
    }
  };

  const handleFocusAreaChange = (area) => {
    setFocusAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  const performAnalysis = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo');
      return;
    }

    const hasSelectedFocus = Object.values(focusAreas).some(value => value);
    if (!hasSelectedFocus) {
      showError('Por favor, selecciona al menos un área de enfoque');
      return;
    }

    setIsProcessing(true);
    setAnalysisResults([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('model', selectedModel);
      formData.append('analysisDepth', analysisDepth);
      formData.append('focusAreas', JSON.stringify(focusAreas));

      const response = await axios.post('/api/ai/analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for AI analysis
      });

      if (response.data.success) {
        setAnalysisResults(response.data.results);
        showSuccess('Análisis de IA completado correctamente');
      } else {
        showError(response.data.message || 'Error en el análisis de IA');
      }
    } catch (error) {
      console.error('Error performing AI analysis:', error);
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
    if (analysisResults.length === 0) {
      showError('No hay resultados para descargar');
      return;
    }

    analysisResults.forEach(result => {
      downloadResult(result.data, result.fileName);
    });
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los resultados del análisis',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setAnalysisResults([]);
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

  const getDepthName = (depth) => {
    const depths = {
      'basic': 'Básico',
      'standard': 'Estándar',
      'deep': 'Profundo'
    };
    return depths[depth] || depth;
  };

  const getFocusAreaName = (area) => {
    const areas = {
      'content': 'Contenido',
      'structure': 'Estructura',
      'sentiment': 'Sentimiento',
      'keywords': 'Palabras clave',
      'summary': 'Resumen'
    };
    return areas[area] || area;
  };

  return (
    <div className="ai-analysis-container">
      <div className="ai-analysis-header">
        <Brain className="header-icon" size={48} />
        <div className="header-content">
          <h1>Análisis de Documentos con IA</h1>
          <p>Analiza documentos con inteligencia artificial para obtener insights valiosos</p>
        </div>
      </div>

      <div className="ai-analysis-content">
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

        {/* Analysis Configuration */}
        {files.length > 0 && (
          <div className="analysis-configuration">
            <h3>Configuración del análisis</h3>
            <div className="analysis-options">
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
                <label>Profundidad del análisis</label>
                <select 
                  value={analysisDepth} 
                  onChange={(e) => setAnalysisDepth(e.target.value)}
                >
                  <option value="basic">Básico</option>
                  <option value="standard">Estándar</option>
                  <option value="deep">Profundo</option>
                </select>
              </div>
            </div>
            
            <div className="focus-areas">
              <label>Áreas de enfoque</label>
              <div className="focus-options">
                {Object.entries(focusAreas).map(([area, selected]) => (
                  <div key={area} className="focus-option">
                    <input
                      type="checkbox"
                      id={area}
                      checked={selected}
                      onChange={() => handleFocusAreaChange(area)}
                    />
                    <label htmlFor={area}>{getFocusAreaName(area)}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="analysis-info">
              <div className="info-item">
                <strong>Modelo seleccionado</strong>
                <span>{getModelName(selectedModel)}</span>
              </div>
              <div className="info-item">
                <strong>Profundidad</strong>
                <span>{getDepthName(analysisDepth)}</span>
              </div>
              <div className="info-item">
                <strong>Áreas de enfoque</strong>
                <span>
                  {Object.entries(focusAreas)
                    .filter(([_, selected]) => selected)
                    .map(([area, _]) => getFocusAreaName(area))
                    .join(', ')}
                </span>
              </div>
              <div className="info-item">
                <strong>Archivos a analizar</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="analysis-results">
            <h3>Resultados del análisis ({analysisResults.length})</h3>
            <div className="results-container">
              {analysisResults.map((result, index) => (
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
                        <TrendingUp size={16} />
                        <span>Precisión: {result.accuracy}%</span>
                      </div>
                      <div className="metric-item">
                        <Target size={16} />
                        <span>Confianza: {result.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="result-content">
                    {result.content && (
                      <div className="result-section">
                        <h4><FileText size={16} /> Análisis de contenido</h4>
                        <p>{result.content}</p>
                      </div>
                    )}
                    {result.keywords && result.keywords.length > 0 && (
                      <div className="result-section">
                        <h4><Target size={16} /> Palabras clave</h4>
                        <div className="keywords-container">
                          {result.keywords.map((keyword, i) => (
                            <span key={i} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.summary && (
                      <div className="result-section">
                        <h4><Lightbulb size={16} /> Resumen</h4>
                        <p>{result.summary}</p>
                      </div>
                    )}
                    {result.insights && result.insights.length > 0 && (
                      <div className="result-section">
                        <h4><Brain size={16} /> Insights</h4>
                        <ul>
                          {result.insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
        <div className="analysis-actions">
          {files.length > 0 && (
            <>
              <button 
                className="analyze-btn"
                onClick={performAnalysis}
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
              
              {analysisResults.length > 0 && (
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

export default AIAnalysis;