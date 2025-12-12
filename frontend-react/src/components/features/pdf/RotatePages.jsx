import React, { useState, useCallback } from 'react';
import { RotateCw, Upload, X, Settings, Download, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './RotatePages.css';

const RotatePages = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    rotation: 90,
    pageRange: 'all',
    customRange: '',
    allPages: true
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
        // Simulación de procesamiento de rotación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_rotated.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'editing',
            tool: 'rotate-pages',
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
    <div className="rotate-pages-container">
      <div className="rotate-pages-header">
        <div className="rotate-pages-header-icon">
          <RotateCw size={32} color="#667eea" />
        </div>
        <div className="rotate-pages-header-content">
          <h1>Rotar Páginas</h1>
          <p>Rota las páginas de tus documentos PDF al ángulo deseado</p>
        </div>
      </div>

      <div className="rotate-pages-content">
        <div className="rotate-pages-upload-section">
          <div
            className={`rotate-pages-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="rotate-pages-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="rotate-pages-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="rotate-pages-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="rotate-pages-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="rotate-pages-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rotate-pages-settings-section">
          <div className="rotate-pages-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Rotación</h3>
          </div>
          
          <div className="rotate-pages-settings-grid">
            <div className="rotate-pages-setting-item">
              <label>Ángulo de rotación:</label>
              <select
                value={settings.rotation}
                onChange={(e) => setSettings({...settings, rotation: parseInt(e.target.value)})}
                className="rotate-pages-select"
              >
                <option value="90">90° (horario)</option>
                <option value="180">180°</option>
                <option value="270">270° (antihorario)</option>
              </select>
            </div>

            <div className="rotate-pages-setting-item">
              <label>Páginas a rotar:</label>
              <select
                value={settings.pageRange}
                onChange={(e) => setSettings({...settings, pageRange: e.target.value})}
                className="rotate-pages-select"
              >
                <option value="all">Todas las páginas</option>
                <option value="first">Primera página</option>
                <option value="last">Última página</option>
                <option value="odd">Páginas impares</option>
                <option value="even">Páginas pares</option>
                <option value="custom">Rango personalizado</option>
              </select>
            </div>

            {settings.pageRange === 'custom' && (
              <div className="rotate-pages-setting-item">
                <label>Rango de páginas (ej: 1-5,8,10-12):</label>
                <input
                  type="text"
                  value={settings.customRange}
                  onChange={(e) => setSettings({...settings, customRange: e.target.value})}
                  placeholder="1-5,8,10-12"
                  className="rotate-pages-input"
                />
              </div>
            )}

            <div className="rotate-pages-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.allPages}
                  onChange={(e) => setSettings({...settings, allPages: e.target.checked})}
                />
                Aplicar a todas las páginas del documento
              </label>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="rotate-pages-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="rotate-pages-process-btn"
            >
              {processing ? 'Procesando...' : 'Rotar Páginas'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="rotate-pages-results-section">
            <h3>Resultados:</h3>
            <div className="rotate-pages-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="rotate-pages-result-item">
                  <div className="rotate-pages-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="rotate-pages-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="rotate-pages-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="rotate-pages-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="rotate-pages-download-btn"
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

export default RotatePages;