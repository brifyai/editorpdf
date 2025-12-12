import React, { useState, useCallback } from 'react';
import { Image, Upload, X, Settings, Download, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './PDFToImages.css';

const PDFToImages = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    format: 'png',
    quality: 'high',
    dpi: 300,
    pages: 'all',
    customRange: '',
    colorMode: 'color'
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
        // Simulación de procesamiento PDF a imágenes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_images'),
          size: file.size,
          pageCount: Math.floor(Math.random() * 10) + 1,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'conversion',
            tool: 'pdf-to-images',
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
          pageCount: 0,
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
    link.download = `${file.processedName}.zip`;
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
    <div className="pdf-to-images-container">
      <div className="pdf-to-images-header">
        <div className="pdf-to-images-header-icon">
          <Image size={32} color="#667eea" />
        </div>
        <div className="pdf-to-images-header-content">
          <h1>PDF a Imágenes</h1>
          <p>Convierte páginas de documentos PDF a archivos de imagen individuales</p>
        </div>
      </div>

      <div className="pdf-to-images-content">
        <div className="pdf-to-images-upload-section">
          <div
            className={`pdf-to-images-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="pdf-to-images-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="pdf-to-images-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="pdf-to-images-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="pdf-to-images-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="pdf-to-images-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pdf-to-images-settings-section">
          <div className="pdf-to-images-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Conversión</h3>
          </div>
          
          <div className="pdf-to-images-settings-grid">
            <div className="pdf-to-images-setting-item">
              <label>Formato de imagen:</label>
              <select
                value={settings.format}
                onChange={(e) => setSettings({...settings, format: e.target.value})}
                className="pdf-to-images-select"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="bmp">BMP</option>
                <option value="tiff">TIFF</option>
              </select>
            </div>

            <div className="pdf-to-images-setting-item">
              <label>Calidad:</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings({...settings, quality: e.target.value})}
                className="pdf-to-images-select"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="maximum">Máxima</option>
              </select>
            </div>

            <div className="pdf-to-images-setting-item">
              <label>DPI:</label>
              <select
                value={settings.dpi}
                onChange={(e) => setSettings({...settings, dpi: parseInt(e.target.value)})}
                className="pdf-to-images-select"
              >
                <option value="72">72 DPI (Web)</option>
                <option value="150">150 DPI (Estándar)</option>
                <option value="300">300 DPI (Alta)</option>
                <option value="600">600 DPI (Muy Alta)</option>
              </select>
            </div>

            <div className="pdf-to-images-setting-item">
              <label>Páginas a convertir:</label>
              <select
                value={settings.pages}
                onChange={(e) => setSettings({...settings, pages: e.target.value})}
                className="pdf-to-images-select"
              >
                <option value="all">Todas las páginas</option>
                <option value="first">Primera página</option>
                <option value="last">Última página</option>
                <option value="custom">Rango personalizado</option>
              </select>
            </div>

            {settings.pages === 'custom' && (
              <div className="pdf-to-images-setting-item">
                <label>Rango de páginas (ej: 1-5,8,10-12):</label>
                <input
                  type="text"
                  value={settings.customRange}
                  onChange={(e) => setSettings({...settings, customRange: e.target.value})}
                  placeholder="1-5,8,10-12"
                  className="pdf-to-images-input"
                />
              </div>
            )}

            <div className="pdf-to-images-setting-item">
              <label>Modo de color:</label>
              <select
                value={settings.colorMode}
                onChange={(e) => setSettings({...settings, colorMode: e.target.value})}
                className="pdf-to-images-select"
              >
                <option value="color">Color</option>
                <option value="grayscale">Escala de grises</option>
                <option value="blackwhite">Blanco y negro</option>
              </select>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="pdf-to-images-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="pdf-to-images-process-btn"
            >
              {processing ? 'Procesando...' : 'Convertir a Imágenes'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="pdf-to-images-results-section">
            <h3>Resultados:</h3>
            <div className="pdf-to-images-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="pdf-to-images-result-item">
                  <div className="pdf-to-images-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="pdf-to-images-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="pdf-to-images-result-converted">
                          → {file.processedName} ({file.pageCount} imágenes)
                        </div>
                      ) : (
                        <div className="pdf-to-images-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="pdf-to-images-download-btn"
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

export default PDFToImages;