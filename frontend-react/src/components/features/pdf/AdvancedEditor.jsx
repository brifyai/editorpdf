import React, { useState, useCallback } from 'react';
import { Edit3, Upload, X, Settings, Download, FileText, CheckCircle, Type, Palette, Square, Circle } from 'lucide-react';
import axios from 'axios';
import './AdvancedEditor.css';

const AdvancedEditor = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    tool: 'text',
    fontSize: 12,
    fontFamily: 'Arial',
    color: '#000000',
    strokeWidth: 2,
    opacity: 100,
    preserveQuality: true,
    compressOutput: false
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPDFs = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    const results = [];

    for (const file of files) {
      try {
        // Simulación de procesamiento de edición avanzada
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_edited.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'editing',
            tool: 'advanced-editor',
            action: 'processed'
          });
        } catch (error) {
          console.error('Error updating statistics:', error);
        }
        
      } catch (error) {
        results.push({
          originalName: file.name,
          processedName: null,
          size: file.size,
          status: 'error',
          error: error.message
        });
      }
    }

    setProcessedFiles(results);
    setProcessing(false);
  };

  const downloadFile = (file) => {
    // Simulación de descarga
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.processedName;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="advanced-editor-container">
      <div className="advanced-editor-header">
        <div className="advanced-editor-header-icon">
          <Edit3 size={32} color="#667eea" />
        </div>
        <div className="advanced-editor-header-content">
          <h1>Editor Avanzado</h1>
          <p>Edita documentos PDF con herramientas profesionales de texto, formas y anotaciones</p>
        </div>
      </div>

      <div className="advanced-editor-content">
        <div className="advanced-editor-upload-section">
          <div
            className={`advanced-editor-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} color="#667eea" />
            <h3>Arrastra y suelta archivos PDF aquí</h3>
            <p>o haz clic para seleccionar archivos</p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="advanced-editor-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="advanced-editor-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="advanced-editor-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="advanced-editor-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="advanced-editor-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="advanced-editor-settings-section">
          <div className="advanced-editor-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Herramientas de Edición</h3>
          </div>
          
          <div className="advanced-editor-tools-grid">
            <div className="advanced-editor-tool-group">
              <h4>Herramientas de Dibujo</h4>
              <div className="advanced-editor-tool-buttons">
                <button
                  onClick={() => setSettings({...settings, tool: 'text'})}
                  className={`advanced-editor-tool-btn ${settings.tool === 'text' ? 'active' : ''}`}
                >
                  <Type size={20} />
                  Texto
                </button>
                <button
                  onClick={() => setSettings({...settings, tool: 'rectangle'})}
                  className={`advanced-editor-tool-btn ${settings.tool === 'rectangle' ? 'active' : ''}`}
                >
                  <Square size={20} />
                  Rectángulo
                </button>
                <button
                  onClick={() => setSettings({...settings, tool: 'circle'})}
                  className={`advanced-editor-tool-btn ${settings.tool === 'circle' ? 'active' : ''}`}
                >
                  <Circle size={20} />
                  Círculo
                </button>
                <button
                  onClick={() => setSettings({...settings, tool: 'freehand'})}
                  className={`advanced-editor-tool-btn ${settings.tool === 'freehand' ? 'active' : ''}`}
                >
                  <Edit3 size={20} />
                  Mano Alzada
                </button>
              </div>
            </div>

            <div className="advanced-editor-settings-grid">
              <div className="advanced-editor-setting-item">
                <label>Fuente:</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
                  className="advanced-editor-select"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div className="advanced-editor-setting-item">
                <label>Tamaño de fuente:</label>
                <input
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                  min="8"
                  max="72"
                  className="advanced-editor-input"
                />
              </div>

              <div className="advanced-editor-setting-item">
                <label>Color:</label>
                <div className="advanced-editor-color-input-wrapper">
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings({...settings, color: e.target.value})}
                    className="advanced-editor-color-input"
                  />
                  <span>{settings.color}</span>
                </div>
              </div>

              <div className="advanced-editor-setting-item">
                <label>Grosor de línea:</label>
                <input
                  type="range"
                  value={settings.strokeWidth}
                  onChange={(e) => setSettings({...settings, strokeWidth: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                  className="advanced-editor-range"
                />
                <span>{settings.strokeWidth}px</span>
              </div>

              <div className="advanced-editor-setting-item">
                <label>Opacidad:</label>
                <input
                  type="range"
                  value={settings.opacity}
                  onChange={(e) => setSettings({...settings, opacity: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="advanced-editor-range"
                />
                <span>{settings.opacity}%</span>
              </div>

              <div className="advanced-editor-setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.preserveQuality}
                    onChange={(e) => setSettings({...settings, preserveQuality: e.target.checked})}
                  />
                  Preservar calidad original
                </label>
              </div>

              <div className="advanced-editor-setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.compressOutput}
                    onChange={(e) => setSettings({...settings, compressOutput: e.target.checked})}
                  />
                  Comprimir archivo de salida
                </label>
              </div>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="advanced-editor-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="advanced-editor-process-btn"
            >
              {processing ? 'Procesando...' : 'Abrir Editor'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="advanced-editor-results-section">
            <h3>Resultados:</h3>
            <div className="advanced-editor-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="advanced-editor-result-item">
                  <div className="advanced-editor-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="advanced-editor-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="advanced-editor-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="advanced-editor-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="advanced-editor-download-btn"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedEditor;