import React, { useState, useCallback } from 'react';
import { Unlock, Upload, X, Settings, Download, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './UnlockPDF.css';

const UnlockPDF = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    password: '',
    removeRestrictions: true,
    keepPassword: false
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
    
    if (!settings.password) {
      alert('Por favor ingresa la contraseña del PDF');
      return;
    }
    
    setProcessing(true);
    const results = [];

    for (const file of files) {
      try {
        // Simulación de procesamiento de desbloqueo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_unlocked.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'security',
            tool: 'unlock-pdf',
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
    <div className="unlock-pdf-container">
      <div className="unlock-pdf-header">
        <div className="unlock-pdf-header-icon">
          <Unlock size={32} color="#667eea" />
        </div>
        <div className="unlock-pdf-header-content">
          <h1>Desbloquear PDF</h1>
          <p>Elimina la contraseña y restricciones de tus documentos PDF protegidos</p>
        </div>
      </div>

      <div className="unlock-pdf-content">
        <div className="unlock-pdf-upload-section">
          <div
            className={`unlock-pdf-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="unlock-pdf-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="unlock-pdf-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="unlock-pdf-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="unlock-pdf-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="unlock-pdf-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="unlock-pdf-settings-section">
          <div className="unlock-pdf-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Desbloqueo</h3>
          </div>
          
          <div className="unlock-pdf-settings-grid">
            <div className="unlock-pdf-setting-item">
              <label>Contraseña del PDF:</label>
              <div className="unlock-pdf-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.password}
                  onChange={(e) => setSettings({...settings, password: e.target.value})}
                  placeholder="Ingresa la contraseña del PDF"
                  className="unlock-pdf-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="unlock-pdf-toggle-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="unlock-pdf-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.removeRestrictions}
                  onChange={(e) => setSettings({...settings, removeRestrictions: e.target.checked})}
                />
                Eliminar todas las restricciones del documento
              </label>
            </div>

            <div className="unlock-pdf-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.keepPassword}
                  onChange={(e) => setSettings({...settings, keepPassword: e.target.checked})}
                />
                Mantener la contraseña (solo eliminar restricciones)
              </label>
            </div>

            <div className="unlock-pdf-info-box">
              <h4>Información de seguridad:</h4>
              <ul>
                <li>Esta herramienta solo funciona con PDFs que conoces la contraseña</li>
                <li>El proceso de desbloqueo se realiza localmente en tu navegador</li>
                <li>Tus archivos y contraseñas nunca se envían a servidores externos</li>
                <li>Podrás eliminar restricciones de impresión, copia y modificación</li>
              </ul>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="unlock-pdf-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="unlock-pdf-process-btn"
            >
              {processing ? 'Procesando...' : 'Desbloquear PDF'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="unlock-pdf-results-section">
            <h3>Resultados:</h3>
            <div className="unlock-pdf-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="unlock-pdf-result-item">
                  <div className="unlock-pdf-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="unlock-pdf-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="unlock-pdf-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="unlock-pdf-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="unlock-pdf-download-btn"
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

export default UnlockPDF;