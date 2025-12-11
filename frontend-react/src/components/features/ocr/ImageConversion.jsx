import React, { useState, useRef, useCallback } from 'react';
import './ImageConversion.css';

const ImageConversion = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('pdf');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const outputFormats = [
    { value: 'pdf', label: 'PDF', description: 'Documento PDF' },
    { value: 'docx', label: 'DOCX', description: 'Documento Word' },
    { value: 'txt', label: 'TXT', description: 'Archivo de texto' },
    { value: 'html', label: 'HTML', description: 'Página web' }
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((newFiles) => {
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`El archivo ${file.name} no es un formato válido. Solo se permiten JPG, PNG, WebP y TIFF.`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo es 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      simulateConversion(validFiles);
    }
  }, []);

  const simulateConversion = useCallback((filesToConvert) => {
    setIsConverting(true);
    setConversionProgress(0);

    const interval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConverting(false);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setConversionProgress(100);
      setIsConverting(false);
    }, filesToConvert.length * 2500);
  }, []);

  const removeFile = useCallback((indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    );
  };

  const getOutputFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          </svg>
        );
      case 'docx':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
            <path d="M14 2V8H20"/>
          </svg>
        );
      case 'txt':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
            <path d="M16 13H8"/>
            <path d="M16 17H8"/>
            <path d="M10 9H8"/>
          </svg>
        );
      case 'html':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="image-conversion-container">
      <div className="image-conversion-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Conversión de Imágenes</h1>
            <p>Convierte imágenes a diferentes formatos de documento</p>
          </div>
        </div>
      </div>

      <div className="conversion-options">
        <div className="format-selector">
          <label htmlFor="output-format">Formato de salida:</label>
          <div className="format-options">
            {outputFormats.map(format => (
              <div 
                key={format.value}
                className={`format-option ${outputFormat === format.value ? 'selected' : ''}`}
                onClick={() => setOutputFormat(format.value)}
              >
                <div className="format-icon">
                  {getOutputFormatIcon(format.value)}
                </div>
                <div className="format-info">
                  <span className="format-label">{format.label}</span>
                  <span className="format-description">{format.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="upload-section">
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isConverting ? 'converting' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.tiff"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            {isConverting ? (
              <div className="conversion-progress">
                <div className="progress-circle">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 25}`}
                      strokeDashoffset={`${2 * Math.PI * 25 * (1 - conversionProgress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                      className="progress-circle-animated"
                    />
                  </svg>
                  <span className="progress-text">{Math.round(conversionProgress)}%</span>
                </div>
                <p className="progress-message">Convirtiendo a {outputFormats.find(f => f.value === outputFormat)?.label}...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <path d="M7 10l5 5 5-5"/>
                    <path d="M12 15V3"/>
                  </svg>
                </div>
                <div className="upload-text">
                  <h3>Arrastra imágenes aquí para convertir</h3>
                  <p className="upload-formats">
                    <span className="formats-label">Formatos soportados:</span>
                    <span className="formats-list">JPG, PNG, WebP, TIFF</span>
                    <span className="formats-size">(máx. 10MB)</span>
                  </p>
                </div>
                <button className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <path d="M7 10l5 5 5-5"/>
                    <path d="M12 15V3"/>
                  </svg>
                  Seleccionar Imágenes
                </button>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="files-list">
            <h3>Imágenes seleccionadas ({files.length})</h3>
            <div className="files-grid">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="conversion-target">
                    <span className="target-label">→ {outputFormats.find(f => f.value === outputFormat)?.label}</span>
                  </div>
                  <button 
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    disabled={isConverting}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="features-section">
        <h3>Características de Conversión</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h4>Alta Calidad</h4>
            <p>Conversión manteniendo la máxima calidad de imagen y texto</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h4>Procesamiento Rápido</h4>
            <p>Conversión en segundos con tecnología optimizada</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4>Múltiples Formatos</h4>
            <p>Conversión a PDF, DOCX, TXT y HTML</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4>OCR Integrado</h4>
            <p>Extracción automática de texto durante la conversión</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConversion;
