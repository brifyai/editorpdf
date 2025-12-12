import React, { useState, useCallback } from 'react';
import { Lock, Upload, X, Settings, Download, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './ProtectPassword.css';

const ProtectPassword = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [settings, setSettings] = useState({
    password: '',
    confirmPassword: '',
    permissions: {
      printing: true,
      copying: true,
      modifying: true,
      annotating: true,
      fillingForms: true,
      extracting: true
    },
    encryptionLevel: '128'
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
    
    if (settings.password !== settings.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (settings.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setProcessing(true);
    const results = [];

    for (const file of files) {
      try {
        // Simulación de procesamiento de protección
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', '_protected.pdf'),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'security',
            tool: 'protect-password',
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

  const togglePermission = (permission) => {
    setSettings({
      ...settings,
      permissions: {
        ...settings.permissions,
        [permission]: !settings.permissions[permission]
      }
    });
  };

  return (
    <div className="protect-password-container">
      <div className="protect-password-header">
        <div className="protect-password-header-icon">
          <Lock size={32} color="#667eea" />
        </div>
        <div className="protect-password-header-content">
          <h1>Proteger con Contraseña</h1>
          <p>Añade seguridad a tus documentos PDF con protección por contraseña</p>
        </div>
      </div>

      <div className="protect-password-content">
        <div className="protect-password-upload-section">
          <div
            className={`protect-password-upload-area ${dragActive ? 'drag-active' : ''}`}
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
              className="protect-password-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="protect-password-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="protect-password-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="protect-password-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="protect-password-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="protect-password-settings-section">
          <div className="protect-password-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Seguridad</h3>
          </div>
          
          <div className="protect-password-settings-grid">
            <div className="protect-password-setting-item">
              <label>Contraseña:</label>
              <div className="protect-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.password}
                  onChange={(e) => setSettings({...settings, password: e.target.value})}
                  placeholder="Ingresa una contraseña segura"
                  className="protect-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="protect-password-toggle-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="protect-password-setting-item">
              <label>Confirmar contraseña:</label>
              <div className="protect-password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                  placeholder="Repite la contraseña"
                  className="protect-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="protect-password-toggle-btn"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="protect-password-setting-item">
              <label>Nivel de encriptación:</label>
              <select
                value={settings.encryptionLevel}
                onChange={(e) => setSettings({...settings, encryptionLevel: e.target.value})}
                className="protect-password-select"
              >
                <option value="128">128-bit (estándar)</option>
                <option value="256">256-bit (alta seguridad)</option>
              </select>
            </div>

            <div className="protect-password-permissions-group">
              <h4>Permisos del documento:</h4>
              <div className="protect-password-permissions-grid">
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.printing}
                      onChange={() => togglePermission('printing')}
                    />
                    Permitir impresión
                  </label>
                </div>
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.copying}
                      onChange={() => togglePermission('copying')}
                    />
                    Permitir copiar texto
                  </label>
                </div>
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.modifying}
                      onChange={() => togglePermission('modifying')}
                    />
                    Permitir modificación
                  </label>
                </div>
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.annotating}
                      onChange={() => togglePermission('annotating')}
                    />
                    Permitir anotaciones
                  </label>
                </div>
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.fillingForms}
                      onChange={() => togglePermission('fillingForms')}
                    />
                    Permitir rellenar formularios
                  </label>
                </div>
                <div className="protect-password-permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.permissions.extracting}
                      onChange={() => togglePermission('extracting')}
                    />
                    Permitir extracción de páginas
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="protect-password-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="protect-password-process-btn"
            >
              {processing ? 'Procesando...' : 'Proteger Documento'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="protect-password-results-section">
            <h3>Resultados:</h3>
            <div className="protect-password-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="protect-password-result-item">
                  <div className="protect-password-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="protect-password-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="protect-password-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="protect-password-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="protect-password-download-btn"
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

export default ProtectPassword;