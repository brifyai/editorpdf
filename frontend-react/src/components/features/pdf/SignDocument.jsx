import React, { useState, useCallback } from 'react';
import { PenTool, Upload, X, Settings, Download, FileText, CheckCircle, Type, Image } from 'lucide-react';
import axios from 'axios';
import './SignDocument.css';

const SignDocument = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    signatureType: 'draw',
    signatureText: '',
    signatureFont: 'Script MT',
    signatureColor: '#000000',
    position: 'bottom-right',
    page: 'last',
    size: 'medium',
    opacity: 100,
    certify: false
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
        // Simulación de procesamiento de firma
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_signed.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'signing',
            tool: 'sign-document',
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
    <div className="sign-document-container">
      <div className="sign-document-header">
        <div className="sign-document-header-icon">
          <PenTool size={32} color="#667eea" />
        </div>
        <div className="sign-document-header-content">
          <h1>Firmar Documento</h1>
          <p>Añade firmas digitales o manuscritas a tus documentos PDF de forma segura</p>
        </div>
      </div>

      <div className="sign-document-content">
        <div className="sign-document-upload-section">
          <div
            className={`sign-document-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="sign-document-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="sign-document-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="sign-document-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="sign-document-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="sign-document-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sign-document-settings-section">
          <div className="sign-document-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Firma</h3>
          </div>
          
          <div className="sign-document-settings-grid">
            <div className="sign-document-setting-group">
              <h4>Tipo de Firma</h4>
              <div className="sign-document-signature-types">
                <button
                  onClick={() => setSettings({...settings, signatureType: 'draw'})}
                  className={`sign-document-signature-type-btn ${settings.signatureType === 'draw' ? 'active' : ''}`}
                >
                  <PenTool size={20} />
                  Dibujar Firma
                </button>
                <button
                  onClick={() => setSettings({...settings, signatureType: 'text'})}
                  className={`sign-document-signature-type-btn ${settings.signatureType === 'text' ? 'active' : ''}`}
                >
                  <Type size={20} />
                  Firma de Texto
                </button>
                <button
                  onClick={() => setSettings({...settings, signatureType: 'image'})}
                  className={`sign-document-signature-type-btn ${settings.signatureType === 'image' ? 'active' : ''}`}
                >
                  <Image size={20} />
                  Subir Imagen
                </button>
              </div>
            </div>

            {settings.signatureType === 'text' && (
              <div className="sign-document-setting-item">
                <label>Texto de la firma:</label>
                <input
                  type="text"
                  value={settings.signatureText}
                  onChange={(e) => setSettings({...settings, signatureText: e.target.value})}
                  placeholder="Juan Pérez"
                  className="sign-document-input"
                />
              </div>
            )}

            {settings.signatureType === 'text' && (
              <div className="sign-document-setting-item">
                <label>Fuente de la firma:</label>
                <select
                  value={settings.signatureFont}
                  onChange={(e) => setSettings({...settings, signatureFont: e.target.value})}
                  className="sign-document-select"
                >
                  <option value="Script MT">Script MT</option>
                  <option value="Brush Script">Brush Script</option>
                  <option value="Segoe Script">Segoe Script</option>
                  <option value="Kunstler Script">Kunstler Script</option>
                </select>
              </div>
            )}

            <div className="sign-document-setting-item">
              <label>Color de la firma:</label>
              <div className="sign-document-color-input-wrapper">
                <input
                  type="color"
                  value={settings.signatureColor}
                  onChange={(e) => setSettings({...settings, signatureColor: e.target.value})}
                  className="sign-document-color-input"
                />
                <span>{settings.signatureColor}</span>
              </div>
            </div>

            <div className="sign-document-setting-item">
              <label>Posición:</label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({...settings, position: e.target.value})}
                className="sign-document-select"
              >
                <option value="bottom-right">Inferior Derecha</option>
                <option value="bottom-left">Inferior Izquierda</option>
                <option value="top-right">Superior Derecha</option>
                <option value="top-left">Superior Izquierda</option>
                <option value="center">Centro</option>
              </select>
            </div>

            <div className="sign-document-setting-item">
              <label>Página:</label>
              <select
                value={settings.page}
                onChange={(e) => setSettings({...settings, page: e.target.value})}
                className="sign-document-select"
              >
                <option value="first">Primera página</option>
                <option value="last">Última página</option>
                <option value="all">Todas las páginas</option>
              </select>
            </div>

            <div className="sign-document-setting-item">
              <label>Tamaño:</label>
              <select
                value={settings.size}
                onChange={(e) => setSettings({...settings, size: e.target.value})}
                className="sign-document-select"
              >
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="sign-document-setting-item">
              <label>Opacidad:</label>
              <div className="sign-document-range-wrapper">
                <input
                  type="range"
                  value={settings.opacity}
                  onChange={(e) => setSettings({...settings, opacity: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="sign-document-range"
                />
                <span>{settings.opacity}%</span>
              </div>
            </div>

            <div className="sign-document-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.certify}
                  onChange={(e) => setSettings({...settings, certify: e.target.checked})}
                />
                Certificar documento (sello digital)
              </label>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="sign-document-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="sign-document-process-btn"
            >
              {processing ? 'Procesando...' : 'Firmar Documento'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="sign-document-results-section">
            <h3>Resultados:</h3>
            <div className="sign-document-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="sign-document-result-item">
                  <div className="sign-document-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="sign-document-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="sign-document-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="sign-document-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="sign-document-download-btn"
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

export default SignDocument;