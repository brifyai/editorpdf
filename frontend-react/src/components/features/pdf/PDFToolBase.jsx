import React, { useState } from 'react';
import { Upload, FileText, Download, X } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import './PDFToolBase.css';

const PDFToolBase = ({ 
  title, 
  subtitle, 
  icon, 
  gradient,
  toolConfig,
  onProcess 
}) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState({});
  const { showSuccess, showError } = useSweetAlert();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      if (toolConfig.accept === 'pdf') {
        return file.type === 'application/pdf';
      }
      return true;
    });
    
    if (validFiles.length !== droppedFiles.length) {
      showError('Error', `Solo se permiten archivos ${toolConfig.accept === 'pdf' ? 'PDF' : toolConfig.accept}`);
      return;
    }
    
    addFiles(validFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      if (toolConfig.accept === 'pdf') {
        return file.type === 'application/pdf';
      }
      return true;
    });
    
    if (validFiles.length !== selectedFiles.length) {
      showError('Error', `Solo se permiten archivos ${toolConfig.accept === 'pdf' ? 'PDF' : toolConfig.accept}`);
      return;
    }
    
    addFiles(validFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      order: files.length + index
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcess = async () => {
    if (toolConfig.minFiles && files.length < toolConfig.minFiles) {
      showError('Error', `Necesitas al menos ${toolConfig.minFiles} archivo(s)`);
      return;
    }

    if (toolConfig.maxFiles && files.length > toolConfig.maxFiles) {
      showError('Error', `Máximo ${toolConfig.maxFiles} archivo(s) permitido(s)`);
      return;
    }

    setIsProcessing(true);
    
    try {
      await onProcess(files, config);
      showSuccess('¡Éxito!', toolConfig.successMessage || 'Proceso completado correctamente');
      setFiles([]);
      setConfig({});
    } catch (error) {
      showError('Error', toolConfig.errorMessage || 'No se pudo completar el proceso');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderConfigOptions = () => {
    if (!toolConfig.options) return null;

    return (
      <div className="config-options">
        <h3>Configuración</h3>
        {toolConfig.options.map((option, index) => (
          <div key={index} className="config-option">
            <label>{option.label}</label>
            {option.type === 'select' ? (
              <select 
                value={config[option.key] || option.default || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [option.key]: e.target.value }))}
              >
                {option.values.map((value, vIndex) => (
                  <option key={vIndex} value={value.value}>{value.label}</option>
                ))}
              </select>
            ) : option.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={config[option.key] || false}
                onChange={(e) => setConfig(prev => ({ ...prev, [option.key]: e.target.checked }))}
              />
            ) : (
              <input
                type={option.type || 'text'}
                value={config[option.key] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [option.key]: e.target.value }))}
                placeholder={option.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pdf-tool-container">
      <div className="pdf-tool-header" style={{ background: gradient }}>
        <div className="header-icon">{icon}</div>
        <div className="header-content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="pdf-tool-content">
        {/* Zona de carga */}
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra archivos aquí</h3>
          <p>o haz clic para seleccionar archivos</p>
          <input
            id="file-input"
            type="file"
            multiple={toolConfig.maxFiles !== 1}
            accept={toolConfig.accept === 'pdf' ? '.pdf' : undefined}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button className="select-files-btn">
            Seleccionar Archivos
          </button>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos seleccionados ({files.length})</h3>
            <div className="files-container">
              {files
                .sort((a, b) => a.order - b.order)
                .map((fileItem, index) => (
                <div key={fileItem.id} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{fileItem.name}</span>
                      <span className="file-size">{formatFileSize(fileItem.size)}</span>
                    </div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFile(fileItem.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opciones de configuración */}
        {renderConfigOptions()}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="tool-actions">
            <button 
              className="process-btn"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  {toolConfig.actionButton || 'Procesar'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFToolBase;