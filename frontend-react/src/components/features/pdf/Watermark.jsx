import React, { useState, useCallback } from 'react';
import { Droplets, Upload, X, Settings, Download, FileText, CheckCircle, Type, Image } from 'lucide-react';
import axios from 'axios';
import './Watermark.css';

const Watermark = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    watermarkType: 'text',
    watermarkText: 'CONFIDENCIAL',
    watermarkFont: 'Arial',
    watermarkColor: '#000000',
    watermarkSize: 48,
    opacity: 30,
    rotation: 45,
    position: 'center',
    repeat: true,
    pageRange: 'all'
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
        // Simulación de procesamiento de marca de agua
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_watermarked.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'protection',
            tool: 'watermark',
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
    <div className="watermark-container">
      <div className="watermark-header">
        <div className="watermark-header-icon">
          <Droplets size={32} color="#667eea" />
        </div>
        <div className="watermark-header-content">
          <h1>Marca de Agua</h1>
          <p>Añade marcas de agua personalizadas para proteger tus documentos PDF</p>
        </div>
      </div>

      <div className="watermark-content">
        <div className="watermark-upload-section">
          <div
            className={`watermark-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="watermark-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="watermark-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="watermark-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="watermark-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="watermark-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="watermark-settings-section">
          <div className="watermark-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Marca de Agua</h3>
          </div>
          
          <div className="watermark-settings-grid">
            <div className="watermark-setting-group">
              <h4>Tipo de Marca de Agua</h4>
              <div className="watermark-watermark-types">
                <button
                  onClick={() => setSettings({...settings, watermarkType: 'text'})}
                  className={`watermark-watermark-type-btn ${settings.watermarkType === 'text' ? 'active' : ''}`}
                >
                  <Type size={20} />
                  Texto
                </button>
                <button
                  onClick={() => setSettings({...settings, watermarkType: 'image'})}
                  className={`watermark-watermark-type-btn ${settings.watermarkType === 'image' ? 'active' : ''}`}
                >
                  <Image size={20} />
                  Imagen
                </button>
              </div>
            </div>

            {settings.watermarkType === 'text' && (
              <div className="watermark-setting-item">
                <label>Texto de la marca de agua:</label>
                <input
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => setSettings({...settings, watermarkText: e.target.value})}
                  placeholder="CONFIDENCIAL"
                  className="watermark-input"
                />
              </div>
            )}

            {settings.watermarkType === 'text' && (
              <div className="watermark-setting-item">
                <label>Fuente:</label>
                <select
                  value={settings.watermarkFont}
                  onChange={(e) => setSettings({...settings, watermarkFont: e.target.value})}
                  className="watermark-select"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            )}

            <div className="watermark-setting-item">
              <label>Color:</label>
              <div className="watermark-color-input-wrapper">
                <input
                  type="color"
                  value={settings.watermarkColor}
                  onChange={(e) => setSettings({...settings, watermarkColor: e.target.value})}
                  className="watermark-color-input"
                />
                <span>{settings.watermarkColor}</span>
              </div>
            </div>

            <div className="watermark-setting-item">
              <label>Tamaño:</label>
              <div className="watermark-range-wrapper">
                <input
                  type="range"
                  value={settings.watermarkSize}
                  onChange={(e) => setSettings({...settings, watermarkSize: parseInt(e.target.value)})}
                  min="12"
                  max="120"
                  className="watermark-range"
                />
                <span>{settings.watermarkSize}px</span>
              </div>
            </div>

            <div className="watermark-setting-item">
              <label>Opacidad:</label>
              <div className="watermark-range-wrapper">
                <input
                  type="range"
                  value={settings.opacity}
                  onChange={(e) => setSettings({...settings, opacity: parseInt(e.target.value)})}
                  min="10"
                  max="100"
                  className="watermark-range"
                />
                <span>{settings.opacity}%</span>
              </div>
            </div>

            <div className="watermark-setting-item">
              <label>Rotación:</label>
              <div className="watermark-range-wrapper">
                <input
                  type="range"
                  value={settings.rotation}
                  onChange={(e) => setSettings({...settings, rotation: parseInt(e.target.value)})}
                  min="0"
                  max="360"
                  className="watermark-range"
                />
                <span>{settings.rotation}°</span>
              </div>
            </div>

            <div className="watermark-setting-item">
              <label>Posición:</label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({...settings, position: e.target.value})}
                className="watermark-select"
              >
                <option value="center">Centro</option>
                <option value="top-left">Superior Izquierda</option>
                <option value="top-right">Superior Derecha</option>
                <option value="bottom-left">Inferior Izquierda</option>
                <option value="bottom-right">Inferior Derecha</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            <div className="watermark-setting-item">
              <label>Rango de páginas:</label>
              <select
                value={settings.pageRange}
                onChange={(e) => setSettings({...settings, pageRange: e.target.value})}
                className="watermark-select"
              >
                <option value="all">Todas las páginas</option>
                <option value="first">Primera página</option>
                <option value="last">Última página</option>
                <option value="odd">Páginas impares</option>
                <option value="even">Páginas pares</option>
              </select>
            </div>

            <div className="watermark-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.repeat}
                  onChange={(e) => setSettings({...settings, repeat: e.target.checked})}
                />
                Repetir marca de agua
              </label>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="watermark-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="watermark-process-btn"
            >
              {processing ? 'Procesando...' : 'Aplicar Marca de Agua'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="watermark-results-section">
            <h3>Resultados:</h3>
            <div className="watermark-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="watermark-result-item">
                  <div className="watermark-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="watermark-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="watermark-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="watermark-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="watermark-download-btn"
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

export default Watermark;